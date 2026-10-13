import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cofre de Senhas',
  description: 'Projeto acadêmico de API REST com Next.js e Neon PostgreSQL'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
