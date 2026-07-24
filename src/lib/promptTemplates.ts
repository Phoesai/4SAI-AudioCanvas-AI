import { StyleId } from '../types';

export interface PromptTemplateInput {
  style: StyleId | string;
  mood?: string;
  genre?: string;
  title?: string;
  artist?: string;
  keywords?: string;
}

export interface StructuredPromptOutput {
  styleName: string;
  fullPrompt: string;
  subject: string;
  lighting: string;
  atmosphere: string;
  colorPalette: string[];
  cameraSettings: string;
  youtubeTarget: string;
}

/**
 * Prompt Template Engine for AI Cover Image Generation
 * Supports: Cinematic, Fantasy, Anime, Relaxing, Cyberpunk, Minimal
 */
export const STYLE_PROMPT_TEMPLATES: Record<string, {
  name: string;
  tagline: string;
  subjectTemplate: (mood: string, genre: string, title: string) => string;
  lighting: string;
  atmosphere: string;
  camera: string;
  colors: string[];
  youtubeType: string;
  qualityModifiers: string;
}> = {
  cinematic: {
    name: 'Cinematic',
    tagline: 'Hollywood Film Look & Volumetric Lighting',
    subjectTemplate: (mood, genre, title) => 
      `A dramatic wide cinematic shot inspired by '${title || 'Music Track'}', featuring a central lone figure gazing toward a horizon representing ${mood || 'epic triumph'} in a ${genre || 'Orchestral Film Score'} atmosphere`,
    lighting: 'anamorphic golden hour light leak, volumetric rim lighting, deep rim shadows',
    atmosphere: 'filmic fog, floating dust particles, subtle film grain, 35mm lens depth of field',
    camera: 'shot on Arri Alexa 35, 85mm anamorphic lens, f/1.8, cinematic aspect ratio',
    colors: ['#0f172a', '#f59e0b', '#78350f', '#3b82f6'],
    youtubeType: 'Perfect for Epic Film Scores, Orchestral, & Trailer Music',
    qualityModifiers: 'photorealistic, masterpiece, trending on ArtStation, 8k resolution, IMAX quality',
  },
  fantasy: {
    name: 'Fantasy',
    tagline: 'Enchanted Mystical Realms & Magic',
    subjectTemplate: (mood, genre, title) => 
      `An enchanted fairy-tale visual realm for '${title || 'Fantasy Anthem'}', displaying ancient overgrown ruins surrounded by glowing flora expressing ${mood || 'mystical ethereal mystery'} for ${genre || 'Folk Ambient'} music`,
    lighting: 'bioluminescent blue and emerald glow, ethereal floating starlight sparks, soft moonlit ray',
    atmosphere: 'mystic morning mist, ancient magic runes, shimmering dust motes, dreamlike atmosphere',
    camera: 'wide environmental landscape view, soft tilt-shift focus, magical glow filter',
    colors: ['#022c22', '#10b981', '#06b6d4', '#6366f1'],
    youtubeType: 'Ideal for RPG Soundtracks, Celtic, Folk & Fantasy Ambient',
    qualityModifiers: 'digital fantasy painting, highly detailed, Studio Ghibli inspired, 8k render, Unreal Engine 5',
  },
  anime: {
    name: 'Anime',
    tagline: 'Makoto Shinkai Skies & Vibrant Aesthetics',
    subjectTemplate: (mood, genre, title) => 
      `A captivating anime art style illustration for '${title || 'Anime OST'}', showing a quiet suburban train crossing with cherry blossom petals swirling in ${mood || 'nostalgic sunset warmth'}, crafted for ${genre || 'Lo-Fi / J-Pop'}`,
    lighting: 'vibrant golden hour sunlight streaming through purple cumulus clouds, high saturation bloom',
    atmosphere: 'swirling sakura petals, lens flare streaks, crisp sky gradient, peaceful emotional vibe',
    camera: 'eye-level anime background art framing, crisp cel-shaded lines with detailed watercolor textures',
    colors: ['#4c0519', '#f43f5e', '#38bdf8', '#fbbf24'],
    youtubeType: 'Trending for Anime OSTs, Lo-Fi Chill, J-Pop & Vocaloid',
    qualityModifiers: 'Makoto Shinkai style, CoMix Wave Films quality, hyper-detailed anime wallpaper, 8k, masterpiece',
  },
  relaxing: {
    name: 'Relaxing',
    tagline: 'Cozy Room, Rain & Coffee Study Vibe',
    subjectTemplate: (mood, genre, title) => 
      `A warm cozy interior room scene for '${title || 'Relaxing Track'}', featuring a desktop setup with a steaming mug beside a rainy window looking over a calm city, conveying ${mood || 'peaceful study focus'} for ${genre || 'Lo-Fi Beats'}`,
    lighting: 'warm amber desk lamp glow, soft bokeh window light, overcast rainy twilight ambience',
    atmosphere: 'gently sliding raindrops on glass, steam rising, warm cozy blankets, comforting relaxing aesthetic',
    camera: 'medium interior shot, shallow depth of field focusing on coffee mug, cozy isometric aesthetic',
    colors: ['#451a03', '#fb923c', '#d97706', '#1c1917'],
    youtubeType: 'Designed for 24/7 Lo-Fi Study Streams, Chillout & Sleep Music',
    qualityModifiers: 'isometric lo-fi aesthetic, pastel colors, soft focus, serene, highly detailed 8k illustration',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    tagline: 'Neon Futuristic Cityscape & Rainy Asphalt',
    subjectTemplate: (mood, genre, title) => 
      `A sprawling dystopian cyberpunk metropolis night scene for '${title || 'Neon Drive'}', with glowing holographic billboards and sleek neon reflections echoing ${mood || 'intense high-tech energy'} suitable for ${genre || 'Synthwave / Phonk / EDM'}`,
    lighting: 'neon pink and cyan dual lighting, wet pavement neon reflections, high-contrast glow',
    atmosphere: 'heavy nocturnal rain, subtle smoke haze, holographic glitch overlays, futuristic cityscape',
    camera: 'low-angle street perspective, wide lens, 35mm filmic night contrast',
    colors: ['#4a044e', '#ec4899', '#06b6d4', '#0f172a'],
    youtubeType: 'Top choice for Synthwave, Dark Cyberpunk, Phonk & Synth Pop',
    qualityModifiers: 'Blade Runner 2049 aesthetic, octane render, Raytracing reflections, hyperdetailed 8k',
  },
  minimal: {
    name: 'Minimal',
    tagline: 'Sleek 3D Geometry & Modern Gradients',
    subjectTemplate: (mood, genre, title) => 
      `An elegant abstract 3D geometric art composition for '${title || 'Minimal House'}', featuring an iridescent metallic sculpture floating in clean space representing ${mood || 'sophisticated modern harmony'} for ${genre || 'Deep House / Techno'}`,
    lighting: 'soft studio diffuse illumination, subtle caustic reflections, clean soft shadows',
    atmosphere: 'uncluttered negative space, smooth liquid color gradient, sleek contemporary design',
    camera: 'centered eye-level studio composition, orthographic projection feel, crisp focus',
    colors: ['#0f172a', '#38bdf8', '#818cf8', '#f87171'],
    youtubeType: 'Preferred for Deep House, Minimal Techno, Modern Pop & Podcasts',
    qualityModifiers: '3D Blender render, sleek gallery graphic design, ultra clean, award winning cover art, 8k',
  },
};

/**
 * Generates a full professional prompt for YouTube music video covers
 */
export function generateCoverPrompt(input: PromptTemplateInput): StructuredPromptOutput {
  const styleKey = (input.style || 'cinematic').toLowerCase();
  const template = STYLE_PROMPT_TEMPLATES[styleKey] || STYLE_PROMPT_TEMPLATES.cinematic;

  const mood = input.mood || 'atmospheric';
  const genre = input.genre || 'Electronic';
  const title = input.title || 'Track';

  const subject = template.subjectTemplate(mood, genre, title);
  
  let customExtra = '';
  if (input.keywords && input.keywords.trim()) {
    customExtra = `, featuring elements of ${input.keywords.trim()}`;
  }

  const fullPrompt = `${subject}${customExtra}. ${template.lighting}, ${template.atmosphere}, ${template.camera}, ${template.qualityModifiers}`;

  return {
    styleName: template.name,
    fullPrompt,
    subject,
    lighting: template.lighting,
    atmosphere: template.atmosphere,
    colorPalette: template.colors,
    cameraSettings: template.camera,
    youtubeTarget: template.youtubeType,
  };
}
