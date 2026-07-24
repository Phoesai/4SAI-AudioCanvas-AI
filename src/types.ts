export type AspectRatio = '16:9' | '9:16' | '1:1';

export type StyleId = 'cinematic' | 'fantasy' | 'anime' | 'relaxing' | 'cyberpunk' | 'minimal';

export interface StyleOption {
  id: StyleId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  accentColor: string;
  particleType: 'embers' | 'stars' | 'cherry_blossoms' | 'dust' | 'neon_sparks' | 'bokeh';
  defaultPrompt: string;
  previewImage: string;
}

export interface SongAnalysis {
  title: string;
  artist: string;
  mood: string;
  genre: string;
  tempo: string;
  visualDescription: string;
  imagePrompt: string;
  colorPalette: string[];
  typographyStyle: string;
}

export interface AnimationSettings {
  zoomEffect: 'zoom-in' | 'zoom-out' | 'zoom-pan' | 'subtle-sway';
  zoomSpeed: number; // 0.1 to 2.0
  particleEffect: 'none' | 'embers' | 'stars' | 'dust' | 'light_leaks' | 'rain' | 'neon_sparks';
  particleDensity: number; // 10 to 100
  lightLeaks: boolean;
  glowIntensity: number; // 0 to 100
  audioVisualizer: 'none' | 'bars' | 'wave' | 'circle' | 'particles';
  visualizerPosition: 'bottom' | 'center' | 'top' | 'hidden';
  textAnimation: 'fade-glow' | 'typewriter' | 'slide-up' | 'subtle-pulse';
  textPosition: 'bottom-left' | 'center' | 'bottom-center' | 'top-center';
  customTitle?: string;
  customArtist?: string;
}

export interface AudioTrackInfo {
  file: File | null;
  name: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  isSample?: boolean;
}

export interface VideoProject {
  audio: AudioTrackInfo | null;
  style: StyleId;
  aspectRatio: AspectRatio;
  analysis: SongAnalysis | null;
  coverImageUrl: string | null;
  animation: AnimationSettings;
  customPrompt: string;
}
