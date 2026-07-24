import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

// Configure body parser for JSON and form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

// Initialize Gemini API client (server-side only)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route: Analyze Song Metadata & Generate Visual Concept
app.post('/api/analyze-audio', async (req, res) => {
  try {
    const { title, artist, fileName, selectedStyle } = req.body;
    const ai = getGeminiClient();

    const songTitle = title || fileName?.replace(/\.[^/.]+$/, "") || "Untitled Track";
    const songArtist = artist || "Unknown Artist";
    const style = selectedStyle || "cinematic";

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        analysis: {
          title: songTitle,
          artist: songArtist,
          mood: `Atmospheric ${style.toUpperCase()}`,
          genre: "Ambient Music",
          tempo: "Mid-tempo (100 BPM)",
          visualDescription: `A striking ${style} visual with dramatic lighting and deep depth of field.`,
          imagePrompt: `A stunning ${style} visual art cover for song "${songTitle}" by ${songArtist}, hyperdetailed 8k masterpiece, atmospheric lighting, high resolution cover art`,
          colorPalette: ["#0f172a", "#3b82f6", "#ec4899", "#f59e0b"],
          typographyStyle: "Modern Bold Sans-Serif",
        },
        source: "fallback",
      });
    }

    const prompt = `Analyze the song "${songTitle}" by "${songArtist}" for a music video in "${style}" style.
Generate a structured JSON response with a vivid visual concept and cover art prompt for AI image generation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            mood: { type: Type.STRING, description: "e.g. Dreamy & Nostalgic, Energetic, Ethereal" },
            genre: { type: Type.STRING, description: "e.g. Synthwave, Lofi, Epic Orchestral, Ambient" },
            tempo: { type: Type.STRING, description: "e.g. Fast & Driving 128 BPM, Slow & Chill 75 BPM" },
            visualDescription: { type: Type.STRING, description: "Description of the scene for the music video" },
            imagePrompt: { type: Type.STRING, description: "Detailed AI image prompt for cover image generation" },
            colorPalette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 4 hex color strings matching the song theme"
            },
            typographyStyle: { type: Type.STRING, description: "Suggested typography font style" },
          },
          required: ["title", "artist", "mood", "genre", "tempo", "visualDescription", "imagePrompt", "colorPalette", "typographyStyle"],
        },
      },
    });

    if (response.text) {
      const analysis = JSON.parse(response.text);
      return res.json({ analysis, source: "gemini" });
    } else {
      throw new Error("No response text returned from Gemini API");
    }
  } catch (error: any) {
    console.error("Error analyzing audio with Gemini:", error);
    const { title, artist, fileName, selectedStyle } = req.body;
    const songTitle = title || fileName?.replace(/\.[^/.]+$/, "") || "Untitled Track";
    res.json({
      analysis: {
        title: songTitle,
        artist: artist || "Unknown Artist",
        mood: `Moody ${selectedStyle || 'Cinematic'}`,
        genre: "Music Track",
        tempo: "100 BPM",
        visualDescription: "An atmospheric visual composition with dynamic light.",
        imagePrompt: `High quality cover art for "${songTitle}", ${selectedStyle || 'cinematic'} style, trending on artstation, 8k resolution`,
        colorPalette: ["#1e1b4b", "#6366f1", "#a855f7", "#ec4899"],
        typographyStyle: "Clean Modern Display",
      },
      source: "fallback",
      error: error.message,
    });
  }
});

// API Route: Generate Cover Image using Gemini Image Generation
app.post('/api/generate-cover', async (req, res) => {
  try {
    const { prompt, aspectRatio, style } = req.body;
    const ai = getGeminiClient();

    const targetAspectRatio = aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9';

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is missing. Please set your key in Settings > Secrets.",
        hasApiKey: false
      });
    }

    const imagePrompt = prompt || `A stunning cover image for music video, ${style || 'cinematic'} style, highly detailed 8k art`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio,
        },
      },
    });

    let imageUrl = null;
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      return res.json({ imageUrl, success: true });
    } else {
      throw new Error("Gemini model returned no image inlineData parts.");
    }
  } catch (error: any) {
    console.error("Error generating image with Gemini:", error);
    res.status(500).json({
      error: error.message || "Failed to generate cover image with Gemini",
      details: error.toString(),
    });
  }
});

// API Route: Refine Prompt with Gemini
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { title, style, keywords } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        prompt: `Masterpiece album cover art for "${title || 'Track'}", ${style || 'cinematic'} aesthetic, volumetric lighting, hyperdetailed, 8k resolution`,
      });
    }

    const prompt = `Write an optimized, highly detailed text prompt for an AI image generator to create cover art for a music video titled "${title || 'Music Track'}". Visual style: "${style || 'Cinematic'}". Extra tags: "${keywords || 'atmospheric'}". Keep it under 60 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({ prompt: response.text?.trim() || prompt });
  } catch (error: any) {
    res.json({
      prompt: `High quality cover art for "${req.body.title || 'Track'}", ${req.body.style || 'cinematic'} style, detailed artstation, 8k resolution`,
    });
  }
});

// API Route: Handle audio file upload
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const base64Audio = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype || 'audio/mp3';
  const dataUrl = `data:${mimeType};base64,${base64Audio}`;

  res.json({
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: mimeType,
    dataUrl: dataUrl,
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
