import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function AudioPlayer({ className = "", trackTitle = "The Architecture of Silence", trackSub = "6:24 / 18:00 • AMBIENT FOCUS PATH" }) {
  const { isPlaying, togglePause, speak, currentWordIndex } = useSpeechSynthesis();

  // If no text is speaking, playing should be false unless they hit play, which we can mock or start a default text.
  // We'll just hook the buttons to the hook.
  
  const handlePlayPause = () => {
    togglePause();
  };

  // Mock progress based on currentWordIndex if we wanted to
  const progressPercent = currentWordIndex > 0 ? Math.min((currentWordIndex / 500) * 100, 100) : 35; // default 35% visually

  return (
    <div className={`glass-light dark:glass rounded-full px-6 py-3 flex items-center gap-6 shadow-xl w-full max-w-3xl ${className}`}>
      
      {/* Track Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-[#F8CB46] text-zinc-900 flex items-center justify-center shrink-0">
           {/* Simple icon or album art */}
           <div className="w-4 h-4 bg-zinc-900 rounded-[3px]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{trackTitle}</span>
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none mt-1">
            {trackSub}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <SkipBack size={16} fill="currentColor" />
        </button>
        <button 
          onClick={handlePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#A08020] hover:bg-[#b89528] text-white transition-colors"
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={0} className="ml-1" />
          )}
        </button>
        <button className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <SkipForward size={16} fill="currentColor" />
        </button>
      </div>

      {/* Volume & Progress */}
      <div className="flex items-center gap-3 w-48 shrink-0">
        <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 bottom-0 bg-[#A08020]" 
             style={{ width: `${progressPercent}%` }}
           />
        </div>
        <Volume2 size={16} className="text-zinc-400 shrink-0" />
      </div>

    </div>
  );
}
