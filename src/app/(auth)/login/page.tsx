"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BrandMark } from "@/components/layout/BrandMark";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (isSupabaseConfigured()) {
        const { error } = await createClient().auth.signInWithPassword({
          email: email.includes("@")
            ? email.trim()
            : `${email.trim().toLowerCase()}@login.mesaconnect.invalid`,
          password,
        });
        if (error) throw error;
      }
      if (!isSupabaseConfigured()) {
        router.push("/dashboard");
        return;
      }
      const { data: who } = await createClient().auth.getUser();
      const { data: profile } = await createClient()
        .from("profiles")
        .select("role")
        .eq("id", who.user?.id || "")
        .maybeSingle();
      router.push(profile?.role === "WAITER" ? "/calls" : "/dashboard");
      router.refresh();
    } catch {
      setMessage("Não foi possível entrar. Confira o login e a senha.");
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!email.includes("@")) {
      setMessage(
        "Para recuperar seu login, contate o gerente. Administradores com e-mail podem receber um link.",
      );
      return;
    }
    if (!email.trim()) {
      setMessage("Preencha seu e-mail para receber o link de recuperação.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${location.origin}/auth/callback?next=/reset-password` },
      );
      if (error) throw error;
      setMessage(
        "Se houver uma conta com este e-mail, você receberá o link de recuperação.",
      );
    } catch {
      setMessage("Não foi possível solicitar a recuperação agora.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="login-page">
      <div className="login-theme">
        <ThemeToggle />
      </div>
      <section className="login-story">
        <Image
          src="/images/restaurant-hospitality.png"
          alt=""
          fill
          priority
          sizes="(min-width:1024px) 50vw, 1px"
          className="login-photo"
        />
        <Link href="/demo" className="brand-wordmark">
          <BrandMark />
          <span>
            Mesa<span>Connect</span>
          </span>
        </Link>
        <div className="login-story-copy">
          <p className="eyebrow">Feito para quem recebe bem</p>
          <h1>
            Atendimento
            <br />
            no tempo certo.
          </h1>
          <p>
            Um salão mais organizado.
            <br />
            Uma equipe mais presente.
            <br />
            Clientes que se sentem cuidados.
          </p>
          <div className="login-story-line" />
        </div>
        <div className="login-story-footer">
          <span>
            Mesas. Pessoas.
            <br />
            Boas experiências.
          </span>
          <span>MesaConnect</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <div className="brand-wordmark">
            <BrandMark />
            <span>
              Mesa<span>Connect</span>
            </span>
          </div>
          <h2>Bem-vindo de volta.</h2>
          <p>
            Entre na sua conta para acompanhar o atendimento do seu restaurante.
          </p>
          <form onSubmit={login}>
            <label htmlFor="login-email">Login ou e-mail</label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              required
              value={email}
              placeholder="empresa.seu-login"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login-password">Senha</label>
            <div className="password-field">
              <input
                id="login-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              className="forgot-password"
              type="button"
              disabled={busy}
              onClick={() => void reset()}
            >
              Esqueci minha senha
            </button>
            {message && (
              <p role="status" className="form-message">
                {message}
              </p>
            )}
            <button className="action-solid" disabled={busy} type="submit">
              {busy ? "Entrando…" : "Entrar"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-divider">
            <span />
            ou
            <span />
          </div>
          <Link href="/demo" className="action-outline">
            Acessar demonstração
            <ArrowRight size={17} />
          </Link>
          <p className="login-footnote">
            Tecnologia discreta para restaurantes mais humanos.
          </p>
        </div>
      </section>
    </main>
  );
}
