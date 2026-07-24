import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Step1Upload } from './components/Step1Upload';
import { Step2Style } from './components/Step2Style';
import { Step3Generate } from './components/Step3Generate';
import { Step4Export } from './components/Step4Export';
import { GuideModal } from './components/GuideModal';
import { AudioTrackInfo, StyleId, AspectRatio, SongAnalysis, AnimationSettings } from './types';
import { STYLES } from './data/styles';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [audio, setAudio] = useState<AudioTrackInfo | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleId>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [analysis, setAnalysis] = useState<SongAnalysis | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>(STYLES[0].defaultPrompt);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const [animation, setAnimation] = useState<AnimationSettings>({
    zoomEffect: 'zoom-in',
    zoomSpeed: 0.5,
    particleEffect: 'embers',
    particleDensity: 60,
    lightLeaks: true,
    glowIntensity: 70,
    audioVisualizer: 'bars',
    visualizerPosition: 'bottom',
    textAnimation: 'fade-glow',
    textPosition: 'bottom-center',
  });

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-200 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Sidebar + Main Workspace Flex Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Collapsible Navigation Sidebar */}
        <Sidebar
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          onOpenGuide={() => setIsGuideOpen(true)}
          trackName={audio?.title}
          hasAudio={!!audio}
          hasStyle={!!selectedStyle}
          hasCover={!!coverImageUrl}
        />

        {/* Main Content Body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Compact Workspace Header Bar */}
          <Navbar
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            onOpenGuide={() => setIsGuideOpen(true)}
            trackName={audio?.title}
          />

          {/* Step Views */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeStep === 1 && (
              <Step1Upload
                audio={audio}
                setAudio={setAudio}
                onNext={() => setActiveStep(2)}
              />
            )}

            {activeStep === 2 && (
              <Step2Style
                selectedStyle={selectedStyle}
                setSelectedStyle={(style) => {
                  setSelectedStyle(style);
                  const styleObj = STYLES.find((s) => s.id === style);
                  if (styleObj) {
                    setCustomPrompt(styleObj.defaultPrompt);
                    setAnimation((prev) => ({
                      ...prev,
                      particleEffect: styleObj.particleType === 'cherry_blossoms' ? 'stars' : (styleObj.particleType as any),
                    }));
                  }
                }}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                animation={animation}
                setAnimation={setAnimation}
                onBack={() => setActiveStep(1)}
                onNext={() => setActiveStep(3)}
              />
            )}

            {activeStep === 3 && (
              <Step3Generate
                audio={audio}
                selectedStyle={selectedStyle}
                aspectRatio={aspectRatio}
                analysis={analysis}
                setAnalysis={setAnalysis}
                coverImageUrl={coverImageUrl}
                setCoverImageUrl={setCoverImageUrl}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                animation={animation}
                setAnimation={setAnimation}
                onBack={() => setActiveStep(2)}
                onNext={() => setActiveStep(4)}
              />
            )}

            {activeStep === 4 && (
              <Step4Export
                audio={audio}
                aspectRatio={aspectRatio}
                selectedStyle={selectedStyle}
                coverImageUrl={coverImageUrl}
                animation={animation}
                analysis={analysis}
                onBack={() => setActiveStep(3)}
              />
            )}
          </main>

          {/* Clean Footer Bar */}
          <footer className="border-t border-white/10 bg-[#0b0f14] py-3 px-4 text-xs text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  4SAI AudioCanvas AI — Copyright-Safe Music Visualizer & Cover Animator
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="text-gray-300 hover:text-amber-400 transition-colors underline decoration-white/20 underline-offset-4"
                >
                  FFmpeg CLI Pipeline Specs
                </button>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">Supported: 16:9 (1080p), 9:16 (Shorts), 1:1 (Square)</span>
              </div>
            </div>
          </footer>

          {/* Bottom Status Bar */}
          <div className="h-6 bg-amber-500 px-6 flex items-center justify-between text-[10px] font-bold text-black uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                FFmpeg Processing Engine: Active
              </span>
              <span className="hidden sm:inline">60FPS Canvas Streamer: Ready</span>
            </div>
            <div>4SAI AudioCanvas AI v2.4 MVP</div>
          </div>
        </div>
      </div>

      {/* Developer Architecture & FFmpeg Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}


