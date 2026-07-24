/**
 * API Service layer for AI Music Video Creator Frontend
 * Connects React / Next.js pages & components to the FastAPI / Express Backend
 */

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

export interface UploadAudioResponse {
  fileId?: string;
  originalName: string;
  size?: number;
  mimeType: string;
  dataUrl: string;
  savedPath?: string;
}

export interface SongAnalysisResponse {
  analysis: {
    title: string;
    artist: string;
    mood: string;
    genre: string;
    tempo: string;
    visualDescription: string;
    imagePrompt: string;
    colorPalette: string[];
    typographyStyle: string;
  };
  source: 'gemini' | 'fallback';
}

export interface GenerateCoverResponse {
  imageUrl?: string;
  success: boolean;
  error?: string;
  aspectRatio?: string;
}

export interface RenderVideoResponse {
  success: boolean;
  videoFilename?: string;
  downloadUrl?: string;
  ffmpegCommand?: string;
  error?: string;
}

/**
 * 1. Upload MP3 / Audio file to backend
 */
export async function uploadAudioApi(file: File): Promise<UploadAudioResponse> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_BASE_URL}/api/upload-audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * 2. Analyze song metadata & generate concept with Gemini
 */
export async function analyzeAudioApi(params: {
  title?: string;
  artist?: string;
  fileName?: string;
  selectedStyle?: string;
}): Promise<SongAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * 3. Generate Cover Image with Gemini Image Model
 */
export async function generateCoverApi(params: {
  prompt: string;
  aspectRatio?: string;
  style?: string;
}): Promise<GenerateCoverResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-cover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(errorData.error || `Image generation failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * 4. Refine text prompt with Gemini
 */
export async function generatePromptApi(params: {
  title?: string;
  style?: string;
  keywords?: string;
  mood?: string;
  genre?: string;
}): Promise<{ prompt: string }> {
  const response = await fetch(`${API_BASE_URL}/api/generate-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Prompt refinement failed`);
  }

  return response.json();
}

/**
 * 5. Render Video via FFmpeg backend
 */
export async function renderVideoApi(params: {
  fileId: string;
  imageUrl: string;
  aspectRatio?: string;
  title?: string;
  artist?: string;
  showWaveform?: boolean;
  enableCameraPan?: boolean;
}): Promise<RenderVideoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/render-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'FFmpeg render failed' }));
    throw new Error(errorData.detail || errorData.error || 'Video rendering failed');
  }

  return response.json();
}
