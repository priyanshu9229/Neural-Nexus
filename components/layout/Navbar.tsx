'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Sparkles, Terminal, FileCode2, ExternalLink, Code } from 'lucide-react';

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
                v1.0 AI
              </span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Autonomous Content Studio</span>
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
            <Sparkles className="w-3.5 h-3.5" />
            Studio
          </Link>
          <Link
            href="/results"
            className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              pathname === '/results' ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Results Package
          </Link>
        </nav>

        {/* Right CTA / PROMPTS link */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/priyanshu9229/Neural-Nexus/blob/main/PROMPTS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-purple-300 px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/30 bg-white/5 transition-all"
          >
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            PROMPTS.md
          </a>

          <a
            href="https://github.com/priyanshu9229/Neural-Nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/15 transition-all"
          >
            <Code className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Repository</span>
          </a>
        </div>
      </div>
    </header>
  );
}
