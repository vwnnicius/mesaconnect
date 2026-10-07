"use client";
import { useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { AssetImage } from "@/components/ui/AssetImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { uploadAsset, storeDemoWorkspace } from "@/services/workspaceService";
import { roleName } from "@/lib/workspace-types";
export default function ProfilePage() {
  const w = useWorkspace();
  const [name, setName] = useState(w.profile.name);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (file?: File) => {
    setBusy(true);
    try {
      const avatar_path = file
        ? await uploadAsset(file, w.restaurant.id, "avatar", w.profile.id)
        : w.profile.avatar_path;
      const patch = { name: name.trim(), avatar_path };
      if (w.demo)
        storeDemoWorkspace(
          w.restaurant,
          w.members.map((m) =>
            m.id === w.profile.id ? { ...m, ...patch } : m,
          ),
        );
      else {
        const { error } = await createClient()
          .from("profiles")
          .update(patch)
          .eq("id", w.profile.id);
        if (error) throw error;
      }
      await w.refresh();
      setMessage("Perfil atualizado.");
    } catch {
      setMessage(
        "Não foi possível salvar o perfil. Use uma imagem JPG, PNG ou WebP de até 2 MB.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Seu perfil"
        description="Como você aparece para a equipe."
      />
      <section className="surface settings-form">
        <div className="profile-portrait">
          <AssetImage path={w.profile.avatar_path} name={w.profile.name} />
          <div>
            <strong>{w.profile.name}</strong>
            <p>
              {w.platformAdmin
                ? "Administrador geral"
                : roleName[w.profile.role]}
            </p>
          </div>
        </div>
        <label>
          Foto de perfil
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void save(f);
            }}
          />
        </label>
        <label>
          Nome
          <input
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          className="action-solid"
          disabled={busy || !name.trim()}
          onClick={() => void save()}
        >
          {busy ? "Salvando…" : "Salvar perfil"}
        </button>
        {message && <p role="status">{message}</p>}
      </section>
    </div>
  );
}
