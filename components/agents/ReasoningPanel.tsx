'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReasoningPanelProps {
  agentName: string;
  reasoning: string;
  defaultExpanded?: boolean;
}

export function ReasoningPanel({ agentName, reasoning, defaultExpanded = false }: ReasoningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!reasoning) return null;

  return (
    <div className="mt-3 border border-purple-500/30 rounded-xl bg-purple-950/40 overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-purple-200 hover:bg-purple-900/40 transition-colors font-semibold text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span className="font-semibold tracking-tight">Why {agentName} made this decision</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-80" /> : <ChevronDown className="w-3.5 h-3.5 opacity-80" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3.5 py-3 text-xs text-slate-200 border-t border-purple-500/30 bg-black/50 leading-relaxed font-sans"
          >
            <div className="flex gap-2.5 items-start">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{reasoning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
