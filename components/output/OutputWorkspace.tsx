'use client';

import { useCreatorStore } from '@/lib/store';
import { ContentCard } from './ContentCard';
import {
  Share2,
  MessageSquare,
  FileText,
  Hash,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Check,
  Copy,
  Download,
  FileCode,
} from 'lucide-react';
import { useState } from 'react';

export function OutputWorkspace() {
  const { finalPackage, selectedTab, setSelectedTab } = useCreatorStore();
  const [packageCopied, setPackageCopied] = useState(false);

  if (!finalPackage) return null;

  const getFullMarkdownText = () => {
    return `# ${finalPackage.title}

> ${finalPackage.summary}

---

## 💼 LinkedIn Post Draft
${finalPackage.linkedinPost}

---

## 🧵 X (Twitter) Thread
${finalPackage.twitterThread.map((tweet, i) => `### Tweet ${i + 1}\n${tweet}`).join('\n\n')}

---

## 📝 Blog Outline: ${finalPackage.blogOutline.title}
**Target Audience:** ${finalPackage.blogOutline.targetAudience}

${finalPackage.blogOutline.sections
  .map((s) => `### ${s.heading}\n${s.points.map((p) => `- ${p}`).join('\n')}`)
  .join('\n\n')}

---

## 🏷️ Curated Hashtags
${finalPackage.hashtags.join(' ')}

---

## 🖼️ Midjourney / DALL·E 3 Visual Asset Prompt
\`\`\`text
${finalPackage.imagePrompt}
\`\`\`

---

## 💡 AI Insights & Critique Notes
- **Key Insights:** ${finalPackage.keyInsights.join('; ')}
- **Reviewer Notes:** ${finalPackage.critiqueNotes.join('; ')}
- **Improvements Made:** ${finalPackage.improvementsMade.join('; ')}
`;
  };

  const copyFullPackage = () => {
    navigator.clipboard.writeText(getFullMarkdownText());
    setPackageCopied(true);
    setTimeout(() => setPackageCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([getFullMarkdownText()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${finalPackage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content_package.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(finalPackage, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${finalPackage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content_package.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-emerald-900/20 p-5 rounded-2xl border border-purple-500/30">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Final Deliverables Package Ready
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">{finalPackage.title}</h2>
          <p className="text-xs text-gray-300 mt-1">{finalPackage.summary}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={copyFullPackage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            {packageCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{packageCopied ? 'Copied Markdown' : 'Copy Package'}</span>
          </button>

          <button
            onClick={downloadMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-mono transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>.MD</span>
          </button>

          <button
            onClick={downloadJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-mono transition-all active:scale-95"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 font-mono text-xs">
        <button
          onClick={() => setSelectedTab('linkedin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedTab === 'linkedin'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/30'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          LinkedIn Post
        </button>

        <button
          onClick={() => setSelectedTab('twitter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedTab === 'twitter'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/30'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          X Thread ({finalPackage.twitterThread.length})
        </button>

        <button
          onClick={() => setSelectedTab('blog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedTab === 'blog'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/30'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          Blog Outline
        </button>

        <button
          onClick={() => setSelectedTab('assets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedTab === 'assets'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/30'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-pink-400" />
          Hashtags & Visuals
        </button>

        <button
          onClick={() => setSelectedTab('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedTab === 'insights'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/30'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          AI Critique & Edits
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {selectedTab === 'linkedin' && (
          <ContentCard
            title="LinkedIn Post Draft"
            badge="Optimized Hook & Formatting"
            icon={Share2}
            content={finalPackage.linkedinPost}
            footerInfo={`${finalPackage.linkedinPost.split(/\s+/).length} words | ${finalPackage.linkedinPost.length} characters`}
          />
        )}

        {selectedTab === 'twitter' && (
          <div className="space-y-3">
            {finalPackage.twitterThread.map((tweet, i) => (
              <ContentCard
                key={i}
                title={`Tweet ${i + 1} of ${finalPackage.twitterThread.length}`}
                icon={MessageSquare}
                content={tweet}
                footerInfo={`${tweet.length} / 280 chars`}
              />
            ))}
          </div>
        )}

        {selectedTab === 'blog' && (
          <ContentCard
            title={finalPackage.blogOutline.title}
            badge={`Audience: ${finalPackage.blogOutline.targetAudience}`}
            icon={FileText}
            content={finalPackage.blogOutline.sections
              .map((section) => `${section.heading}\n${section.points.map((p) => `  • ${p}`).join('\n')}`)
              .join('\n\n')}
            footerInfo={`${finalPackage.blogOutline.sections.length} Major Sections`}
          />
        )}

        {selectedTab === 'assets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContentCard
                title="Curated Hashtag Stack"
                badge="High Reach & Niche"
                icon={Hash}
                content={finalPackage.hashtags.join('  ')}
                footerInfo={`${finalPackage.hashtags.length} Tags Selected`}
              />

              <ContentCard
                title="Midjourney / DALL·E 3 Visual Prompt"
                badge="8K Cinematic Render"
                icon={ImageIcon}
                content={finalPackage.imagePrompt}
                footerInfo="Copy directly into Midjourney v6 or DALL·E 3"
              />
            </div>

            {/* Live AI Image Generation Preview (Free via Pollinations.ai) */}
            <div className="rounded-2xl border border-purple-500/30 glass-panel p-5 space-y-3 bg-purple-950/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Live AI Visual Preview
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Free Instant Render
                  </span>
                </h3>
                <a
                  href={`https://image.pollinations.ai/prompt/${encodeURIComponent(finalPackage.imagePrompt)}?width=1280&height=720&nologo=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 underline"
                >
                  Open High-Res (1280x720) ↗
                </a>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
                <img
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(finalPackage.imagePrompt)}?width=1024&height=576&nologo=true`}
                  alt="AI Generated Artwork"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] font-mono text-gray-400 text-center">
                Generated live via Pollinations AI (Free API — No API Key Required)
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Researcher Insights
              </h4>
              <ul className="space-y-1 text-gray-300 list-disc list-inside">
                {finalPackage.keyInsights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Reviewer Critiques
              </h4>
              <ul className="space-y-1 text-gray-300 list-disc list-inside">
                {finalPackage.critiqueNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Improver Revisions
              </h4>
              <ul className="space-y-1 text-gray-300 list-disc list-inside">
                {finalPackage.improvementsMade.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
