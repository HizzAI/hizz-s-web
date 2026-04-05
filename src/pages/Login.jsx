import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowRight, User, Mail, Sparkles } from 'lucide-react';

const TAGLINES = [
  'Your mind, uncluttered.',
  'Focus, curated.',
  'Read smarter. Think clearer.',
];

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef();

  // Rotate taglines for atmosphere
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name to continue.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      login(name.trim(), email.trim());
      navigate('/');
    }, 700);
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#F5F5DC] dark:bg-zinc-950 relative font-inter">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/8 blur-3xl" style={{animationDelay:'1.5s'}} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-amber-200/10 blur-2xl dark:bg-amber-400/5" />
      </div>

      {/* Decorative stacked lines (top-right, bottom-left) */}
      <div className="absolute top-24 right-12 space-y-2 pointer-events-none hidden lg:block">
        {[180, 140, 100, 60, 30].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full bg-zinc-300/40 dark:bg-zinc-700/40" style={{ width: w }} />
        ))}
      </div>
      <div className="absolute bottom-12 left-6 space-y-2 pointer-events-none hidden lg:block opacity-50">
        {[120, 90, 60].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-zinc-300/40 dark:bg-zinc-700/40" style={{ width: w }} />
        ))}
      </div>

      {/* ═══ LEFT — HERO ═══ */}
      <div className="hidden lg:flex flex-col justify-between py-16 px-16 w-[52%] relative">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow">
            <Zap size={17} className="text-zinc-900" strokeWidth={3} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">Hizz's Web</span>
        </div>

        {/* Hero text */}
        <div className="max-w-md animate-slide-up">
          <div key={taglineIdx} className="animate-fade-in">
            <h1 className="text-display text-zinc-900 dark:text-zinc-100 mb-5 leading-[1.05]">
              {TAGLINES[taglineIdx].split(',')[0]},<br/>
              <em className="not-italic" style={{color:'#A08020', fontWeight:800}}>
                {TAGLINES[taglineIdx].split(',')?.[1] || ''}
              </em>
            </h1>
          </div>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
            Experience the next evolution of cognitive focus. Hizz's Web provides a sanctuary for your digital reading, built on the principles of Calm Technology.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Bionic Reading', 'AI Simplification', 'Focus Ruler', 'TTS'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-black/8 dark:bg-white/8 text-zinc-600 dark:text-zinc-400 border border-black/8 dark:border-white/8">
                {f}
              </span>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="h-px w-10 bg-zinc-400/50 dark:bg-zinc-600" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Cognitive Sanctuary v1.0
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
          © {new Date().getFullYear()} Hizz's Web | All data stays local
        </p>
      </div>

      {/* ═══ RIGHT — LOGIN CARD ═══ */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-[400px] animate-slide-up">

          {/* Card */}
          <div className="glass-light dark:glass rounded-3xl p-8 shadow-2xl border border-white/60 dark:border-white/8">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Zap size={15} className="text-zinc-900" strokeWidth={3} />
              </div>
              <span className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Hizz's Web</span>
            </div>

            {/* Header */}
            <div className="mb-7">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4">
                <Sparkles size={18} className="text-primary-dark dark:text-primary" strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                Welcome to<br/>Hizz's Web
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Enter your sanctuary to begin focus mode.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 block mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="e.g. The Mindful Curator"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm
                      bg-black/5 dark:bg-white/5
                      border border-black/10 dark:border-white/10
                      text-zinc-900 dark:text-zinc-100
                      placeholder-zinc-400 dark:placeholder-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-primary/50
                      transition-all duration-200"
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
              </div>

              {/* Email (optional) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 block mb-1.5">
                  Work Email <span className="normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="curator@hizz-web.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm
                      bg-black/5 dark:bg-white/5
                      border border-black/10 dark:border-white/10
                      text-zinc-900 dark:text-zinc-100
                      placeholder-zinc-400 dark:placeholder-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-primary/50
                      transition-all duration-200"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">then</span>
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                  font-bold text-sm tracking-wide transition-all duration-200
                  ${isLoading
                    ? 'bg-primary/50 text-zinc-600 cursor-not-allowed'
                    : 'bg-primary text-zinc-900 hover:bg-primary-dark shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {isLoading
                  ? <span className="w-4 h-4 rounded-full border-2 border-zinc-600/50 border-t-zinc-700 animate-spin" />
                  : <>Continue to Sanctuary <ArrowRight size={15} strokeWidth={2.5} /></>
                }
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-5 leading-relaxed">
              No account needed. Your data stays on your device.
              <br />
              <span className="text-[10px] opacity-60">No tracking · No servers · 100% local</span>
            </p>
          </div>

          <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-5 uppercase tracking-widest">
            © {new Date().getFullYear()} Hizz's Web | Cognitive Sanctuary
          </p>
        </div>
      </div>
    </div>
  );
}
