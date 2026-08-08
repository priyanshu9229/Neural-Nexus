'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles, Hash, Image, FileText, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
  title: string;
  badge?: string;
  icon?: any;
  content: string;
  footerInfo?: string;
}

export function ContentCard({ title, badge, icon: Icon = FileText, content, footerInfo }: ContentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 glass-panel p-5 space-y-4 hover:border-purple-500/30 transition-all shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              {title}
              {badge && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {badge}
                </span>
              )}
            </h3>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-white transition-all shadow-sm active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
          <span>{copied ? 'Copied!' : 'Copy Asset'}</span>
        </button>
      </div>

      <div className="bg-[#080910] border border-white/5 rounded-xl p-4 text-xs font-sans text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto select-text">
        {content}
      </div>

      {footerInfo && (
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
          <span>{footerInfo}</span>
          <span className="text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ready to publish
          </span>
        </div>
      )}
    </motion.div>
  );
}
