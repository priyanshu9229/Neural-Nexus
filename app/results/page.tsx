'use client';

import { useEffect } from 'react';
import { useCreatorStore } from '@/lib/store';
import { OutputWorkspace } from '@/components/output/OutputWorkspace';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Bot, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsPage() {
  const { finalPackage, goal } = useCreatorStore();

  useEffect(() => {
    if (finalPackage) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#10b981'],
      });
    }
  }, [finalPackage]);

  return (
    <div className="space-y-8 py-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Deliverables Package <FileCheck className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Goal: <span className="text-purple-300 italic">"{goal || 'AI in Healthcare'}"</span>
            </p>
          </div>
        </div>

        <Link
          href="/studio"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate New Campaign
        </Link>
      </div>

      {finalPackage ? (
        <OutputWorkspace />
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Content Package Generated Yet</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Head over to the Studio, specify your content goal, and let the 6 autonomous agents build your complete deliverables package.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-purple-500/25"
          >
            Open CreatorOS Studio
          </Link>
        </div>
      )}
    </div>
  );
}
