import React, { useState, useEffect } from 'react';
import { SongAnalysis, AnimationSettings, StyleId, AspectRatio, AudioTrackInfo } from '../types';
import { STYLES } from '../data/styles';
import { PromptBuilderModal } from './PromptBuilderModal';
import { Sparkles, Wand2, Image as ImageIcon, RefreshCw, Upload, ArrowLeft, ArrowRight, CheckCircle2, Play, AlertCircle, Eye, Settings2, SlidersHorizontal } from 'lucide-react';

interface Step3GenerateProps {
  audio: AudioTrackInfo | null;
  selectedStyle: StyleId;
  aspectRatio: AspectRatio;
  analysis: SongAnalysis | null;
  setAnalysis: (analysis: SongAnalysis | null) => void;
  coverImageUrl: string | null;
  setCoverImageUrl: (url: string | null) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  animation: AnimationSettings;
  setAnimation: (anim: AnimationSettings) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3Generate: React.FC<Step3GenerateProps> = ({
  audio,
  selectedStyle,
  aspectRatio,
  analysis,
  setAnalysis,
  coverImageUrl,
  setCoverImageUrl,
  customPrompt,
  setCustomPrompt,
  animation,
  setAnimation,
  onBack,
  onNext,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const currentStyleObj = STYLES.find((s) => s.id === selectedStyle) || STYLES[0];

  // Auto-run AI Analysis if not analyzed yet
  useEffect(() => {
    if (!analysis && audio && !isAnalyzing) {
      handleAnalyzeSong();
    }
  }, [audio, selectedStyle]);

  // Set default prompt if empty
  useEffect(() => {
    if (!customPrompt) {
      setCustomPrompt(currentStyleObj.defaultPrompt);
    }
  }, [selectedStyle]);

  const handleAnalyzeSong = async () => {
    if (!audio) return;
    setIsAnalyzing(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: audio.title,
          artist: audio.artist,
          fileName: audio.name,
          selectedStyle,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        if (data.analysis.imagePrompt) {
          setCustomPrompt(data.analysis.imagePrompt);
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCover = async () => {
    setIsGeneratingImage(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || currentStyleObj.defaultPrompt,
          aspectRatio,
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCoverImageUrl(data.imageUrl);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setGenerationError(err.message || 'Image generation failed');
      // Set preset preview as immediate fallback so user is never blocked
      setCoverImageUrl(currentStyleObj.previewImage);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRefinePrompt = async () => {
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: audio?.title,
          style: selectedStyle,
          keywords: analysis?.mood,
        }),
      });
      const data = await res.json();
      if (data.prompt) {
        setCustomPrompt(data.prompt);
      }
    } catch (e) {
      console.error('Prompt refine error', e);
    }
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setCoverImageUrl(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
          <Wand2 className="w-3.5 h-3.5" /> Step 3: AI Cover Art & Motion FX
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">AI Song Analysis & Cover Art</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Gemini AI analyzes your song title, mood & style to compose cover art and configure motion layers.
        </p>
      </div>

      {/* AI Analysis Banner */}
      <div className="bg-[#0c0c0e]/80 p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Song Mood & Concept Breakdown
            </h3>
            <p className="text-xs text-gray-400">Song analysis powered by Google Gemini AI</p>
          </div>
          <button
            onClick={handleAnalyzeSong}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold rounded-lg border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-analyze Song'}</span>
          </button>
        </div>

        {isAnalyzing ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-300 font-medium">Gemini AI is analyzing song title, mood & genre...</p>
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mood Vibe</span>
              <span className="text-xs font-bold text-amber-400 mt-1 block truncate">{analysis.mood}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Genre</span>
              <span className="text-xs font-bold text-amber-300 mt-1 block truncate">{analysis.genre}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tempo / Rhythm</span>
              <span className="text-xs font-bold text-amber-200 mt-1 block truncate">{analysis.tempo}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Theme Palette</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {analysis.colorPalette?.map((c, idx) => (
                  <span key={idx} className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Cover Image Generation & Prompt Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Prompt & Generator Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0c0c0e]/80 p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-500" /> AI Image Prompt Workspace
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPromptModalOpen(true)}
                  className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                >
                  <SlidersHorizontal className="w-3 h-3" /> Prompt System (Templates)
                </button>
                <button
                  onClick={handleRefinePrompt}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Enhance
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
              placeholder="Describe the cover image you want to generate..."
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleGenerateCover}
                disabled={isGeneratingImage}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Image with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Cover Image ({aspectRatio})</span>
                  </>
                )}
              </button>

              <label className="text-xs text-gray-300 hover:text-white cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload Custom Artwork</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {generationError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Gemini Image Generation Note:</p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    {generationError}. Loaded high-resolution aesthetic artwork preset so you can proceed without interruption!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Animation & Visualizer Settings */}
          <div className="bg-[#0c0c0e]/80 p-5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Settings2 className="w-4 h-4 text-amber-500" /> Audio Waveform & Animated Title Options
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Audio Visualizer Style */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Audio Visualizer Overlay</label>
                <select
                  value={animation.audioVisualizer}
                  onChange={(e) => setAnimation({ ...animation, audioVisualizer: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="bars" className="bg-[#0c0c0e]">Dynamic Equalizer Bars (Bottom)</option>
                  <option value="wave" className="bg-[#0c0c0e]">Audio Wave Sine Line (Glowing)</option>
                  <option value="circle" className="bg-[#0c0c0e]">Circular Radial Spectrum (Center)</option>
                  <option value="particles" className="bg-[#0c0c0e]">Audio-Reactive Particles Pulse</option>
                  <option value="none" className="bg-[#0c0c0e]">No Visualizer (Clean Cover Art)</option>
                </select>
              </div>

              {/* Title Animation Style */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Animated Song Title Effect</label>
                <select
                  value={animation.textAnimation}
                  onChange={(e) => setAnimation({ ...animation, textAnimation: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="fade-glow" className="bg-[#0c0c0e]">Cinematic Fade & Ambient Glow</option>
                  <option value="typewriter" className="bg-[#0c0c0e]">Typewriter Character Slide</option>
                  <option value="slide-up" className="bg-[#0c0c0e]">Smooth Slide-Up & Float</option>
                  <option value="subtle-pulse" className="bg-[#0c0c0e]">Subtle Breathing Pulse</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Cover Image Preview Frame */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0c0c0e]/90 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Generated Cover Preview
              </span>
              <span className="text-[11px] font-mono text-amber-400">{aspectRatio} Format</span>
            </div>

            {/* Preview Canvas / Image Container */}
            <div
              className={`w-full rounded-xl border border-white/10 bg-black overflow-hidden relative group flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[460px]' : aspectRatio === '1:1' ? 'aspect-square max-h-[380px]' : 'aspect-video max-h-[300px]'
              }`}
            >
              {coverImageUrl ? (
                <>
                  <img
                    src={coverImageUrl}
                    alt="Cover Art"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Title Overlay Preview */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-center space-y-0.5">
                    <p className="text-sm font-extrabold text-white drop-shadow-md">{audio?.title || 'Song Title'}</p>
                    <p className="text-xs font-medium text-amber-400 drop-shadow-sm">{audio?.artist || 'Artist Name'}</p>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mx-auto border border-white/10">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-400">Click "Generate AI Cover Image" or select preset to preview</p>
                  <button
                    onClick={() => setCoverImageUrl(currentStyleObj.previewImage)}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-gray-200 rounded-lg border border-white/10"
                  >
                    Use {currentStyleObj.name} Preset Image
                  </button>
                </div>
              )}
            </div>
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
          <span>Back to Style</span>
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 transition-all shadow-xl shadow-amber-500/10 scale-100 hover:scale-[1.02]"
        >
          <span>Continue to Step 4: Preview & Export MP4</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Prompt Builder System Modal */}
      <PromptBuilderModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        currentStyle={selectedStyle}
        initialMood={analysis?.mood}
        initialGenre={analysis?.genre}
        songTitle={audio?.title}
        onApplyPrompt={(newPrompt) => {
          setCustomPrompt(newPrompt);
        }}
      />
    </div>
  );
};
