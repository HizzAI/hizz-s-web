import { Home, History, Bookmark, Activity, HelpCircle, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Bookmark, label: 'Bookmarks', path: '/library' },
  { icon: Activity, label: 'Analytics', path: '/analytics' },
];

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-16 md:w-64 h-full shrink-0 flex flex-col py-8 px-2 md:px-0 md:pr-6 border-r border-black/5 dark:border-white/5 font-inter overflow-hidden">
      {/* Profile briefly */}
      <div className="mb-8 hidden md:block w-full overflow-hidden">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 truncate w-full text-ellipsis overflow-hidden whitespace-nowrap block" title={user?.username || 'The Mindful Curator'}>
          {user?.username || 'The Mindful Curator'}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A08020] mt-1 text-ellipsis overflow-hidden whitespace-nowrap">
          Zen Mode Active
        </p>
      </div>

      {/* New Entry Button */}
      <button 
        onClick={() => navigate('/focus')}
        className="w-full flex items-center justify-center gap-2 py-3 md:py-3 px-4 md:px-0 bg-[#F8CB46] hover:bg-[#e0b73c] text-zinc-900 
          font-bold text-sm tracking-wide rounded-full transition-all duration-200 shadow-sm hover:shadow-md mb-8"
      >
        <Plus size={16} strokeWidth={2.5} className="shrink-0" />
        <span className="hidden md:inline">New Entry</span>
      </button>

      {/* Navigation Options */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `flex items-center justify-center md:justify-start gap-3 px-4 md:px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive 
                ? 'bg-zinc-200/70 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:bg-black/5 dark:hover:bg-white/5 dark:hover:text-zinc-100'
            }`}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={2} className={`shrink-0 ${
                  isActive 
                    ? (label === 'Analytics' ? 'text-[#F8CB46]' : 'text-zinc-900 dark:text-zinc-100') 
                    : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                }`} />
                <span className="hidden md:inline">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-2 pt-6">
        <button 
          onClick={() => setIsHelpOpen(true)}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 md:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
            isHelpOpen 
              ? 'bg-zinc-200/70 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 shadow-sm' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <HelpCircle size={16} strokeWidth={2} className={`shrink-0 ${isHelpOpen ? 'text-[#F8CB46]' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
          <span className="hidden md:inline">Help</span>
        </button>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center md:justify-start gap-3 px-4 md:px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors group"
        >
          <LogOut size={16} strokeWidth={2} className="shrink-0 text-zinc-400 group-hover:text-red-500" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#F5F5DC] dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl animate-slide-up flex flex-col p-8 border border-black/10 dark:border-white/10 relative">
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-zinc-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">How to use Hizz's Web</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46]/20 flex items-center justify-center border border-[#F8CB46]/50">
                  <span className="text-[#A08020] dark:text-[#F8CB46] font-bold text-xs">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Feed Your Mind</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Paste an article into the Focus Hub.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46]/20 flex items-center justify-center border border-[#F8CB46]/50">
                  <span className="text-[#A08020] dark:text-[#F8CB46] font-bold text-xs">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Transform</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Toggle Bionic Mode or the Focus Ruler for easier reading.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46]/20 flex items-center justify-center border border-[#F8CB46]/50">
                  <span className="text-[#A08020] dark:text-[#F8CB46] font-bold text-xs">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Listen</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Click 'Read Aloud' (or Autoplay) to engage the Speaker Mode.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#F8CB46]/20 flex items-center justify-center border border-[#F8CB46]/50">
                  <span className="text-[#A08020] dark:text-[#F8CB46] font-bold text-xs">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Review</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Visit your Library to see saved Main Points and Timelines.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="mt-8 w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold hover:shadow-md transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#F5F5DC] dark:bg-zinc-900 w-full max-w-sm rounded-3xl shadow-2xl flex flex-col p-8 border border-black/10 dark:border-white/10 relative text-center" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
             <style>{`
               @keyframes slideUp {
                 0% { opacity: 0; transform: translateY(16px) scale(0.96); }
                 100% { opacity: 1; transform: translateY(0) scale(1); }
               }
             `}</style>
             <h3 className="font-serif text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">Depart Sanctuary?</h3>
             <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-[200px] mx-auto leading-relaxed">Are you sure you want to leave your Sanctuary?</p>
             <div className="flex gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">Stay</button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Depart</button>
             </div>
          </div>
        </div>
      )}
    </aside>
  );
}
