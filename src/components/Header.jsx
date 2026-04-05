import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, Bell, Settings as SettingsIcon, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [typography, setTypography] = useState(localStorage.getItem('typography') || 'sans');
  const [bionicIntensity, setBionicIntensity] = useState(localStorage.getItem('bionicIntensity') || 50);
  const [audioOutput, setAudioOutput] = useState(localStorage.getItem('audioOutput') || 'natural');

  // Load knowledgeSparks or fallback to initial mocks
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('knowledgeSparks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'New Spark: Summary generated for Architecture of Silence', unread: true },
      { id: 2, text: 'Cognitive Flow: You hit 45m of deep focus yesterday', unread: true },
      { id: 3, text: 'Library Update: 2 new bookmarks linked to "Minimalism"', unread: false }
    ];
  });

  const handleClear = () => {
    setNotifications([]);
    localStorage.removeItem('knowledgeSparks');
  };

  // Apply typography to root document element dynamically
  useEffect(() => {
    if (typography === 'serif') {
      document.documentElement.style.fontFamily = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    } else {
      document.documentElement.style.fontFamily = ''; // Allow Tailwind default sans to kick back in
    }
    localStorage.setItem('typography', typography);
  }, [typography]);

  const handleIntensityChange = (e) => {
    setBionicIntensity(e.target.value);
    localStorage.setItem('bionicIntensity', e.target.value);
  };

  const handleAudioChange = (e) => {
    setAudioOutput(e.target.value);
    localStorage.setItem('audioOutput', e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <header className={`sticky top-0 z-[9998] px-4 md:px-8 py-3 flex items-center justify-between
      glass-light dark:glass border-b border-black/5 dark:border-white/5 transition-all duration-300`}>
      
      {/* Logo & Brand */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
        <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
          Hizz-Web
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-6 ml-12">
        {['Dashboard', 'Library', 'Focus'].map(item => {
          const path = item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`;
          const isActive = useLocation().pathname === path;
          return (
            <button
              key={item}
              onClick={() => navigate(path)}
              className={`text-sm transition-all duration-200 ${
                isActive 
                  ? 'text-zinc-900 dark:text-white font-medium border-b-2 border-primary pb-1' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
            if (!isNotificationsOpen && notifications.some(n => n.unread)) {
              setNotifications(prev => prev.map(n => ({...n, unread: false})));
            }
          }} 
          className="relative text-zinc-600 dark:text-zinc-400 hover:text-[#F8CB46] transition-colors"
        >
          <Bell size={18} strokeWidth={2} />
          {notifications.some(n => n.unread) && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#F8CB46] rounded-full border border-white dark:border-zinc-900" />
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute top-12 right-2 w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden z-[100] transform origin-top-right text-left" style={{ animation: 'slideDownMenu 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <style>{`
              @keyframes slideDownMenu {
                0% { opacity: 0; transform: translateY(-12px) scale(0.96); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-zinc-900/40">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Knowledge Sparks</h3>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button onClick={handleClear} className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-[#F8CB46] transition-colors">Clear</button>
                )}
                <button onClick={() => setIsNotificationsOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(note => (
                  <div key={note.id} onClick={() => setNotifications(prev => prev.map(n => n.id === note.id ? {...n, unread: false} : n))} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${note.unread ? 'bg-[#F8CB46] shadow-[0_0_8px_rgba(248,203,70,0.6)]' : 'bg-transparent border border-zinc-300 dark:border-zinc-600'}`} />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{note.text}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs italic text-zinc-500 dark:text-zinc-400 font-medium">Your mind is clear. No new sparks today.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={() => setIsSettingsOpen(true)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#F8CB46] transition-colors">
          <SettingsIcon size={18} strokeWidth={2} />
        </button>
        {user && (
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100
              flex items-center justify-center text-xs font-bold text-white dark:text-zinc-900 shrink-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              {user.initial || user.username?.[0]?.toUpperCase()}
            </div>

            <div className="flex flex-col pr-2 hidden sm:flex max-w-[150px] overflow-hidden">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none truncate w-full block text-ellipsis whitespace-nowrap" title={user.username}>
                {user.username}
              </span>
              {user.email && (
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5 truncate w-full block text-ellipsis whitespace-nowrap" title={user.email}>
                  {user.email}
                </span>
              )}
            </div>
            <div className="w-px h-6 bg-black/10 dark:bg-white/10 hidden sm:block mx-1" />
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors text-zinc-500 dark:text-zinc-400 group"
            >
              <LogOut size={14} className="group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </header>

      {/* Settings Drawer Overlay */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9998] transition-opacity animate-fade-in" 
          onClick={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Settings Drawer Menu */}
      <div className={`fixed top-0 right-0 h-screen w-80 sm:w-96 bg-[#F5F5DC]/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-zinc-200 dark:border-zinc-800 z-[9999] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-8 flex justify-between items-center">
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Parameters</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:rotate-90 duration-300">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="p-8 pt-2 space-y-12 overflow-y-auto w-full scrollbar-hide">
             {/* Theme Toggle */}
             <div className="space-y-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46]">Sanctuary at Night</p>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Toggle Dark Mode</span>
                   <ThemeToggle />
                </div>
             </div>

             <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

             {/* Typography Selection */}
             <div className="space-y-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46]">Typography Core</p>
                <div className="flex justify-between gap-4">
                  <button 
                    onClick={() => setTypography('serif')}
                    className={`flex-1 py-5 border rounded-2xl text-xs sm:text-sm transition-all group ${typography === 'serif' ? 'border-[#A08020] dark:border-[#F8CB46] text-zinc-900 dark:text-white bg-white/50 dark:bg-zinc-800/50 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <span className="font-serif text-2xl block mb-2 opacity-80 group-hover:opacity-100">A</span> Classic Serif
                  </button>
                  <button 
                    onClick={() => setTypography('sans')}
                    className={`flex-1 py-5 border rounded-2xl text-xs sm:text-sm transition-all group ${typography === 'sans' ? 'border-[#A08020] dark:border-[#F8CB46] text-zinc-900 dark:text-white bg-white/50 dark:bg-zinc-800/50 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <span className="font-sans font-bold text-2xl block mb-2 opacity-80 group-hover:opacity-100">A</span> Modern Sans
                  </button>
                </div>
             </div>

             <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

             {/* Bionic Intensity Selection */}
             <div className="space-y-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46]">Reading Pace (Bionic)</p>
                <div className="flex justify-between items-center mb-4">
                   <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Anchor Strength</span>
                   <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">{bionicIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={bionicIntensity}
                  onChange={handleIntensityChange}
                  className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#A08020] dark:accent-[#F8CB46]"
                />
             </div>

             <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

             {/* Audio Output Selection */}
             <div className="space-y-8 pb-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A08020] dark:text-[#F8CB46]">Audio Output</p>
                <div className="flex flex-col gap-4">
                   <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Voice Signature</span>
                   <div className="relative">
                     <select 
                       value={audioOutput}
                       onChange={handleAudioChange}
                       className="w-full appearance-none bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#F8CB46]"
                     >
                       <option value="natural" className="bg-[#F5F5DC] dark:bg-zinc-900">Natural Voice</option>
                       <option value="atmospheric" className="bg-[#F5F5DC] dark:bg-zinc-900">Atmospheric Hum</option>
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                     </div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </>
  );
}
