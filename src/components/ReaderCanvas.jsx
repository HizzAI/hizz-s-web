import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Square, Copy, Download, Volume2, Bookmark, Check } from 'lucide-react';
import { applyBionicReading } from '../hooks/useBionicReading';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { copyToClipboard, downloadAsTxt, splitParagraphs, saveBookmark } from '../utils/textUtils';

function ShimmerBlock() {
  return (
    <div className="space-y-3 animate-pulse">
      {[100, 90, 95, 85, 92].map((w, i) => (
        <div key={i} className={`h-4 rounded-full shimmer`} style={{ width: `${w}%` }} />
      ))}
      <div className="h-4 rounded-full shimmer w-3/4" />
      <div className="pt-2 space-y-2">
        {[88, 94, 80].map((w, i) => (
          <div key={i} className="h-4 rounded-full shimmer" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function ReaderCanvas({ text, isLoading, settings, focusRuler, autoPlay = false, onProgressChange }) {
  const containerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [rulerTop, setRulerTop] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [topBookmark, setTopBookmark] = useState(false);
  const [paragraphBookmarks, setParagraphBookmarks] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  
  const {
    speak, pause, resume, stop,
    isPlaying, isPaused, rate, setRate,
    currentWordIndex,
  } = useSpeechSynthesis();

  const paragraphs = splitParagraphs(text);

  const tabsData = useMemo(() => {
    if (!text) return [];
    const tabs = [
      { id: 'summary', title: 'Summary', paras: [] },
      { id: 'timeline', title: 'Key Events', paras: [] },
      { id: 'pillars', title: 'Main Points', paras: [] }
    ];
    let currentTabIdx = 0;

    paragraphs.forEach((para, globalIdx) => {
      const lower = para.toLowerCase();
      // Detect tab shifts based on the newly prompt-enforced headers
      if (lower.includes('the timeline') || lower.includes('key events')) {
        currentTabIdx = 1;
      } else if (lower.includes('the core pillars') || lower.includes('main points') || lower.includes('the conclusion')) {
        currentTabIdx = 2; // Append conclusion into Main points tab to prevent fragmentation
      } else if (lower.includes('the executive summary')) {
        currentTabIdx = 0;
      }
      tabs[currentTabIdx].paras.push({ content: para, globalIdx });
    });

    return tabs.filter(t => t.paras.length > 0);
  }, [text, paragraphs]);

  const [activeTabId, setActiveTabId] = useState('summary');

  // Focus ruler mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!focusRuler || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setRulerTop(e.clientY - rect.top);
  }, [focusRuler]);

  // Highlight paragraph during TTS
  useEffect(() => {
    if (!isPlaying || currentWordIndex < 0) { setActiveParagraph(-1); return; }
    const allWords = text.split(/\s+/);
    let count = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      count += paragraphs[i].split(/\s+/).length;
      if (currentWordIndex < count) { setActiveParagraph(i); break; }
    }
  }, [currentWordIndex, isPlaying, paragraphs, text]);

  // Auto switch tab if reading moves to next section
  useEffect(() => {
    if (!isPlaying || currentWordIndex < 0 || activeParagraph < 0) return;
    const expectedTab = tabsData.find(t => t.paras.some(p => p.globalIdx === activeParagraph));
    if (expectedTab && expectedTab.id !== activeTabId) {
      setActiveTabId(expectedTab.id);
    }
  }, [activeParagraph, isPlaying, tabsData, activeTabId]);

  // Handle Autoplay precisely when text loads
  useEffect(() => {
    if (autoPlay && text && !isPlaying && !isLoading && !isPaused) {
      // Small timeout guarantees layout has finished inflating
      const timer = setTimeout(() => speak(text), 600);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, isPlaying, isPaused, isLoading, speak]);

  // Track global read progress
  useEffect(() => {
    if (onProgressChange && currentWordIndex > 0 && text) {
      const allWordsCount = text.split(/\s+/).filter(Boolean).length || 1;
      const pct = Math.min((currentWordIndex / allWordsCount) * 100, 100);
      onProgressChange(pct);
    }
  }, [currentWordIndex, text, onProgressChange]);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isPaused) { resume(); return; }
    if (isPlaying) { pause(); return; }
    speak(text);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleBookmarkPoint = (e, paraContent, globalIdx) => {
    e.stopPropagation();
    saveBookmark({
      articleTitle: 'Hizz\'s Web Snippet',
      snippet: paraContent,
      colorTag: 'yellow'
    });
    setParagraphBookmarks(prev => ({ ...prev, [globalIdx]: true }));
    showToast('Saved to Sanctuary');
  };

  const handleTopBookmark = () => {
    const summaryParas = tabsData.find(t => t.id === 'summary')?.paras.map(p => p.content) || [];
    const pointsParas = tabsData.find(t => t.id === 'pillars')?.paras.map(p => p.content) || [];
    
    saveBookmark({
      title: 'Cognitive Session Snapshot',
      fullSummary: summaryParas.length > 0 ? summaryParas.join('\n\n') : 'Summary parsing in progress...',
      keyPoints: pointsParas,
      focusTime: Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 60000)),
      readingDepth: 'Deep',
      date: new Date().toLocaleDateString()
    });
    setTopBookmark(true);
    showToast('Snapshot Saved to Sanctuary');
  };

  const renderParagraph = (para, idx) => {
    const isActive = idx === activeParagraph;
    
    // Calculate global word offset for this paragraph
    let globalOffset = 0;
    for (let i = 0; i < idx; i++) {
      globalOffset += paragraphs[i].split(/\s+/).filter(Boolean).length;
    }

    const words = para.split(/(\s+)/);
    let wordInParaCounter = 0;

    const content = words.map((token) => {
      if (/^\s+$/.test(token)) return token;
      
      const currentGlobalIndex = globalOffset + wordInParaCounter;
      wordInParaCounter++;

      const isWordActive = isPlaying && currentGlobalIndex === currentWordIndex;
      const bionicWord = settings.bionic ? applyBionicReading(token) : token;

      if (isWordActive) {
        return `<span class="word-highlight">${bionicWord}</span>`;
      }
      return bionicWord;
    }).join('');

    return (
      <div key={idx} className="relative group/para mb-5">
        <p
          className={`transition-all duration-300 rounded-md px-2 -mx-2 pr-8
            ${isActive ? 'paragraph-highlight' : ''} bionic-text reader-text`}
          style={{
            fontSize: settings.fontSize + 'px',
            lineHeight: settings.lineHeight,
            letterSpacing: settings.letterSpacing + 'em',
          }}
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
        />
        {/* Paragraph level Bookmark */}
        {activeTabId === 'pillars' && (
          <button 
            onClick={(e) => handleBookmarkPoint(e, para, idx)}
            className="absolute top-1 right-1 opacity-0 group-hover/para:opacity-100 transition-opacity p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
            title="Bookmark this Main Point"
          >
            <Bookmark 
              size={16} 
              className={`transition-colors ${paragraphBookmarks[idx] ? 'fill-[#F8CB46] text-[#F8CB46]' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`} 
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* TTS Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeak}
            disabled={!text}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all
              ${text ? 'bg-primary text-zinc-900 hover:bg-primary-dark shadow-sm hover:shadow-md' 
                     : 'bg-black/10 dark:bg-white/10 text-zinc-400 cursor-not-allowed'}`}
          >
            {isPlaying
              ? <><Pause size={14} strokeWidth={2.5} /> Pause</>
              : isPaused
                ? <><Play size={14} strokeWidth={2.5} /> Resume</>
                : <><Volume2 size={14} strokeWidth={2} /> Read Aloud</>
            }
          </button>
          {(isPlaying || isPaused) && (
            <button onClick={stop} className="p-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 transition-colors">
              <Square size={14} className="text-zinc-700 dark:text-zinc-200" />
            </button>
          )}
          {/* Speed */}
          <select
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="text-xs px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 
              text-zinc-700 dark:text-zinc-200 border-none outline-none cursor-pointer"
          >
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </div>

        {/* Export controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200
              hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-all"
          >
            <Copy size={12} strokeWidth={2} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => downloadAsTxt(text)}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200
              hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-all"
          >
            <Download size={12} strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative flex-1 overflow-y-auto rounded-2xl p-6 md:p-8 transition-all
          glass-light dark:glass
          ${settings.dyslexic ? 'font-dyslexic' : 'font-inter'}`}
      >
        {/* Top Right Main Bookmark */}
        {text && !isLoading && (
           <button
             onClick={handleTopBookmark}
             className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
             title="Bookmark this session"
           >
             <Bookmark size={20} className={`transition-colors ${topBookmark ? 'fill-[#F8CB46] text-[#F8CB46]' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`} />
           </button>
        )}
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-lg flex items-center gap-2 animate-slide-up">
            <Check size={14} className="text-[#F8CB46]" />
            {toastMsg}
          </div>
        )}

        {/* Focus Ruler */}
        {focusRuler && text && (
          <div
            className="focus-ruler"
            style={{ top: rulerTop - 12 + 'px' }}
          />
        )}

        {isLoading ? (
          <ShimmerBlock />
        ) : text ? (
          <div className="relative z-10 animate-fade-in flex flex-col h-full">
            {/* Tabs Header */}
            {tabsData.length > 1 && (
              <div className="flex items-center gap-2 mb-6 border-b border-black/5 dark:border-white/5 pb-2">
                {tabsData.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTabId(t.id)}
                    className={`px-4 py-2 rounded-t-lg font-extrabold text-xs uppercase tracking-widest transition-all
                      ${activeTabId === t.id 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}
            
            {/* Render Active Tab's Paragraphs */}
            <div className="flex-1 overflow-y-auto pr-2">
              {(tabsData.find(t => t.id === activeTabId) || tabsData[0])?.paras.map((p) => 
                renderParagraph(p.content, p.globalIdx)
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-40">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Volume2 size={22} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Your transformed text will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
