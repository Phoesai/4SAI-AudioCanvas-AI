import React from 'react';
import { STYLES } from '../data/styles';
import { StyleId, AspectRatio, AnimationSettings } from '../types';
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Sparkles, Check, Sliders, Zap, Film } from 'lucide-react';

interface Step2StyleProps {
  selectedStyle: StyleId;
  setSelectedStyle: (style: StyleId) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  animation: AnimationSettings;
  setAnimation: (anim: AnimationSettings) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Style: React.FC<Step2StyleProps> = ({
  selectedStyle,
  setSelectedStyle,
  aspectRatio,
  setAspectRatio,
  animation,
  setAnimation,
  onBack,
  onNext,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" /> Step 2: Visual Style & Canvas
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Choose Visual Parameters</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Select the artistic direction, video aspect ratio format, and motion intensity for your music video.
        </p>
      </div>

      {/* Format & Platform Selector Section */}
      <div className="bg-[#0c0c0e]/80 p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-4 h-4 text-amber-500" /> Target Video Format & Platform
            </h3>
            <p className="text-xs text-gray-400">Choose output resolution according to where you will publish</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            Exported as 1080p MP4 Video
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 16:9 YouTube Standard */}
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              aspectRatio === '16:9'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-white/5 bg-black/60 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className={`w-5 h-5 ${aspectRatio === '16:9' ? 'text-amber-400' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-white">YouTube Standard</span>
              </div>
              {aspectRatio === '16:9' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-gray-300">1920 x 1080 (16:9 Landscape)</p>
              <p className="text-[11px] text-gray-400">For standard YouTube videos, TV screens, and laptops</p>
            </div>
          </button>

          {/* 9:16 Shorts / TikTok */}
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              aspectRatio === '9:16'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-white/5 bg-black/60 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className={`w-5 h-5 ${aspectRatio === '9:16' ? 'text-amber-400' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-white">Shorts / TikTok / Reels</span>
              </div>
              {aspectRatio === '9:16' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-gray-300">1080 x 1920 (9:16 Portrait)</p>
              <p className="text-[11px] text-gray-400">Optimized for vertical mobile feeds & YouTube Shorts</p>
            </div>
          </button>

          {/* 1:1 Instagram Square */}
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              aspectRatio === '1:1'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-white/5 bg-black/60 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${aspectRatio === '1:1' ? 'text-amber-400' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-white">Instagram Square</span>
              </div>
              {aspectRatio === '1:1' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-gray-300">1080 x 1080 (1:1 Square)</p>
              <p className="text-[11px] text-gray-400">Great for social posts & square cover album video</p>
            </div>
          </button>
        </div>
      </div>

      {/* Visual Style Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Select Visual Theme & Aesthetics
          </h3>
          <span className="text-xs text-gray-500">6 AI-tuned visual styles available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-gradient-to-b from-[#0c0c0e] via-[#0c0c0e] to-amber-950/20 ring-1 ring-amber-500 shadow-xl shadow-amber-950/40 scale-[1.02]'
                    : 'border-white/10 bg-[#0c0c0e]/80 hover:border-white/20 hover:bg-[#0c0c0e]'
                }`}
              >
                {/* Background Image Preview Header */}
                <div className="h-36 relative overflow-hidden">
                  <img
                    src={style.previewImage}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient}`} />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/80 text-gray-200 border border-white/10 backdrop-blur-md">
                      {style.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                      {style.name}
                    </h4>
                    <p className="text-xs font-medium text-amber-400/90">{style.tagline}</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{style.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Particles: <strong className="text-gray-200 capitalize">{style.particleType.replace('_', ' ')}</strong></span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.accentColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motion Options Bar */}
      <div className="bg-[#0c0c0e]/80 p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" /> Animation & Camera Motion Presets
          </h3>
          <span className="text-xs text-gray-500">Subtle camera movement & particles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Ken Burns Camera Zoom */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Ken Burns Camera Zoom Mode</label>
            <select
              value={animation.zoomEffect}
              onChange={(e) => setAnimation({ ...animation, zoomEffect: e.target.value as any })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="zoom-in" className="bg-[#0c0c0e] text-white">Slow Zoom In (Subtle Focus Expansion)</option>
              <option value="zoom-out" className="bg-[#0c0c0e] text-white">Slow Zoom Out (Revealing Atmosphere)</option>
              <option value="zoom-pan" className="bg-[#0c0c0e] text-white">Zoom & Pan Diagonal (Dynamic Motion)</option>
              <option value="subtle-sway" className="bg-[#0c0c0e] text-white">Subtle Camera Float / Sway</option>
            </select>
          </div>

          {/* Particle Effects */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Particle Overlay Effect</label>
            <select
              value={animation.particleEffect}
              onChange={(e) => setAnimation({ ...animation, particleEffect: e.target.value as any })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="embers" className="bg-[#0c0c0e] text-white">Glowing Floating Embers</option>
              <option value="stars" className="bg-[#0c0c0e] text-white">Twinkling Starfield Dust</option>
              <option value="dust" className="bg-[#0c0c0e] text-white">Ambient Atmospheric Bokeh Dust</option>
              <option value="light_leaks" className="bg-[#0c0c0e] text-white">Cinematic Anamorphic Light Leaks</option>
              <option value="rain" className="bg-[#0c0c0e] text-white">Gentle Rain & Mist Streaks</option>
              <option value="neon_sparks" className="bg-[#0c0c0e] text-white">Cyberpunk Neon Sparks</option>
              <option value="none" className="bg-[#0c0c0e] text-white">No Particles (Clean Static)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-xs bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-2 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 transition-all shadow-xl shadow-amber-500/10 scale-100 hover:scale-[1.02]"
        >
          <span>Continue to Step 3: AI Cover & Motion FX</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
