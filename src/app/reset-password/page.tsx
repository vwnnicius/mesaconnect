"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="workspace-gate">
      <form
        className="surface settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await createClient().auth.updateUser({ password });
          setMessage(
            error
              ? "Link inválido ou expirado. Solicite uma nova recuperação no login."
              : "Senha atualizada. Você já pode entrar.",
          );
          setPassword("");
          setBusy(false);
        }}
      >
        <h1>Escolha sua nova senha</h1>
        <label>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="action-solid" disabled={busy}>
          Salvar senha
        </button>
        {message && <p role="status">{message}</p>}
        <a href="/login">Voltar ao login</a>
      </form>
    </main>
  );
}
