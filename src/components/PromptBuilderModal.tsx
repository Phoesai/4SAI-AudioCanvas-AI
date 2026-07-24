import React, { useState, useEffect } from 'react';
import { StyleId } from '../types';
import { generateCoverPrompt, STYLE_PROMPT_TEMPLATES } from '../lib/promptTemplates';
import { Sparkles, Wand2, Copy, Check, X, RefreshCw, Layers, Sliders, Palette, Camera } from 'lucide-react';

interface PromptBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: StyleId;
  initialMood?: string;
  initialGenre?: string;
  songTitle?: string;
  onApplyPrompt: (prompt: string, styleId: StyleId) => void;
}

const SUPPORTED_STYLES: { id: StyleId; name: string }[] = [
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'anime', name: 'Anime' },
  { id: 'relaxing', name: 'Relaxing' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'minimal', name: 'Minimal' },
];

const MOOD_PRESETS = ['Energetic', 'Nostalgic', 'Ethereal', 'Moody', 'Melancholic', 'Epic', 'Chillout', 'Dark & Intense'];
const GENRE_PRESETS = ['Lo-Fi / Chill', 'Synthwave / Phonk', 'Film Score', 'EDM / Dance', 'Folk / Acoustic', 'Deep House', 'Ambient'];

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  initialMood,
  initialGenre,
  songTitle,
  onApplyPrompt,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<StyleId>(currentStyle || 'cinematic');
  const [mood, setMood] = useState(initialMood || 'Epic');
  const [genre, setGenre] = useState(initialGenre || 'Orchestral');
  const [keywords, setKeywords] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isRefiningWithAi, setIsRefiningWithAi] = useState(false);

  useEffect(() => {
    setSelectedStyle(currentStyle || 'cinematic');
  }, [currentStyle]);

  useEffect(() => {
    if (initialMood) setMood(initialMood);
    if (initialGenre) setGenre(initialGenre);
  }, [initialMood, initialGenre]);

  if (!isOpen) return null;

  const generated = generateCoverPrompt({
    style: selectedStyle,
    mood,
    genre,
    title: songTitle || 'Music Track',
    keywords,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generated.fullPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAiRefine = async () => {
    setIsRefiningWithAi(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: songTitle || 'Music Track',
          style: selectedStyle,
          keywords,
          mood,
          genre,
        }),
      });
      const data = await res.json();
      if (data.prompt) {
        setKeywords(data.prompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefiningWithAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e0e12] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">AI Cover Art Prompt Generator</h3>
              <p className="text-xs text-gray-400">Craft YouTube-optimized prompts based on mood, genre & visual style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Style Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Style Selection
            </label>
            <div className="space-y-1.5">
              {SUPPORTED_STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedStyle === st.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {st.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mood & Genre Pickers */}
          <div className="md:col-span-2 space-y-4">
            {/* Song Mood */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Song Mood / Vibe
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {MOOD_PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      mood === m
                        ? 'bg-amber-500 text-black font-bold border-amber-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Or type custom mood (e.g. Bittersweet Twilight)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Song Genre */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Music Genre
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {GENRE_PRESETS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      genre === g
                        ? 'bg-amber-500 text-black font-bold border-amber-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Or type genre (e.g. Orchestral Phonk)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Extra Keywords / Elements */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" /> Key Visual Elements (Optional)
                </label>
                <button
                  onClick={handleAiRefine}
                  disabled={isRefiningWithAi}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRefiningWithAi ? 'animate-spin' : ''}`} />
                  <span>{isRefiningWithAi ? 'AI Generating...' : 'Auto-Generate with Gemini'}</span>
                </button>
              </div>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. rainy rooftop, glowing lotus flower, starry night"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Professional YouTube Cover Prompt
            </span>
            <span className="text-[10px] text-gray-400 font-mono">{generated.youtubeTarget}</span>
          </div>

          <p className="text-xs text-gray-200 font-mono leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
            {generated.fullPrompt}
          </p>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-400 block font-bold">Lighting</span>
              <span className="text-amber-300 block truncate">{generated.lighting}</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-400 block font-bold">Atmosphere</span>
              <span className="text-amber-200 block truncate">{generated.atmosphere}</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-400 block font-bold">Camera</span>
              <span className="text-amber-200 block truncate">{generated.cameraSettings}</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-400 block font-bold">Color Accents</span>
              <div className="flex items-center gap-1 mt-1">
                {generated.colorPalette.map((col, idx) => (
                  <span key={idx} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: col }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 border border-white/10 flex items-center gap-2 transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
          </button>

          <button
            onClick={() => {
              onApplyPrompt(generated.fullPrompt, selectedStyle);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply to Cover Generator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
