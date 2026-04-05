import { Zap, AlignLeft, Crosshair, Palette, Brain, Settings, Clock } from 'lucide-react';
import { getHistory } from '../utils/textUtils';
import { useState, useEffect } from 'react';

const navItems = [
  { icon: Zap, label: 'Bionic Mode', key: 'bionic' },
  { icon: AlignLeft, label: 'Dyslexia Font', key: 'dyslexic' },
  { icon: Crosshair, label: 'Focus Ruler', key: 'ruler' },
  { icon: Palette, label: 'Calm Colors', key: 'colors' },
];

function Toggle({ label, icon: Icon, checked, onChange }) {
  return (
    <label className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
      hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors" strokeWidth={1.8} />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-thumb" />
      </label>
    </label>
  );
}

export default function Sidebar({ settings, onSettingChange, onADHDMode, onLoadHistory, history, onClearHistory }) {

  return (
    <aside className="w-full md:w-64 shrink-0 h-full flex flex-col gap-4 py-4">
      {/* Control Center */}
      <div className="glass-light dark:glass rounded-2xl p-4 animate-fade-in">
        <p className="text-caption text-zinc-500 dark:text-zinc-400 mb-3">Control Center</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Personalize your view</p>

        <div className="flex flex-col gap-1">
          {navItems.map(({ icon, label, key }) => (
            <Toggle
              key={key}
              icon={icon}
              label={label}
              checked={!!settings[key]}
              onChange={e => onSettingChange(key, e.target.checked)}
            />
          ))}
        </div>

        {/* Spacing controls */}
        <div className="mt-4 space-y-3">
          {[
            { label: 'Font Size', key: 'fontSize', min: 14, max: 24, step: 1, unit: 'px' },
            { label: 'Line Height', key: 'lineHeight', min: 1.4, max: 3.0, step: 0.1, unit: '×' },
            { label: 'Letter Spacing', key: 'letterSpacing', min: 0, max: 0.2, step: 0.01, unit: 'em' },
          ].map(({ label, key, min, max, step, unit }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
                <span className="text-xs font-medium text-primary">{Number(settings[key]).toFixed(step < 1 ? 1 : 0)}{unit}</span>
              </div>
              <input
                type="range"
                min={min} max={max} step={step}
                value={settings[key]}
                onChange={e => onSettingChange(key, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* ADHD Mode */}
        <button
          onClick={onADHDMode}
          className="w-full mt-4 flex items-center gap-2 justify-center py-2.5 rounded-xl
            bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900
            font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Brain size={16} strokeWidth={2} />
          ADHD Mode
        </button>
      </div>

      {/* History */}
      <div className="glass-light dark:glass rounded-2xl p-4 flex-1 overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-zinc-500 dark:text-zinc-400" />
            <p className="text-caption text-zinc-500 dark:text-zinc-400">Recent</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {history.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No history yet. Process some text!</p>
          ) : history.map(item => (
            <div 
              key={item.id} 
              onClick={() => onLoadHistory(item)}
              className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-primary transition-colors">
                {item.title || 'Session'}
              </p>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                <span>{item.wordCount || 0} words</span>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
