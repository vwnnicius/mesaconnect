import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
const geist = localFont({
  src: "../../public/fonts/Geist.ttf",
  variable: "--font-geist",
  display: "swap",
  weight: "100 900",
});
import "./globals.css";
import "./benservire.css";

export const metadata: Metadata = {
  title: "benservire — Tecnologia para servir melhor.",
  description:
    "Painel operacional para restaurantes e rodízios: chamados da mesa, mapa do salão e SLA da equipe.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var p=localStorage.getItem("mesaconnect-theme");document.documentElement.classList.toggle("dark",p?p==="dark":matchMedia("(prefers-color-scheme: dark)").matches)}catch{}',
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
