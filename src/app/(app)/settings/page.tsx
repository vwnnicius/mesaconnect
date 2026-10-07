"use client";
import { useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { AssetImage } from "@/components/ui/AssetImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { storeDemoWorkspace, uploadAsset } from "@/services/workspaceService";
import { roleName, type StaffProfile } from "@/lib/workspace-types";
import { useTables } from "@/hooks/useTables";
import { DevicePairing } from "@/components/settings/DevicePairing";
import { TableQRCode } from "@/components/settings/TableQRCode";
export default function SettingsPage() {
  const w = useWorkspace();
  const { tables } = useTables();
  const [tab, setTab] = useState("brand");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(w.restaurant.name);
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    password: "",
    role: "WAITER",
  });
  const [unit, setUnit] = useState({ name: "", slug: "", tables: 12 });
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await w.refresh();
      setMessage("Alterações salvas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  };
  const saveMember = async (
    member: StaffProfile,
    patch: Partial<StaffProfile>,
  ) => {
    if (w.demo) {
      storeDemoWorkspace(
        w.restaurant,
        w.members.map((p) => (p.id === member.id ? { ...p, ...patch } : p)),
      );
      return;
    }
    const { error } = await createClient()
      .from("profiles")
      .update(patch)
      .eq("id", member.id);
    if (error) throw new Error("Não foi possível atualizar este perfil.");
  };
  const invoke = async (body: Record<string, unknown>) => {
    if (w.demo)
      throw new Error("Cadastro de contas disponível no ambiente conectado.");
    const { data, error } = await createClient().functions.invoke(
      "workspace-admin",
      { body },
    );
    if (error || data?.error)
      throw new Error(data?.error || "Não foi possível concluir o cadastro.");
  };
  if (!w.manager)
    return (
      <div className="surface">
        <h1>Acesso da administração</h1>
        <p>Seu perfil está disponível na aba Perfil.</p>
      </div>
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="A identidade do seu restaurante e as pessoas que fazem parte dele."
      />
      <div className="workspace-tabs" role="group" aria-label="Configurações">
        {[
          ["brand", "Identidade visual"],
          ["team", "Equipe"],
          ["qr", "Links das mesas"],
          ["devices", "Dispositivos"],
          ...(w.platformAdmin ? [["units", "Estabelecimentos"]] : []),
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "brand" && (
        <section className="surface settings-form">
          <h2>Identidade do estabelecimento</h2>
          <p>
            Logo e foto de capa serão utilizados no painel e na experiência do
            cliente.
          </p>
          <label>
            Nome
            <input
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="asset-fields">
            {(["logo", "cover"] as const).map((kind) => (
              <label key={kind} className="asset-upload">
                <AssetImage
                  kind={kind}
                  path={
                    kind === "logo"
                      ? w.restaurant.logo_path
                      : w.restaurant.cover_path
                  }
                  name={w.restaurant.name}
                />
                <span>
                  {kind === "logo" ? "Logo do restaurante" : "Foto de capa"}
                </span>
                <small>JPG, PNG ou WebP · até 2 MB</small>
                <input
                  disabled={busy}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label={
                    kind === "logo" ? "Enviar logo" : "Enviar foto de capa"
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void run(async () => {
                        const path = await uploadAsset(
                          file,
                          w.restaurant.id,
                          kind,
                        );
                        const patch =
                          kind === "logo"
                            ? { logo_path: path }
                            : { cover_path: path };
                        if (w.demo)
                          storeDemoWorkspace(
                            { ...w.restaurant, ...patch },
                            w.members,
                          );
                        else {
                          const { error } = await createClient()
                            .from("restaurants")
                            .update(patch)
                            .eq("id", w.restaurant.id);
                          if (error)
                            throw new Error(
                              "Não foi possível salvar a imagem.",
                            );
                        }
                      });
                  }}
                />
              </label>
            ))}
          </div>
          <button
            className="action-solid"
            disabled={busy || !name.trim()}
            onClick={() =>
              void run(async () => {
                if (w.demo)
                  storeDemoWorkspace(
                    { ...w.restaurant, name: name.trim() },
                    w.members,
                  );
                else {
                  const { error } = await createClient()
                    .from("restaurants")
                    .update({ name: name.trim() })
                    .eq("id", w.restaurant.id);
                  if (error) throw new Error("Não foi possível salvar o nome.");
                }
              })
            }
          >
            Salvar identidade
          </button>
        </section>
      )}
      {tab === "team" && (
        <>
          <section className="surface">
            <h2>Equipe de {w.restaurant.name}</h2>
            <p className="section-description">
              Cada pessoa entra com sua própria conta. Desativar um perfil
              bloqueia o acesso ao estabelecimento.
            </p>
            <div className="staff-list">
              {w.members.map((member) => (
                <article className="staff-row" key={member.id}>
                  <AssetImage path={member.avatar_path} name={member.name} />
                  <div>
                    <strong>{member.name}</strong>
                    <small>
                      {roleName[member.role]} ·{" "}
                      {member.active === false ? "Inativo" : "Ativo"}
                    </small>
                  </div>
                  <input
                    aria-label={`Setor de ${member.name}`}
                    placeholder="Setor"
                    defaultValue={member.sector || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (member.sector || ""))
                        void run(() =>
                          saveMember(member, {
                            sector: e.target.value.slice(0, 60),
                          }),
                        );
                    }}
                  />
                  <select
                    disabled={busy || member.id === w.profile.id}
                    aria-label={`Papel de ${member.name}`}
                    value={member.role}
                    onChange={(e) =>
                      void run(() =>
                        saveMember(member, {
                          role: e.target.value as StaffProfile["role"],
                        }),
                      )
                    }
                  >
                    {(w.platformAdmin || w.profile.role === "OWNER") && (
                      <option value="OWNER">Administrador</option>
                    )}
                    <option value="MANAGER">Gerente</option>
                    <option value="WAITER">Garçom</option>
                  </select>
                  <label className="staff-photo-button">
                    Trocar foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          void run(async () =>
                            saveMember(member, {
                              avatar_path: await uploadAsset(
                                f,
                                w.restaurant.id,
                                "avatar",
                                member.id,
                              ),
                            }),
                          );
                      }}
                    />
                  </label>
                  <button
                    className="action-outline"
                    disabled={busy || member.id === w.profile.id}
                    onClick={() =>
                      void run(() =>
                        saveMember(member, { active: member.active === false }),
                      )
                    }
                  >
                    {member.active === false ? "Ativar" : "Desativar"}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <form
            className="surface settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await invoke({
                  action: "create_staff",
                  restaurant_id: w.restaurant.id,
                  ...staff,
                });
                setStaff({ name: "", email: "", password: "", role: "WAITER" });
              });
            }}
          >
            <h2>Adicionar pessoa</h2>
            <div className="form-grid">
              <label>
                Nome
                <input
                  required
                  maxLength={100}
                  value={staff.name}
                  onChange={(e) => setStaff({ ...staff, name: e.target.value })}
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  required
                  value={staff.email}
                  onChange={(e) =>
                    setStaff({ ...staff, email: e.target.value })
                  }
                />
              </label>
              <label>
                Senha inicial
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={staff.password}
                  onChange={(e) =>
                    setStaff({ ...staff, password: e.target.value })
                  }
                />
              </label>
              <label>
                Papel
                <select
                  value={staff.role}
                  onChange={(e) => setStaff({ ...staff, role: e.target.value })}
                >
                  <option value="WAITER">Garçom</option>
                  {(w.platformAdmin || w.profile.role === "OWNER") && (
                    <>
                      <option value="MANAGER">Gerente</option>
                      <option value="OWNER">
                        Administrador do estabelecimento
                      </option>
                    </>
                  )}
                </select>
              </label>
            </div>
            <p>
              A conta fica vinculada a este estabelecimento. A senha é enviada
              apenas ao serviço de autenticação.
            </p>
            <button className="action-solid" disabled={busy}>
              Criar acesso
            </button>
          </form>
        </>
      )}
      {tab === "devices" && <DevicePairing />}
      {tab === "qr" && (
        <section className="surface">
          <h2>Avaliação por mesa</h2>
          <p className="section-description">
            Abra o link para visualizar a experiência do cliente ou copie o
            endereço para gerar o QR do seu material.
          </p>
          <div className="qr-links">
            {tables.map((t) => (
              <div key={t.id}>
                <strong>Mesa {t.number}</strong>
                <a
                  className="action-outline"
                  href={`/evaluate/${w.restaurant.slug}/${t.number}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir avaliação
                </a>
                <button
                  className="action-outline"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(
                        `${location.origin}/evaluate/${w.restaurant.slug}/${t.number}`,
                      )
                      .then(() => setMessage("Link copiado."))
                      .catch(() =>
                        setMessage(
                          "Não foi possível copiar. Abra o link para obter o endereço.",
                        ),
                      )
                  }
                >
                  Copiar link
                </button>
                <TableQRCode slug={w.restaurant.slug} number={t.number} />
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === "units" && (
        <>
          <section className="surface">
            <h2>Seus estabelecimentos</h2>
            <div className="unit-list">
              {w.units.map((u) => (
                <button
                  key={u.id}
                  className="unit-row"
                  onClick={() => w.selectUnit(u.id)}
                >
                  <AssetImage kind="logo" path={u.logo_path} name={u.name} />
                  <strong>{u.name}</strong>
                  <span>
                    {u.id === w.restaurant.id
                      ? "Unidade atual"
                      : "Abrir unidade →"}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <form
            className="surface settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await invoke({ action: "create_unit", ...unit });
                setUnit({ name: "", slug: "", tables: 12 });
              });
            }}
          >
            <h2>Novo estabelecimento</h2>
            <label>
              Nome
              <input
                required
                maxLength={100}
                value={unit.name}
                onChange={(e) => setUnit({ ...unit, name: e.target.value })}
              />
            </label>
            <label>
              Endereço dos links
              <input
                required
                pattern="[a-z0-9-]{3,60}"
                placeholder="restaurante-aurora"
                value={unit.slug}
                onChange={(e) => setUnit({ ...unit, slug: e.target.value })}
              />
            </label>
            <label>
              Quantidade inicial de mesas
              <input
                required
                type="number"
                min={1}
                max={80}
                value={unit.tables}
                onChange={(e) =>
                  setUnit({ ...unit, tables: Number(e.target.value) })
                }
              />
            </label>
            <button className="action-solid" disabled={busy}>
              Criar estabelecimento
            </button>
          </form>
        </>
      )}
      {message && (
        <p role="status" className="form-message">
          {message}
        </p>
      )}
      {busy && <p role="status">Salvando…</p>}
    </div>
  );
}
