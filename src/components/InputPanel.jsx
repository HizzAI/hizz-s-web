import React, { useState, useEffect } from 'react';
import { Sparkles, Link2, X, ChevronRight } from 'lucide-react';
import { wordCount, charCount, readingTime, saveToHistory } from '../utils/textUtils';
import { simplifyWithGemini } from '../utils/geminiApi';

const SAMPLE = `Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artificial fixation points. This allows your brain to recognize words faster while maintaining deep comprehension.

Cognitive sanctuaries are becoming essential in our hyper-stimulated environment. By reducing visual noise, we empower users to reclaim their attention span. This interface doesn't just display data; it curates the experience for neurodivergent minds.`;

export default function InputPanel({ text, onTextChange, onOutput, onLoadingChange, onSaveHistory, autoProcess }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState('Standard');

  const summaryLabels = ['Concise', 'Standard', 'Detailed'];

  const cleanText = (rawInput) => {
    // Removes common web junk like "Click here", "Advertisement", etc.
    return rawInput.replace(/(Advertisement|Read More|Share this|Follow us).*/gi, '');
  };

  const hasAutoProcessed = React.useRef(false);

  useEffect(() => {
    if (autoProcess && text && !hasAutoProcessed.current && !isLoading) {
      hasAutoProcessed.current = true;
      handleProcess();
    }
  }, [autoProcess, text, isLoading]);

  const handleProcess = async () => {
    const rawInput = text.trim() || SAMPLE;
    if (!rawInput) return;

    const input = cleanText(rawInput);

    setError('');
    setIsLoading(true);
    onLoadingChange(true);
    onOutput('');

    try {
      const result = await simplifyWithGemini(input, { summaryLength });
      onOutput(result);
      const entry = saveToHistory(text, result);
      if (onSaveHistory) onSaveHistory(entry.id);
    } catch (err) {
      setError(err.message);
      // Fallback: show original text with bionic
      onOutput(input);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  const handleDemo = () => {
    onTextChange(SAMPLE);
  };

  const wc = wordCount(text);
  const rt = readingTime(text);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* URL input */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-light dark:glass">
        <Link2 size={15} className="text-zinc-400 shrink-0" strokeWidth={1.8} />
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste article URL... (coming soon)"
          disabled
          className="flex-1 bg-transparent text-sm text-zinc-500 dark:text-zinc-400 placeholder-zinc-400 
            dark:placeholder-zinc-500 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {/* Text Area */}
      <div className="relative flex-1 flex flex-col rounded-2xl glass-light dark:glass overflow-hidden">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Input Hub
          </span>
          <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
            {text && <span>{wc} words · ~{rt} min</span>}
            {text && (
              <button onClick={() => onTextChange('')} className="hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          placeholder="Paste an article, blog post, or any text here to transform it into a focused sanctuary..."
          className="flex-1 w-full p-4 bg-transparent resize-none text-sm 
            text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500
            focus:outline-none font-inter leading-relaxed"
          style={{ minHeight: '180px' }}
        />

        {error && (
          <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 
            border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Feature tags */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: '✦', label: 'AI Cleaning', desc: 'Removes ads and sidebars' },
          { icon: '▤', label: 'Structure', desc: 'Maintains semantic hierarchy' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="glass-light dark:glass rounded-xl p-3 flex gap-2">
            <span className="text-primary text-base">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Length Slider */}
      <div className="glass-light dark:glass rounded-xl p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Summary Length</span>
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{summaryLength}</span>
        </div>
        <input 
          type="range" 
          min="0" max="2" step="1" 
          value={summaryLabels.indexOf(summaryLength)}
          onChange={(e) => setSummaryLength(summaryLabels[parseInt(e.target.value, 10)])}
          className="w-full accent-primary" 
        />
        <div className="flex justify-between text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          <span>Short</span>
          <span>Balanced</span>
          <span>In-Depth</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDemo}
          className="px-4 py-2.5 rounded-xl text-sm font-medium border border-black/10 dark:border-white/10
            text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          Try Demo
        </button>
        <button
          onClick={handleProcess}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
            text-sm font-bold transition-all shadow-sm hover:shadow-md
            ${isLoading
              ? 'bg-primary/50 cursor-not-allowed text-zinc-500'
              : 'bg-primary text-zinc-900 hover:bg-primary-dark'}`}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles size={15} strokeWidth={2.5} />
              Summarize with AI
              <ChevronRight size={14} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
