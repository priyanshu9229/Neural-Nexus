import { Bot, Code } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 glass-panel py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Bot className="w-4 h-4 text-purple-400" />
          <span>CreatorOS — Autonomous AI Content Studio</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400">
          <Link href="/studio" className="hover:text-purple-400 transition-colors">
            Studio
          </Link>
          <Link href="/results" className="hover:text-purple-400 transition-colors">
            Deliverables Package
          </Link>
          <a
            href="https://github.com/priyanshu9229/Neural-Nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors flex items-center gap-1"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
}
