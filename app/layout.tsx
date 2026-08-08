import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CreatorOS — Autonomous AI Content Studio',
  description: 'An autonomous AI persona that researches trends, creates multi-platform content, critiques its own work, and publishes complete campaigns from a single goal.',
  keywords: ['AI Content Studio', 'Multi-Agent AI', 'Autonomous AI', 'CreatorOS', 'LinkedIn AI', 'Twitter Thread Generator'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#06060A] text-gray-100 flex flex-col antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {/* Glow ambient backdrops */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
        <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
