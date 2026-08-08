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
    <div className="mt-3 border border-purple-500/30 rounded-xl bg-purple-950/20 overflow-hidden transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-purple-300 hover:bg-purple-900/30 transition-colors font-medium text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Why {agentName} made this decision</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-2.5 text-xs text-gray-300 border-t border-purple-500/20 bg-black/40 leading-relaxed font-sans"
          >
            <div className="flex gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <p>{reasoning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
