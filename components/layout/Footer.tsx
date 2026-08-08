import { Sparkles, Bot, Code } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 glass-panel py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Bot className="w-4 h-4 text-purple-400" />
          <span>CreatorOS — Built for AI Hackathon 2026</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400">
          <a
            href="https://github.com/priyanshu9229/Neural-Nexus/blob/main/PROMPTS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors"
          >
            PROMPTS.md
          </a>
          <a
            href="https://github.com/priyanshu9229/Neural-Nexus/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors"
          >
            Documentation
          </a>
          <a
            href="https://github.com/priyanshu9229/Neural-Nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors flex items-center gap-1"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
