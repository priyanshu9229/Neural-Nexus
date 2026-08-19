'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Sparkles, Terminal, Sun, Moon } from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useCreatorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, [theme]);

  const isLight = mounted && theme === 'light';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className={`w-full h-full rounded-[11px] flex items-center justify-center transition-colors ${
              isLight ? 'bg-white' : 'bg-black/80'
            }`}>
              <Bot className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                isLight ? 'text-indigo-600' : 'text-purple-400'
              }`} />
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
            prefetch={true}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 ${
              pathname === '/' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/studio"
            prefetch={true}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
              pathname === '/studio' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Studio
          </Link>
          <Link
            href="/results"
            prefetch={true}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
              pathname === '/results' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-300" />
            Deliverables
          </Link>
        </nav>

        {/* Right Actions & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            title={`Switch to ${mounted && theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            suppressHydrationWarning
          >
            {!mounted || theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <Link
            href="/studio"
            prefetch={true}
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
