import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Viva+ Saúde',
  description: 'Painel inteligente de saúde',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}