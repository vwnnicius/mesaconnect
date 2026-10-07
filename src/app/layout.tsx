import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MesaConnect - Sistema de Atendimento por Mesa em Tempo Real',
  description:
    'Plataforma SaaS moderna para atendimento ágil em restaurantes e rodízios com suporte a botões inteligentes ESP32.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa]">
        {children}
      </body>
    </html>
  );
}
