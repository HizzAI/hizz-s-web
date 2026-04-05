import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import DashboardSidebar from '../components/DashboardSidebar';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getBookmarks } from '../utils/textUtils';
import { Howl } from 'howler';

const RECENT_READS = [
  { date: "OCT 12, 2023", title: "The Quiet Power of Brutalist Interior Design", text: "Brutalist architecture emerged in the 1950s as a rejection of frivolous ornamentation. Its core ethos centers on raw materials, primarily exposed concrete, and functional, massive forms. In digital design, this translates to minimal palettes, high contrast typography, and an unapologetic focus on structured data over aesthetic flair. The quiet power lies in its honesty." },
  { date: "OCT 11, 2023", title: "Neuro-Inclusion in High-End Digital Interfaces", text: "Neuro-inclusion goes beyond basic accessibility by accommodating a wide spectrum of cognitive processing styles. High-end interfaces often fall into the trap of over-animation and low-contrast minimalism, which disrupt focus. True premium design aligns elegance with cognitive ease—predictable navigation patterns, sensory control features, and reducing cognitive load through progressive disclosure." },
  { date: "OCT 10, 2023", title: "Minimalism as a Tool for Cognitive Satiety", text: "Cognitive satiety is the feeling of having consumed just enough information to satisfy a need without experiencing overwhelm. Minimalism serves as a physiological tool for this. By deliberately introducing negative space and limiting color palettes, digital minimalism curates the user's attention, stopping the doom-scroll loop and promoting intentional interaction." }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const history = getHistory();
  const displayedReads = history.slice(0, 3);

  const [bookmarks, setBookmarks] = useState([]);
  const [isZenMode, setIsZenMode] = useState(false);
  const [focusLevel, setFocusLevel] = useState(0);

  // Audio Player State
  const [activeAudio, setActiveAudio] = useState(null);
  const audioRef = useRef(new Audio());

  const PLAYLIST = [
    {
      id: 'tonal-atmospheres',
      category: 'Visual Theory',
      title: 'Tonal Atmospheres',
      url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' 
    },
    {
      id: 'rain',
      category: 'Ambient Sound',
      title: 'Recursive Rain 432hz',
      url: 'https://www.soundjay.com/nature/sounds/rain-03.mp3'
    }
  ];

  const toggleSound = (url, cardName) => {
    // If same card clicked, pause it
    if (activeAudio === cardName) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setActiveAudio(null);
    } else {
      // If new card clicked, play new sound
      audioRef.current.src = url;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.error("Audio error: ", e));
      setActiveAudio(cardName);
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    const currentAudio = audioRef.current;
    return () => {
      currentAudio.pause();
      currentAudio.src = '';
    };
  }, []);

  useEffect(() => {
    setBookmarks(getBookmarks());
    
    // Trigger CSS animation for focus progress on mount
    const timeoutId = setTimeout(() => {
      setFocusLevel(78); // Target static streak focus level percentage
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-[#F5F5DC] dark:bg-zinc-950 transition-all duration-700 ${isZenMode ? 'items-center justify-center grayscale-[0.5]' : ''}`}>
      <div className={`transition-all duration-700 w-full ${isZenMode ? 'opacity-0 pointer-events-none absolute -top-20' : 'opacity-100'}`}>
        <Header />
      </div>

      <div className={`flex-1 flex w-full transition-all duration-700 ${isZenMode ? 'max-w-5xl mx-auto' : ''}`}>
        {/* Sidebar */}
        <div className={`transition-all duration-700 ${isZenMode ? 'opacity-0 pointer-events-none w-0 overflow-hidden shrink-0' : 'opacity-100 w-16 md:w-64 shrink-0'}`}>
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <main className={`flex-1 px-8 lg:px-12 py-10 w-full font-inter overflow-y-auto transition-all duration-700 ${isZenMode ? 'opacity-100 scale-[1.02]' : 'max-w-7xl mx-auto'}`}>
          {/* Header text */}
          <div className="mb-10 animate-slide-up">
            <h1 className={`text-display text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight text-5xl font-extrabold mb-4 transition-all duration-1000 ${new Date().getHours() >= 5 && new Date().getHours() < 17 ? 'drop-shadow-[0_0_15px_rgba(248,203,70,0.5)]' : 'drop-shadow-[0_0_20px_rgba(45,45,45,0.6)] dark:drop-shadow-[0_0_20px_rgba(45,45,45,0.8)]'}`}>
              Focus, curated.
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Your cognitive sanctuary for deep work and meaningful discovery. Today is dedicated to architectural resonance.
            </p>
          </div>

          {/* Recent Reads Row */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                RECENT READS
              </h2>
              <button 
                onClick={() => navigate('/library?tab=history')} 
                className="text-[10px] font-bold text-[#A08020] hover:text-[#7d6416] transition-colors cursor-pointer uppercase tracking-widest"
              >
                View All History
              </button>
            </div>
            {displayedReads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayedReads.map((item, idx) => {
                  const clickHandler = () => {
                    navigate(`/focus?id=${item.id}`);
                  };
  
                  const rawDate = new Date(item.timestamp).toLocaleDateString();
                  const displayDate = rawDate === 'Invalid Date' ? '8 min read' : rawDate;
  
                  return (
                    <div key={idx} onClick={clickHandler} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-200/50 dark:border-white/5 cursor-pointer hover:shadow-md transition-shadow">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A08020] dark:text-[#F8CB46] mb-2">
                        {displayDate}
                      </p>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-black/5 dark:border-white/5 text-center shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1542361345-89158e225ce8?auto=format&fit=crop&q=80" 
                  alt="Empty Sanctuary" 
                  className="w-16 h-16 rounded-2xl mb-4 object-cover opacity-80 mix-blend-luminosity grayscale"
                />
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Your sanctuary is ready for its first entry.</p>
              </div>
            )}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Left Column (8 cols) */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              
              {/* Featured Architecture Card */}
              <div className="relative h-[380px] rounded-3xl overflow-hidden shadow-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
                  alt="Architecture" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute inset-x-8 bottom-8 z-10 flex flex-col items-start">
                  <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-[#F8CB46] text-black mb-3">
                    PRIMARY FOCUS
                  </span>
                  <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">The Architecture of Silence</h2>

                  <button 
                    onClick={() => navigate(`/focus?text=${encodeURIComponent("The Architecture of Silence is not about the absence of sound, but the deliberate curation of structural elements to minimize cognitive noise. Clean lines, intentional geometry, and negative space work in harmony to foster deep focus.")}&autosummarize=true`)}
                    className="mt-6 flex items-center gap-2 bg-white text-zinc-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-100 transition-colors shadow-sm"
                  >
                    Read Depth Analysis <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Library Insights Card */}
              <div className="relative h-[200px] rounded-3xl overflow-hidden shadow-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1497215840656-788bf3a07675?auto=format&fit=crop&q=80" 
                  alt="Insights Pattern" 
                  className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-zinc-900" />
                
                <div className="absolute inset-x-8 bottom-8 z-10">
                  <h3 className="text-2xl font-extrabold text-white mb-2">Library Insights</h3>
                  <p className="text-sm text-zinc-400 mb-4">You have {bookmarks.length} saved insights this week.</p>
                  
                  {bookmarks.length > 0 && (
                    <div className="pl-4 border-l-2 border-[#F8CB46] italic text-zinc-300 text-xs line-clamp-2 max-w-md">
                      "{bookmarks[0].snippet}"
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (4 cols) */}
            <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              
              {/* Morning Curator Card */}
              <div className="bg-[#f0ebd8]/70 dark:bg-zinc-900/70 backdrop-blur-[12px] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 flex flex-col h-[380px] overflow-hidden">
                <h3 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Morning Curator</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Daily digest of aesthetic signals filtered through your unique cognitive profile.
                </p>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 mt-auto scrollbar-hide">
                  {PLAYLIST.map(track => {
                    const isActive = activeAudio === track.id;
                    return (
                      <div 
                        key={track.id} 
                        onClick={() => toggleSound(track.url, track.id)}
                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border-2 ${
                          isActive 
                            ? 'bg-white dark:bg-zinc-800 border-[#F8CB46] shadow-sm transform scale-[1.02] shadow-[#F8CB46]/20' 
                            : 'bg-white/50 dark:bg-black/20 border-transparent hover:bg-white/70 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-[#F8CB46] text-black' : 'bg-[#e3dabe] dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/5'
                        }`}>
                          {isActive ? (
                             <div className="flex items-center gap-0.5 h-3 justify-center">
                               <span className="w-0.5 h-[60%] bg-zinc-900 rounded-full animate-[equalizer_0.9s_ease-in-out_infinite]" />
                               <span className="w-0.5 h-full bg-zinc-900 rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_0.3s]" />
                               <span className="w-0.5 h-[50%] bg-zinc-900 rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_0.5s]" />
                               <style>{`
                                 @keyframes equalizer {
                                   0%, 100% { transform: scaleY(0.7); opacity: 0.8; }
                                   50% { transform: scaleY(1.3); opacity: 1; }
                                 }
                               `}</style>
                             </div>
                          ) : <Play size={16} className="ml-1" fill="currentColor" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 mb-0.5">
                            {isActive ? <span className="animate-pulse text-[#A08020] dark:text-[#F8CB46]">Now Resonating</span> : track.category}
                          </p>
                          <p className={`text-sm font-bold leading-tight truncate ${isActive ? 'text-[#A08020] dark:text-[#F8CB46]' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {track.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deep Curation Mode Card */}
              <div className="bg-[#e4dfcd] dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-between min-h-[200px]">
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 mb-2">Deep Curation Mode</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed sm:max-w-[200px]">
                    Enter a distraction-free environment where the UI recedes, leaving only the primary text and your thoughts.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-6 sm:mt-4 gap-6 sm:gap-4">
                  <button onClick={() => setIsZenMode(!isZenMode)} className="bg-[#8c6b16] hover:bg-[#725712] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-colors w-fit shadow-sm">
                    {isZenMode ? 'Disable Sanctuary' : 'Enable Sanctuary'}
                  </button>
                  
                  {/* CSS Animated Focus Level Circle */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center self-end sm:self-auto">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle cx="50%" cy="50%" r="42%" className="stroke-[#e4dfcd] dark:stroke-zinc-800" strokeWidth="6" fill="none" />
                      <circle cx="50%" cy="50%" r="42%" 
                        className="stroke-[#8c6b16]" 
                        strokeWidth="6" 
                        fill="none" 
                        strokeDasharray="100" 
                        strokeDashoffset={100 - focusLevel}
                        pathLength="100"
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                    </svg>
                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 z-10 font-mono">
                      {focusLevel}<span className="text-[10px]">%</span>
                    </span>
                    <span className="absolute -bottom-3 sm:-bottom-3 text-[6px] sm:text-[7px] font-bold uppercase tracking-widest text-zinc-500 bg-[#e4dfcd] dark:bg-zinc-900 px-1 whitespace-nowrap z-10">Focus Level</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <footer className="text-center py-8 mt-4 text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] font-bold">
            Privacy · Accessibility · Terms<br/>
            <span className="mt-2 block opacity-70">© {new Date().getFullYear()} Hizz-Web Cognitive Sanctuary</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
