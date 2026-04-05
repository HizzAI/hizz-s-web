import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Play, Bookmark, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getHistory, getBookmarks } from '../utils/textUtils';

const FILTERS = ['All', 'In Progress', 'Completed', 'Archived'];

// Status badge color mapping
const STATUS_COLORS = {
  'In Progress': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Completed':   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'Archived':    'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400',
};

export default function Library() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState(searchParams.get('tab') === 'history' ? 'history' : (searchParams.get('tab') || 'history'));
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const navigate = useNavigate();

  // Load data from localStorage reactively on mount
  useEffect(() => {
    setHistory(getHistory());
    setBookmarks(getBookmarks());
  }, []);

  // Derived — recomputes whenever history or activeFilter changes
  const filteredHistory = history.filter(
    item => activeFilter === 'All' || item.status === activeFilter
  );

  // Group history by date
  const groupedHistory = filteredHistory.reduce((acc, item) => {
    let groupName = item.date;
    try {
       const today = new Date();
       const itemDate = new Date(item.date);
       if (itemDate.toDateString() === today.toDateString()) {
          groupName = 'Today';
       } else {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (itemDate.toDateString() === yesterday.toDateString()) {
             groupName = 'Yesterday';
          } else {
             // Formats as "April 2nd" roughly
             const opts = { month: 'long', day: 'numeric' };
             groupName = itemDate.toLocaleDateString(undefined, opts);
          }
       }
    } catch (e) {
       // fallback
    }
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  const handleHistoryClick = (item) => {
     setSelectedBookmark({
        ...item,
        fullSummary: item.summary,
        keyPoints: item.mainPoints,
        focusTime: Math.round(item.progress ? item.progress / 5 : 0), // Mock focus time based on progress
        readingDepth: item.status === 'Completed' ? 'Deep' : 'Surface'
     });
     setShowBookmarkModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC] dark:bg-zinc-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 px-8 lg:px-16 py-12 max-w-7xl mx-auto w-full font-inter relative pb-32">
        
        {/* Title Section */}
        <div className="mb-10 animate-slide-up">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A08020] mb-2">
            READING SANCTUARY
          </p>
          <h1 className="text-display text-zinc-900 dark:text-zinc-100 tracking-tight text-6xl font-extrabold mb-6">
            Library
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed selection:bg-[#F8CB46] selection:text-black">
            Welcome back to your cognitive archive. Revisit past curiosities and resume your journey into focused deep-reading.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit mb-10">
          <button 
            onClick={() => setViewMode('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            History
          </button>
          <button 
            onClick={() => setViewMode('bookmarks')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'bookmarks' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            Bookmarks ({bookmarks.length})
          </button>
        </div>

        {viewMode === 'history' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              {FILTERS.map(f => {
                const count = f === 'All' ? history.length : history.filter(h => h.status === f).length;
                return (
                 <button 
                   key={f}
                   onClick={() => setActiveFilter(f)}
                   className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                     activeFilter === f 
                       ? 'bg-[#F8CB46] text-zinc-900 shadow-sm' 
                       : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10'
                   }`}
                 >
                   <span>{f}</span>
                   <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeFilter === f ? 'bg-black/20 text-black' : 'bg-black/10 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'}`}>
                     {count}
                   </span>
                 </button>
                );
              })}
            </div>

            {/* Vertical List Grouped By Date */}
            <div className="flex flex-col gap-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
                <Bookmark size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">No Saved Sessions</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">Start your first reading journey to discover the beauty of cognitively accessible text.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-[#8c6b16] hover:bg-[#725712] text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-sm"
               >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
               {Object.entries(groupedHistory).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="mb-10 last:mb-0">
                     <h3 className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 border-b border-black/5 dark:border-white/5 pb-2">
                        {dateLabel}
                     </h3>
                     <div className="flex flex-col gap-3">
                        {items.map(item => (
                           <div 
                              key={item.id} 
                              onClick={() => handleHistoryClick(item)} 
                              className="cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between group hover:shadow-md hover:border-[#F8CB46]/30 transition-all duration-300"
                           >
                              <div className="flex flex-col gap-1.5 pr-6 flex-1">
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${STATUS_COLORS[item.status] || 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400'}`}>
                                       {item.status}
                                    </span>
                                    {item.progress > 0 && (
                                       <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                          {Math.round(item.progress)}% Progress
                                       </span>
                                    )}
                                 </div>
                                 <h4 className="font-extrabold text-lg text-zinc-900 dark:text-锌-100 line-clamp-1 leading-tight tracking-tight">
                                    {item.title}
                                 </h4>
                                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                                    {item.summary}
                                 </p>
                              </div>
                              <ArrowRight size={20} className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#F8CB46] transition-colors shrink-0 transform group-hover:translate-x-1" />
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
          )}
            </div>
          </>
        )}

        {/* Bookmarks Layout (Masonry) */}
        {viewMode === 'bookmarks' && (
          <div className="animate-slide-up w-full">
            {bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
                  <Bookmark size={24} className="text-zinc-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">No Bookmarks Yet</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">Tap the bookmark icon on any Main Point during your deep dive to save snippets securely.</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {bookmarks.map((bm) => (
                  <div 
                    key={bm.id} 
                    onClick={() => { setSelectedBookmark(bm); setShowBookmarkModal(true); }}
                    className="cursor-pointer break-inside-avoid-column bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 relative group hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8c6b16] dark:text-[#F8CB46]">
                        {bm.date || bm.timestamp}
                      </span>
                      <Bookmark size={14} className="text-[#F8CB46] fill-[#F8CB46]" />
                    </div>
                    <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 mb-2 leading-tight">
                      {bm.title || bm.articleTitle || "Saved Knowledge"}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-4">
                      {bm.fullSummary || bm.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </main>

      {/* Bookmark Deep Insight Modal */}
      {showBookmarkModal && selectedBookmark && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#F5F5DC] dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col relative" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
             <style>{`
               @keyframes slideUp {
                 0% { opacity: 0; transform: translateY(16px) scale(0.98); }
                 100% { opacity: 1; transform: translateY(0) scale(1); }
               }
             `}</style>
             
             {/* Modal Header */}
             <div className="sticky top-0 z-10 bg-[#F5F5DC]/95 dark:bg-zinc-900/95 backdrop-blur-md px-8 py-6 border-b border-black/5 dark:border-white/5 flex justify-between items-start">
                <div className="pr-12">
                   <span className="inline-block px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase bg-[#E6DBC3] dark:bg-[#3f3b2d] text-[#8c6b16] dark:text-[#F8CB46] mb-3">
                     Deep Insight
                   </span>
                   <h2 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                     {selectedBookmark.title || selectedBookmark.articleTitle || "Saved Knowledge"}
                   </h2>
                   <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">{selectedBookmark.date || selectedBookmark.timestamp}</p>
                </div>
                <Bookmark size={28} className="text-[#F8CB46] fill-[#F8CB46] shrink-0" />
                <button onClick={() => setShowBookmarkModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
             </div>

             {/* Modal Content */}
             <div className="p-8 space-y-8 text-zinc-800 dark:text-zinc-200">
                {selectedBookmark.fullSummary ? (
                   <div>
                      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46] mb-4">Executive Summary</h3>
                      <div className="space-y-4 font-serif text-lg leading-relaxed">
                        {selectedBookmark.fullSummary.split('\n\n').filter(Boolean).map((para, i) => (
                           <p key={i}>{para.trim()}</p>
                        ))}
                      </div>
                   </div>
                ) : (
                   <p className="font-serif text-lg italic border-l-4 border-[#F8CB46] pl-4 text-zinc-600 dark:text-zinc-400">"{selectedBookmark.snippet}"</p>
                )}

                {selectedBookmark.keyPoints && selectedBookmark.keyPoints.length > 0 && (
                   <div>
                      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46] mb-4 pt-4 border-t border-black/5 dark:border-white/5">The Sparks</h3>
                      <ul className="space-y-4">
                        {selectedBookmark.keyPoints.map((point, i) => (
                           <li key={i} className="flex gap-4">
                              <span className="text-[#F8CB46] mt-1 shrink-0">•</span>
                              <span className="font-medium text-sm leading-relaxed">{point.replace(/^[•\-*]\s*/, '')}</span>
                           </li>
                        ))}
                      </ul>
                   </div>
                )}
             </div>

             {/* Footer Metrics */}
             {(selectedBookmark.focusTime !== undefined || selectedBookmark.readingDepth) && (
               <div className="mt-auto px-8 py-5 bg-black/5 dark:bg-white/5 flex gap-6 text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 rounded-b-3xl">
                  {selectedBookmark.focusTime !== undefined && (
                     <span>You focused on this for {selectedBookmark.focusTime} minute{selectedBookmark.focusTime !== 1 ? 's' : ''}</span>
                  )}
                  {selectedBookmark.readingDepth && (
                     <span className="border-l border-zinc-300 dark:border-zinc-700 pl-6">Depth: {selectedBookmark.readingDepth}</span>
                  )}
               </div>
             )}
          </div>
        </div>
      )}

      <footer className="text-center py-8 mt-auto text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] font-bold">
        Privacy · Accessibility · Terms<br/>
        <span className="mt-2 block opacity-70">© {new Date().getFullYear()} Hizz-Web Cognitive Sanctuary</span>
      </footer>
    </div>
  );
}
