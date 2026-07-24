import React, { useRef, useState, useEffect } from 'react';
import { AudioTrackInfo, AspectRatio, AnimationSettings, StyleId, SongAnalysis } from '../types';
import { STYLES } from '../data/styles';
import { Play, Pause, Download, Video, Sparkles, RefreshCw, Volume2, ArrowLeft, CheckCircle2, Copy, Check, Terminal, Film, Monitor, Smartphone } from 'lucide-react';

interface Step4ExportProps {
  audio: AudioTrackInfo | null;
  aspectRatio: AspectRatio;
  selectedStyle: StyleId;
  coverImageUrl: string | null;
  animation: AnimationSettings;
  analysis: SongAnalysis | null;
  onBack: () => void;
}

export const Step4Export: React.FC<Step4ExportProps> = ({
  audio,
  aspectRatio,
  selectedStyle,
  coverImageUrl,
  animation,
  analysis,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordTime, setRecordTime] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('music-video.mp4');
  const [copiedFFmpeg, setCopiedFFmpeg] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const currentStyleObj = STYLES.find((s) => s.id === selectedStyle) || STYLES[0];
  const finalImageSrc = coverImageUrl || currentStyleObj.previewImage;

  // Canvas Resolution dimensions
  const canvasWidth = aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920;
  const canvasHeight = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080;

  // Preload Cover Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = finalImageSrc;
    img.onload = () => {
      imageObjRef.current = img;
    };
  }, [finalImageSrc]);

  // Setup Web Audio API Analyser Node
  useEffect(() => {
    if (!audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      }
    } catch (e) {
      console.warn('AudioContext setup note:', e);
    }
  }, [audio?.url]);

  // Main 60FPS Multi-Layer Canvas Renderer
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particle Physics Objects
    const particleCount = animation.particleEffect === 'none' ? 0 : 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: Math.random() * 4 + 2,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.8 + 0.2,
      hue: Math.random() * 60 - 30,
    }));

    let startTime = Date.now();

    const renderFrame = () => {
      const now = Date.now();
      const elapsed = (now - startTime) * 0.001;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 1. LAYER 1: Ken Burns Slow Zoom / Sway Effect on Cover Image
      if (imageObjRef.current && imageObjRef.current.complete) {
        let scale = 1.0;
        let offsetX = 0;
        let offsetY = 0;

        if (animation.zoomEffect === 'zoom-in') {
          scale = 1.0 + (elapsed * 0.015) % 0.15;
        } else if (animation.zoomEffect === 'zoom-out') {
          scale = 1.15 - (elapsed * 0.015) % 0.15;
        } else if (animation.zoomEffect === 'zoom-pan') {
          scale = 1.08 + Math.sin(elapsed * 0.5) * 0.04;
          offsetX = Math.sin(elapsed * 0.3) * 20;
          offsetY = Math.cos(elapsed * 0.3) * 15;
        } else {
          // Subtle Sway
          scale = 1.05;
          offsetX = Math.sin(elapsed * 0.8) * 12;
          offsetY = Math.cos(elapsed * 0.6) * 10;
        }

        const drawW = canvasWidth * scale;
        const drawH = canvasHeight * scale;
        const drawX = (canvasWidth - drawW) / 2 + offsetX;
        const drawY = (canvasHeight - drawH) / 2 + offsetY;

        ctx.drawImage(imageObjRef.current, drawX, drawY, drawW, drawH);
      } else {
        // Fallback Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // 2. LAYER 2: Cinematic Vignette & Atmospheric Overlay
      const grad = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.25,
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.75
      );
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 3. LAYER 3: Motion Particle Physics Overlay
      if (animation.particleEffect !== 'none') {
        particles.forEach((p) => {
          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = canvasHeight + 10;
            p.x = Math.random() * canvasWidth;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          if (animation.particleEffect === 'embers') {
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
          } else if (animation.particleEffect === 'stars') {
            ctx.fillStyle = `rgba(254, 240, 138, ${p.opacity})`;
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 8;
          } else if (animation.particleEffect === 'neon_sparks') {
            ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
          } else {
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
            ctx.shadowColor = '#d97706';
            ctx.shadowBlur = 6;
          }

          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });
      }

      // 4. LAYER 4: Audio Spectrum Visualizer
      if (animation.audioVisualizer !== 'none' && analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        if (animation.audioVisualizer === 'bars') {
          const bars = 32;
          const barWidth = (canvasWidth * 0.8) / bars;
          const startX = (canvasWidth - bars * barWidth) / 2;
          const startY = canvasHeight - 120;

          for (let i = 0; i < bars; i++) {
            const value = dataArray[i * 2] || 0;
            const barHeight = (value / 255) * 160;
            const x = startX + i * barWidth;
            const y = startY - barHeight;

            const barGrad = ctx.createLinearGradient(0, startY, 0, startY - 160);
            barGrad.addColorStop(0, 'rgba(217, 119, 6, 0.9)');
            barGrad.addColorStop(1, 'rgba(245, 158, 11, 0.9)');

            ctx.fillStyle = barGrad;
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
          }
        } else if (animation.audioVisualizer === 'wave') {
          ctx.beginPath();
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 15;

          const sliceWidth = canvasWidth / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * (canvasHeight * 0.15)) + (canvasHeight * 0.75);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // 5. LAYER 5: Animated Typography (Song Title & Artist)
      const titleText = audio?.title || 'Song Title';
      const artistText = audio?.artist || 'Artist Name';

      const paddingY = aspectRatio === '9:16' ? canvasHeight * 0.82 : canvasHeight * 0.85;

      ctx.save();
      ctx.textAlign = 'center';

      // Title
      ctx.font = `bold ${aspectRatio === '9:16' ? '48px' : '52px'} sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 16;
      ctx.fillText(titleText, canvasWidth / 2, paddingY);

      // Artist
      ctx.font = `600 ${aspectRatio === '9:16' ? '28px' : '30px'} sans-serif`;
      ctx.fillStyle = currentStyleObj.accentColor;
      ctx.shadowBlur = 12;
      ctx.fillText(`by ${artistText}`, canvasWidth / 2, paddingY + 45);

      ctx.restore();

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [aspectRatio, animation, isPlaying, finalImageSrc, canvasWidth, canvasHeight]);

  // Real-Time Video Recording Functionality
  const startRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    recordedChunksRef.current = [];
    setIsRecording(true);
    setRecordProgress(0);
    setRecordTime(0);

    // Make sure audio is playing from start
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);

    try {
      // Stream 60FPS video from canvas
      const canvasStream = canvas.captureStream(60);

      // Combine audio stream if available
      let combinedStream = canvasStream;
      if (audioCtxRef.current && (audioRef.current as any).captureStream) {
        const audioStream = (audioRef.current as any).captureStream();
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const cleanName = (audio?.title || 'music-video').toLowerCase().replace(/[^a-z0-9]/g, '-');
        setDownloadFilename(`${cleanName}-${aspectRatio.replace(':', 'x')}.${ext}`);
        setDownloadUrl(url);
        setIsRecording(false);
      };

      recorder.start(500);

      // Progress Tracker Interval
      const totalSecs = audio?.duration || 20;
      const interval = setInterval(() => {
        if (!audioRef.current || audioRef.current.paused) {
          clearInterval(interval);
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        const current = audioRef.current.currentTime;
        setRecordTime(current);
        setRecordProgress((current / totalSecs) * 100);

        if (current >= totalSecs) {
          clearInterval(interval);
          if (recorder.state === 'recording') recorder.stop();
        }
      }, 200);

    } catch (e) {
      console.error('Recording setup error:', e);
      setIsRecording(false);
    }
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

  // Generate Offline FFmpeg Terminal Command for high quality rendering
  const ffmpegCommand = `# Step 1: Combine cover image & audio into animated MP4 with Ken Burns zoom
ffmpeg -loop 1 -i cover.png -i song.mp3 -filter_complex \\
"[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=${canvasWidth}x${canvasHeight}:fps=60[v]; \\
 [v]drawtext=text='${audio?.title || 'Song Title'}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.82:shadowcolor=black@0.8:shadowx=3:shadowy=3[outv]" \\
-map "[outv]" -map 1:a -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${downloadFilename}`;

  const handleCopyFFmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFFmpeg(true);
    setTimeout(() => setCopiedFFmpeg(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" /> Step 4: Final Output & Render
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Preview & Render MP4 Video</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Preview real-time motion layers, audio visualizer, and export your high-definition video directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Real-Time Animated Canvas Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0c0c0e]/90 p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" /> Live 60FPS Video Canvas Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {aspectRatio} ({canvasWidth}x{canvasHeight})
              </span>
            </div>

            {/* HTML5 Canvas Element */}
            <div
              className={`w-full rounded-2xl border border-white/10 bg-black overflow-hidden relative shadow-2xl flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[500px]' : aspectRatio === '1:1' ? 'aspect-square max-h-[420px]' : 'aspect-video max-h-[360px]'
              }`}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-contain"
              />

              {/* Overlay Play Indicator */}
              {!isPlaying && !isRecording && (
                <button
                  onClick={togglePlay}
                  className="absolute w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-2xl backdrop-blur-md transition-all scale-100 hover:scale-110 font-bold"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Audio Element */}
            {audio && (
              <audio
                ref={audioRef}
                src={audio.url}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Playback Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={togglePlay}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-white/10"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-500 fill-current" /> : <Play className="w-4 h-4 text-amber-500 fill-current" />}
                <span>{isPlaying ? 'Pause Preview' : 'Play Live Preview'}</span>
              </button>

              <span className="text-xs text-gray-400 font-mono">
                Audio: <strong className="text-gray-200">{audio?.title}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Export Video Controls & FFmpeg Command Export */}
        <div className="lg:col-span-5 space-y-5">
          {/* Export MP4 Box */}
          <div className="bg-gradient-to-b from-[#0c0c0e] to-amber-950/20 p-6 rounded-2xl border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" /> Render & Export Video File
              </h3>
              <span className="text-xs text-amber-400 font-medium">Ready to record</span>
            </div>

            {isRecording ? (
              <div className="space-y-3 bg-black p-4 rounded-xl border border-amber-500/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Recording Video Canvas & Audio...
                  </span>
                  <span className="font-mono text-gray-300">{Math.round(recordTime)}s / {Math.round(audio?.duration || 20)}s</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-200"
                    style={{ width: `${Math.min(100, recordProgress)}%` }}
                  />
                </div>
              </div>
            ) : downloadUrl ? (
              <div className="space-y-3 bg-amber-500/10 p-4 rounded-xl border border-amber-500/40 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Video Compilation Complete!</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{downloadFilename}</p>
                </div>
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 block"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 / WebM Video File</span>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startRecording}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 scale-100 hover:scale-[1.01]"
                >
                  <Film className="w-4 h-4" />
                  <span>Start Live MP4 Video Render ({aspectRatio})</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center">
                  Encodes live 60FPS Ken Burns zoom, particle physics, and audio into an MP4/WebM video file directly in browser.
                </p>
              </div>
            )}
          </div>

          {/* Production FFmpeg Command Code Snippet Box */}
          <div className="bg-[#0c0c0e]/80 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-500" /> Offline FFmpeg Render Command
              </h4>
              <button
                onClick={handleCopyFFmpeg}
                className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg border border-white/10 flex items-center gap-1 transition-all"
              >
                {copiedFFmpeg ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFFmpeg ? 'Copied!' : 'Copy CLI Command'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
              {ffmpegCommand}
            </pre>
            <p className="text-[10px] text-gray-500">
              Run this FFmpeg terminal command on Windows / Mac / Linux for high bitrate offline 4K/1080p rendering!
            </p>
          </div>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="flex justify-start pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-xs bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-2 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Cover & Motion Setup</span>
        </button>
      </div>
    </div>
  );
};
