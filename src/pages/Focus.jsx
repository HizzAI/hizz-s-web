import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import InputPanel from '../components/InputPanel';
import ReaderCanvas from '../components/ReaderCanvas';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { getHistory, clearHistory, getHistoryEntry, updateHistoryProgress } from '../utils/textUtils';

const DEFAULT_SETTINGS = {
  bionic: false,
  dyslexic: false,
  ruler: false,
  colors: false,
  fontSize: 17,
  lineHeight: 1.85,
  letterSpacing: 0.01,
};

export default function Focus() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('id');
  const shouldAutoPlay = searchParams.get('autoplay') === 'true';
  const textParam = searchParams.get('text');
  const shouldAutoProcess = searchParams.get('autosummarize') === 'true';

  const [inputText, setInputText] = useState(textParam || '');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(() => getHistory());
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hizzs-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Load entry from History if ?id=XXX is passed
  useEffect(() => {
    if (entryId) {
      const entry = getHistoryEntry(entryId);
      if (entry) {
        setInputText(entry.originalText);
        setOutput(entry.rawAiSummary);
      }
    }
  }, [entryId]);

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleLoadHistory = (item) => {
    if (item.originalText) setInputText(item.originalText);
    if (item.aiSummary) setOutput(item.aiSummary);
  };

  const handleSettingChange = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem('hizzs-settings', JSON.stringify(next));
  };

  const handleADHDMode = () => {
    // ADHD mode: max bionic, larger font, wider spacing, focus ruler on
    const adhd = { ...settings, bionic: true, ruler: true, fontSize: 19, lineHeight: 2.2, letterSpacing: 0.04 };
    setSettings(adhd);
    localStorage.setItem('hizzs-settings', JSON.stringify(adhd));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC] dark:bg-zinc-950 transition-colors duration-300">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-6 py-6 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar
            settings={settings}
            onSettingChange={handleSettingChange}
            onADHDMode={handleADHDMode}
            onLoadHistory={handleLoadHistory}
            history={history}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Main split pane */}
        <main className="flex-1 grid md:grid-cols-2 gap-4 min-h-[600px]">
          {/* Input */}
          <section className="flex flex-col animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="mb-3">
              <p className="text-caption text-primary mb-0.5">Input Hub</p>
              <h2 className="text-heading text-zinc-900 dark:text-zinc-100">
                Feed Your Mind
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Paste an article or raw text to transform it into a focused sanctuary.
              </p>
            </div>
            <div className="flex-1">
              <InputPanel 
                text={inputText}
                onTextChange={setInputText}
                onOutput={setOutput} 
                onLoadingChange={setIsLoading} 
                onSaveHistory={refreshHistory}
                autoProcess={shouldAutoProcess}
              />
            </div>
          </section>

          {/* Output */}
          <section className="flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-3">
              <p className="text-caption text-zinc-500 dark:text-zinc-400 mb-0.5">Reading Sanctuary</p>
              <h2 className="text-heading text-zinc-900 dark:text-zinc-100">
                {output ? 'The Future of Digital Reading' : 'Awaiting Your Text'}
              </h2>
            </div>
            <div className="flex-1">
              <ReaderCanvas
                text={output}
                isLoading={isLoading}
                settings={settings}
                focusRuler={settings.ruler}
                autoPlay={shouldAutoPlay}
                onProgressChange={(pct) => {
                  if (entryId) updateHistoryProgress(entryId, pct);
                }}
              />
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
        Accessibility Statement · Privacy · Help · © {new Date().getFullYear()} Hizz-Web | Cognitive Sanctuary
      </footer>
    </div>
  );
}
