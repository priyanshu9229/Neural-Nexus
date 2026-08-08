'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Sparkles, Terminal, BookOpen, Code } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className="w-full h-full bg-black/80 rounded-[11px] flex items-center justify-between px-2">
              <Bot className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight flex items-center gap-1.5 text-white">
              Creator<span className="gradient-text">OS</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Autonomous AI Studio</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full text-xs font-medium">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full transition-colors ${
              pathname === '/' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/studio"
            className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              pathname === '/studio' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Studio
          </Link>
          <Link
            href="/results"
            className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              pathname === '/results' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-300" />
            Deliverables
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Creating
          </Link>
        </div>
      </div>
    </header>
  );
}
