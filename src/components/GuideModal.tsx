import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, FolderTree, Cpu, BookOpen, Layers, Sparkles, Film } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'folder' | 'backend' | 'ffmpeg' | 'guide'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const ffmpeg169 = `ffmpeg -loop 1 -i cover.png -i song.mp3 -filter_complex \\
"[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=1920x1080:fps=60[v]; \\
 [v]drawtext=text='Song Title':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=h*0.82:shadowcolor=black@0.8:shadowx=3:shadowy=3[outv]" \\
-map "[outv]" -map 1:a -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest output_16x9.mp4`;

  const ffmpeg916 = `ffmpeg -loop 1 -i cover.png -i song.mp3 -filter_complex \\
"[0:v]scale=-1:8000,zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=1080x1920:fps=60[v]; \\
 [v]drawtext=text='Song Title':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.80:shadowcolor=black@0.8:shadowx=3:shadowy=3[outv]" \\
-map "[outv]" -map 1:a -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest shorts_9x16.mp4`;

  const pythonFastAPI = `from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI(title="AI Music Video Creator API")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AnalyzeRequest(BaseModel):
    title: str
    artist: str
    style: str

@app.post("/api/analyze-audio")
async def analyze_audio(req: AnalyzeRequest):
    model = genai.GenerativeModel('gemini-3.6-flash')
    prompt = f"Analyze the song '{req.title}' by '{req.artist}' for a '{req.style}' music video. Return JSON with mood, genre, and detailed visual prompt."
    response = model.generate_content(prompt)
    return {"analysis": response.text}

@app.post("/api/generate-cover")
async def generate_cover(prompt: str, aspect_ratio: str = "16:9"):
    # Generate cover art using Gemini image generation model
    model = genai.GenerativeModel('gemini-3.1-flash-lite-image')
    result = model.generate_content(prompt)
    return {"image_url": result}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#08080a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0c0c0e]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase">4SAI AudioCanvas AI — Developer Guide</h2>
              <p className="text-xs text-gray-400">Complete project blueprints, Python FastAPI / Express code & FFmpeg commands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#0c0c0e]/80 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'architecture', label: '1. Architecture', icon: Cpu },
            { id: 'folder', label: '2. Folder Structure', icon: FolderTree },
            { id: 'backend', label: '3. Backend (FastAPI / Express)', icon: Code2 },
            { id: 'ffmpeg', label: '4. FFmpeg Commands', icon: Terminal },
            { id: 'guide', label: '5. Setup & Dev Guide', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300 leading-relaxed flex-1">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" /> End-to-End System Architecture
              </h3>
              <p>
                4SAI AudioCanvas AI transforms MP3 files into copyright-safe animated MP4 music visuals using a modern full-stack pipeline:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 bg-[#0c0c0e] rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Frontend Layer</span>
                  <p className="font-bold text-white text-xs">React + HTML5 Canvas</p>
                  <p className="text-[11px] text-gray-400">
                    Client-side Web Audio API frequency analysis, 60FPS multi-layer Ken Burns canvas renderer & MediaRecorder video exporter.
                  </p>
                </div>

                <div className="p-4 bg-[#0c0c0e] rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">AI Service Layer</span>
                  <p className="font-bold text-white text-xs">Google Gemini AI</p>
                  <p className="text-[11px] text-gray-400">
                    <strong className="text-gray-200">gemini-3.6-flash</strong> for audio mood analysis & prompt crafting; <strong className="text-gray-200">gemini-3.1-flash-lite-image</strong> for cover art generation.
                  </p>
                </div>

                <div className="p-4 bg-[#0c0c0e] rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider">Backend Service</span>
                  <p className="font-bold text-white text-xs">Python FastAPI / Express</p>
                  <p className="text-[11px] text-gray-400">
                    REST API handling audio file uploads, Gemini SDK server proxying, and optional offline FFmpeg rendering tasks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'folder' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-500" /> Clean Folder Structure
              </h3>
              <pre className="p-4 bg-black rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto">
{`ai-music-video-creator/
├── server.ts                  # Express / Node server (or main.py Python FastAPI)
├── package.json               # Full stack dependencies
├── vite.config.ts             # Vite configuration
├── metadata.json              # App capabilities & secrets config
├── .env.example               # GEMINI_API_KEY declaration
└── src/
    ├── main.tsx               # Client entry point
    ├── App.tsx                # Main state controller & 4-step wizard
    ├── index.css              # Tailwind styling
    ├── types.ts               # Shared TypeScript types
    ├── data/
    │   ├── styles.ts          # 6 Visual themes (Cinematic, Cyberpunk, Anime...)
    │   └── sampleTracks.ts    # Royalty-free audio synth generators
    └── components/
        ├── Navbar.tsx         # Navigation header & format selector
        ├── Step1Upload.tsx    # Audio dropzone & waveform spectrum player
        ├── Step2Style.tsx     # Style cards & aspect ratio selector
        ├── Step3Generate.tsx  # Gemini song analysis & cover art generator
        ├── Step4Export.tsx    # 60FPS canvas video exporter & recorder
        └── GuideModal.tsx     # Architecture & FFmpeg developer guide`}
              </pre>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-500" /> Python FastAPI Backend Implementation
                </h3>
                <button
                  onClick={() => copyCode(pythonFastAPI, 'py')}
                  className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg flex items-center gap-1 border border-white/10"
                >
                  {copiedSection === 'py' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'py' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-black rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto">
                {pythonFastAPI}
              </pre>
            </div>
          )}

          {activeTab === 'ffmpeg' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-500" /> YouTube Standard Format (1920x1080 16:9)
                  </h4>
                  <button
                    onClick={() => copyCode(ffmpeg169, 'ff169')}
                    className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg flex items-center gap-1 border border-white/10"
                  >
                    {copiedSection === 'ff169' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'ff169' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-black rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto">
                  {ffmpeg169}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-500" /> YouTube Shorts Format (1080x1920 9:16)
                  </h4>
                  <button
                    onClick={() => copyCode(ffmpeg916, 'ff916')}
                    className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg flex items-center gap-1 border border-white/10"
                  >
                    {copiedSection === 'ff916' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'ff916' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-black rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto">
                  {ffmpeg916}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" /> Step-by-Step Development & API Setup
              </h3>
              <ol className="list-decimal list-inside space-y-3 font-sans text-xs text-gray-300">
                <li>
                  <strong className="text-white">API Key Configuration:</strong> Set your <code className="text-amber-400">GEMINI_API_KEY</code> secret in AI Studio Settings &gt; Secrets.
                </li>
                <li>
                  <strong className="text-white">Upload Audio:</strong> Provide an MP3 file on Page 1 or click one of the instant synthetic audio tracks.
                </li>
                <li>
                  <strong className="text-white">Choose Visual Vibe:</strong> Pick among Cinematic, Cyberpunk, Anime, Fantasy, Relaxing, or Minimal styles on Page 2 and select 16:9 YouTube or 9:16 Shorts aspect ratio.
                </li>
                <li>
                  <strong className="text-white">Generate Cover Art:</strong> On Page 3, Gemini AI analyzes the song title and mood to craft a visual prompt, then creates the high-definition cover art image.
                </li>
                <li>
                  <strong className="text-white">Live Render & Download:</strong> On Page 4, watch the 60FPS Ken Burns animation with particle effects and audio visualizer, then click "Start Live MP4 Video Render" to download your finished video!
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
