import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
const manrope = localFont({
  src: "../../public/fonts/Manrope.ttf",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});
const fraunces = localFont({
  src: "../../public/fonts/Fraunces.ttf",
  variable: "--font-fraunces",
  display: "swap",
  weight: "100 900",
});
import "./globals.css";
import "./hospitality.css";

export const metadata: Metadata = {
  title: "MesaConnect — Atendimento por mesa em tempo real",
  description:
    "Painel operacional para restaurantes e rodízios: chamados da mesa, mapa do salão e SLA da equipe.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
