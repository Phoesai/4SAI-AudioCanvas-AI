import React, { useState, useEffect } from 'react';
import {
  Music,
  Palette,
  Wand2,
  Film,
  BookOpen,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  Sparkles,
  Monitor,
  Smartphone,
  Square,
  X,
  Menu,
} from 'lucide-react';
import { AspectRatio } from '../types';

interface SidebarProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  onOpenGuide: () => void;
  trackName?: string;
  hasAudio: boolean;
  hasStyle: boolean;
  hasCover: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeStep,
  setActiveStep,
  aspectRatio,
  setAspectRatio,
  onOpenGuide,
  trackName,
  hasAudio,
  hasStyle,
  hasCover,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('4sai_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('4sai_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const steps = [
    {
      num: 1,
      title: 'Audio Input',
      desc: 'Upload MP3',
      icon: Music,
      ready: true,
      completed: hasAudio,
    },
    {
      num: 2,
      title: 'Visual Style',
      desc: 'Theme & Motion',
      icon: Palette,
      ready: hasAudio || activeStep >= 2,
      completed: hasStyle,
    },
    {
      num: 3,
      title: 'Cover & Motion',
      desc: 'AI Artwork & FX',
      icon: Wand2,
      ready: hasStyle || activeStep >= 3,
      completed: hasCover,
    },
    {
      num: 4,
      title: 'Render & Export',
      desc: 'Export MP4',
      icon: Film,
      ready: hasCover || activeStep >= 4,
      completed: false,
    },
  ];

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <>
      {/* Mobile Header Toggle (Only visible on small screens) */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0b0f14]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
            aria-label="Open Project Navigation"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center font-mono font-black text-[11px] text-black">
              4SAI
            </div>
            <div>
              <h1 className="text-xs font-black text-white uppercase tracking-tight">AudioCanvas AI</h1>
              <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                {trackName || 'No audio loaded'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Aspect Ratio Pills for Mobile */}
        <div className="flex items-center bg-[#111827] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              aspectRatio === '16:9' ? 'bg-amber-500 text-black' : 'text-gray-400'
            }`}
          >
            16:9
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              aspectRatio === '9:16' ? 'bg-amber-500 text-black' : 'text-gray-400'
            }`}
          >
            9:16
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-72 bg-[#0b0f14] h-full border-r border-white/10 p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center font-mono font-black text-xs text-black">
                    4SAI
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase">AudioCanvas AI</h2>
                    <p className="text-[10px] text-amber-400 font-semibold">Copyright-Safe Visuals</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Project Workflow</p>
                {steps.map((st) => {
                  const Icon = st.icon;
                  const isActive = activeStep === st.num;
                  return (
                    <button
                      key={st.num}
                      onClick={() => {
                        setActiveStep(st.num);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-amber-500 text-black font-extrabold'
                            : st.completed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {st.completed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{st.num}. {st.title}</div>
                        <div className="text-[10px] text-gray-400">{st.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  onOpenGuide();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Docs & FFmpeg CLI Specs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Collapsible Left Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between h-screen sticky top-0 bg-[#0b0f14] border-r border-white/10 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Top Brand Section */}
        <div>
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 font-mono font-black text-xs text-black border border-amber-400/30">
                  4SAI
                </div>
                <div className="truncate">
                  <h1 className="text-xs font-black text-white uppercase tracking-tight truncate">AudioCanvas AI</h1>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                    <ShieldCheck className="w-2.5 h-2.5" /> Copyright-Safe
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-mono font-black text-xs text-black border border-amber-400/30">
                4S
              </div>
            )}

            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Active Track Banner */}
          {!isCollapsed && trackName && (
            <div className="mx-3 mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">Active Track</span>
              <span className="text-xs font-bold text-white truncate block">{trackName}</span>
            </div>
          )}

          {/* Navigation Steps */}
          <nav className="p-2 space-y-1.5 mt-2">
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">
                Project Workflow
              </p>
            )}

            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = activeStep === st.num;
              const isCompleted = st.completed;

              return (
                <button
                  key={st.num}
                  onClick={() => setActiveStep(st.num)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all border group relative ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold shadow-lg shadow-amber-500/5'
                      : isCompleted
                      ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                  title={isCollapsed ? `${st.num}. ${st.title} (${st.desc})` : undefined}
                >
                  {/* Step Indicator Badge */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/30'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>

                  {!isCollapsed && (
                    <div className="truncate">
                      <div className={`text-xs ${isActive ? 'font-black text-white' : 'font-bold'}`}>
                        {st.num}. {st.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{st.desc}</div>
                    </div>
                  )}

                  {/* Tooltip for Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1f2937] text-white text-xs font-bold rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {st.num}. {st.title}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tools & Format Controls */}
        <div className="p-2 border-t border-white/10 space-y-2">
          {!isCollapsed && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 px-2 block">
                Canvas Format
              </span>
              <div className="grid grid-cols-3 gap-1 bg-[#111827] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-1 text-[10px] font-bold rounded-lg flex flex-col items-center gap-0.5 transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="16:9 YouTube Standard"
                >
                  <Monitor className="w-3 h-3" />
                  <span>16:9</span>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-1 text-[10px] font-bold rounded-lg flex flex-col items-center gap-0.5 transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="9:16 Vertical Shorts/TikTok"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>9:16</span>
                </button>
                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`py-1 text-[10px] font-bold rounded-lg flex flex-col items-center gap-0.5 transition-all ${
                    aspectRatio === '1:1'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="1:1 Square Format"
                >
                  <Square className="w-3 h-3" />
                  <span>1:1</span>
                </button>
              </div>
            </div>
          )}

          {/* Guide / Docs Trigger */}
          <button
            onClick={onOpenGuide}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start gap-2.5'
            } p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all group relative`}
            title="Docs & FFmpeg CLI Pipeline Specs"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Docs & FFmpeg</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1f2937] text-white text-xs font-bold rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Docs & FFmpeg CLI Specs
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
