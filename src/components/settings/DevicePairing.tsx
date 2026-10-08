"use client";
import { useState } from "react";
import { useTables } from "@/hooks/useTables";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/providers/WorkspaceProvider";
export function DevicePairing() {
  const { tables } = useTables();
  const { demo, platformAdmin } = useWorkspace();
  const [credentials, setCredentials] = useState<{
    uid: string;
    token: string;
    number: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pair = async (id: string, number: string) => {
    setBusy(true);
    setError("");
    setCredentials(null);
    try {
      const { data, error } = await createClient().rpc("pair_table_device", {
        target: id,
      });
      if (error || !data) throw error;
      const value = data as { device_uid: string; token: string };
      setCredentials({ uid: value.device_uid, token: value.token, number });
    } catch {
      setError("Não foi possível gerar o pareamento.");
    } finally {
      setBusy(false);
    }
  };
  if (!platformAdmin)
    return <p>Dispositivos são configurados pelo administrador geral.</p>;
  return (
    <section className="surface">
      <h2>Dispositivos das mesas</h2>
      <p className="section-description">
        Cada ESP32 recebe um identificador e uma credencial exclusiva. Parear
        novamente invalida a credencial anterior.
      </p>
      <details className="section-description">
        <summary>Como conectar o equipamento</summary>
        <p className="mt-3">
          Configure Wi-Fi, identificador, token e o endereço HTTPS do
          benservire na placa. O botão envia CALL; o sinal de vida envia
          HEARTBEAT. Use o token no cabeçalho Authorization: Bearer. O
          equipamento não recebe credenciais administrativas do Supabase.
        </p>
      </details>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {credentials && (
        <div className="device-credentials">
          <h3>Mesa {credentials.number} · Pareamento criado</h3>
          <p>
            Copie para a placa agora. O token não poderá ser consultado depois.
          </p>
          <label>
            Identificador
            <input readOnly value={credentials.uid} />
          </label>
          <label>
            Token
            <input
              readOnly
              type="password"
              autoComplete="off"
              value={credentials.token}
            />
          </label>
          <button
            className="action-outline"
            onClick={() =>
              void navigator.clipboard
                .writeText(
                  JSON.stringify({
                    device_uid: credentials.uid,
                    token: credentials.token,
                    url: `${location.origin}/api/device/events`,
                  }),
                )
                .catch(() =>
                  setError(
                    "Não foi possível copiar. Selecione os campos manualmente.",
                  ),
                )
            }
          >
            Copiar configuração
          </button>
          <button
            className="action-outline"
            onClick={() => setCredentials(null)}
          >
            Fechar credencial
          </button>
        </div>
      )}
      <div className="qr-links">
        {tables.map((t) => (
          <div key={t.id}>
            <strong>Mesa {t.number}</strong>
            <button
              className="action-outline"
              disabled={busy || demo}
              onClick={() => void pair(t.id, t.number)}
            >
              {t.device_id ? "Renovar pareamento" : "Parear dispositivo"}
            </button>
          </div>
        ))}
      </div>
      {demo && (
        <p className="section-description">
          Pareamento disponível no ambiente conectado.
        </p>
      )}
    </section>
  );
}
