import React, { useRef, useState, useEffect } from 'react';
import { Upload, Music, Play, Pause, Disc, ArrowRight, Volume2, CheckCircle2 } from 'lucide-react';
import { AudioTrackInfo } from '../types';

interface Step1UploadProps {
  audio: AudioTrackInfo | null;
  setAudio: (audio: AudioTrackInfo | null) => void;
  onNext: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({ audio, setAudio, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Audio spectrum visualizer setup
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current || !isPlaying) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() * 0.003;

      const bars = 48;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        // Generate dynamic animated audio bars based on sine waves & time
        const val = (Math.sin(time * 2 + i * 0.2) + Math.cos(time * 3 - i * 0.1) + 2) / 4;
        const barHeight = val * (height * 0.75);
        const x = i * barWidth;
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#d97706');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#fef08a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }

      animationFrameId = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  const handleFileUpload = (file: File) => {
    if (!file.type.includes('audio') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav')) {
      alert('Please upload an MP3 or WAV audio file.');
      return;
    }

    const url = URL.createObjectURL(file);
    const fileNameClean = file.name.replace(/\.[^/.]+$/, "");
    
    // Attempt parsing Title - Artist from filename format "Artist - Title" or "Title"
    let parsedTitle = fileNameClean;
    let parsedArtist = 'Unknown Artist';
    if (fileNameClean.includes(' - ')) {
      const parts = fileNameClean.split(' - ');
      parsedArtist = parts[0].trim();
      parsedTitle = parts[1].trim();
    }

    // Get duration via Audio element
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      setAudio({
        file,
        name: file.name,
        title: parsedTitle,
        artist: parsedArtist,
        url,
        duration: tempAudio.duration || 180,
        isSample: false,
      });
      setIsPlaying(false);
    };
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
          <Music className="w-3.5 h-3.5" /> Step 1: Audio Input
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Upload Song Audio</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Upload your original song MP3 or WAV audio file to begin creating your animated music visual.
        </p>
      </div>

      {/* Main Upload Box & Audio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dropzone Card */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] ${
              isDragOver
                ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                : audio
                ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-400'
                : 'border-white/10 bg-[#0c0c0e]/80 hover:border-white/20 hover:bg-[#0c0c0e]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {audio ? (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{audio.title}</h3>
                  <p className="text-sm text-amber-400 font-medium">by {audio.artist}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {audio.isSample ? 'Sample Track Loaded' : audio.name} • {formatTime(audio.duration)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg border border-white/10 transition-all inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Different Audio File</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black p-0.5 mx-auto shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center font-bold">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Drag & Drop MP3 File Here</h3>
                  <p className="text-xs text-gray-400 mt-1">Supports MP3, WAV, M4A audio formats (Up to 50MB)</p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Audio File</span>
                </button>
              </div>
            )}
          </div>

          {/* Audio Metadata Form (when audio loaded) */}
          {audio && (
            <div className="bg-[#0c0c0e]/80 p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Disc className="w-4 h-4 text-amber-500" /> Song Information & Display Text
                </h4>
                <span className="text-[11px] text-gray-500">Will be animated on render</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Song Title</label>
                  <input
                    type="text"
                    value={audio.title}
                    onChange={(e) => setAudio({ ...audio, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Enter Song Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Artist / Creator</label>
                  <input
                    type="text"
                    value={audio.artist}
                    onChange={(e) => setAudio({ ...audio, artist: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Enter Artist Name"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player & Sample Tracks Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Audio Player Card */}
          <div className="bg-[#0c0c0e]/80 p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" /> Audio Player & Spectrum
              </span>
              {audio && <span className="text-xs font-mono text-amber-400">{formatTime(currentTime)} / {formatTime(duration)}</span>}
            </div>

            {/* Waveform Canvas */}
            <div className="h-24 bg-black rounded-xl border border-white/10 p-2 relative flex items-center justify-center overflow-hidden">
              <canvas ref={canvasRef} width={400} height={80} className="w-full h-full" />
              {!audio && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 bg-black/60">
                  <span>Upload an audio file to view waveform spectrum</span>
                </div>
              )}
            </div>

            {/* Hidden HTML Audio Element */}
            {audio && (
              <audio
                ref={audioRef}
                src={audio.url}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Play/Pause Button & Scrubber */}
            <div className="flex items-center gap-3">
              <button
                disabled={!audio}
                onClick={togglePlay}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  audio
                    ? 'bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 cursor-pointer'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value);
                    setCurrentTime(time);
                    if (audioRef.current) audioRef.current.currentTime = time;
                  }}
                  disabled={!audio}
                  className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Button */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          onClick={onNext}
          disabled={!audio}
          className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl ${
            audio
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 cursor-pointer scale-100 hover:scale-[1.02]'
              : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
          }`}
        >
          <span>Continue to Step 2: Choose Visual Style</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
