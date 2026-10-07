"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const preference = localStorage.getItem("mesaconnect-theme");
    const value = preference
      ? preference === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", value);
    setDark(value);
    const sync = () =>
      setDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("mesaconnect-theme", sync);
    return () => window.removeEventListener("mesaconnect-theme", sync);
  }, []);
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => {
        const value = !dark;
        setDark(value);
        localStorage.setItem("mesaconnect-theme", value ? "dark" : "light");
        document.documentElement.classList.toggle("dark", value);
        window.dispatchEvent(new Event("mesaconnect-theme"));
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
