import type { Metadata } from 'next';
import './globals.css';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { Navbar } from '@/components/navigation/Navbar';

export const metadata: Metadata = {
  title: 'TeenBond – Liderzy Jutra | Platforma Budowania Relacji i Zaufania',
  description:
    'Aplikacja wspierająca budowanie relacji, zaufania i komunikacji w zespołach młodzieżowych z grami decyzyjnymi, kartami CHAMPFROGS, tablicą TeenBoard i Drzewkiem Relacji.',
  icons: {
    icon: '/images/liderzy-jutra-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
        <DemoBanner />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 TeenBond – Program „Liderzy Jutra”. Wszelkie prawa zastrzeżone.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Platforma gotowa do pracy w chmurze i trybie offline Demo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
