import React from 'react';
import { BookOpen, Monitor, Smartphone, Square, ShieldCheck, Sparkles, Music } from 'lucide-react';
import { AspectRatio } from '../types';

interface NavbarProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  onOpenGuide: () => void;
  trackName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  aspectRatio,
  setAspectRatio,
  onOpenGuide,
  trackName,
}) => {
  return (
    <header className="bg-[#0b0f14]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Track & System Status Indicator */}
      <div className="flex items-center gap-3">
        {trackName ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
            <Music className="w-3.5 h-3.5 animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-[300px]">{trackName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Workspace Ready — Upload MP3 to begin</span>
          </div>
        )}

        <span className="hidden xl:inline-flex px-2 py-0.5 text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 rounded-full items-center gap-1 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Copyright-Safe Engine
        </span>
      </div>

      {/* Right Tools: Canvas Selector & Docs */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              aspectRatio === '16:9'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
            title="16:9 YouTube Standard (1920x1080)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              aspectRatio === '9:16'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
            title="9:16 Shorts / TikTok (1080x1920)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">9:16</span>
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              aspectRatio === '1:1'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
            title="1:1 Square (1080x1080)"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1:1</span>
          </button>
        </div>

        <button
          onClick={onOpenGuide}
          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          title="FFmpeg CLI Pipeline Specs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Docs & FFmpeg</span>
        </button>
      </div>
    </header>
  );
};


