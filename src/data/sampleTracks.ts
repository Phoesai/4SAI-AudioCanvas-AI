export interface SampleTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  bpm: number;
  mood: string;
  color: string;
  coverPreset: string;
  audioGenerator: (ctx: AudioContext) => AudioBuffer;
}

// Generates real, pleasant musical audio buffers programmatically using Web Audio synthesis
export function generateSyntheticAudio(ctx: AudioContext, style: string): AudioBuffer {
  const duration = 20; // 20 second loopable preview track
  const sampleRate = ctx.sampleRate;
  const numFrames = sampleRate * duration;
  const buffer = ctx.createBuffer(2, numFrames, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  if (style === 'lofi') {
    // Lo-Fi Chord Progressions (Cmaj7 -> Am7 -> Dm7 -> G7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const chordIdx = Math.floor((t / 2.5) % chords.length);
      const chord = chords[chordIdx];
      let sample = 0;
      chord.forEach((freq) => {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.1 * Math.exp(-((t % 2.5) * 0.5));
      });
      // Soft vinyl crackle simulation
      const crackle = (Math.random() - 0.5) * 0.015 * (Math.random() > 0.95 ? 1 : 0);
      // Gentle bass beat
      const beat = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-((t % 0.8) * 8)) * 0.2;
      
      left[i] = (sample + beat + crackle) * 0.6;
      right[i] = (sample * 0.9 + beat + crackle) * 0.6;
    }
  } else if (style === 'synthwave') {
    // Driving synthwave bassline & arp
    const arpNotes = [110, 130.81, 164.81, 196.00, 220, 261.63, 329.63, 392.00];
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const arpIdx = Math.floor((t * 8) % arpNotes.length);
      const arpFreq = arpNotes[arpIdx];
      const sawWave = (2 * ((t * arpFreq) % 1) - 1) * 0.12;
      const subBass = Math.sin(2 * Math.PI * 55 * t) * 0.25;
      const snare = (Math.random() - 0.5) * Math.exp(-((t % 1) * 12)) * 0.1;
      left[i] = sawWave + subBass + snare;
      right[i] = sawWave * 0.8 + subBass + snare;
    }
  } else if (style === 'cinematic') {
    // Epic warm string pad & slow bass swell
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const swell = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
      const chord1 = Math.sin(2 * Math.PI * 130.81 * t) * 0.15; // C3
      const chord2 = Math.sin(2 * Math.PI * 164.81 * t) * 0.15; // E3
      const chord3 = Math.sin(2 * Math.PI * 196.00 * t) * 0.15; // G3
      const deepBass = Math.sin(2 * Math.PI * 32.70 * t) * 0.3 * swell;
      left[i] = (chord1 + chord2 + chord3) * swell * 0.5 + deepBass;
      right[i] = (chord1 * 0.9 + chord2 * 1.1 + chord3) * swell * 0.5 + deepBass;
    }
  } else {
    // Ambient piano & pad
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const pad = (Math.sin(2 * Math.PI * 174.61 * t) + Math.sin(2 * Math.PI * 220.00 * t)) * 0.1;
      const pianoFreq = (Math.floor(t * 1.5) % 2 === 0) ? 349.23 : 440.00;
      const pianoPulse = Math.sin(2 * Math.PI * pianoFreq * t) * Math.exp(-((t % 0.67) * 4)) * 0.15;
      left[i] = pad + pianoPulse;
      right[i] = pad * 0.95 + pianoPulse;
    }
  }

  return buffer;
}

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // WAV header
  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString('data');
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export const SAMPLE_TRACKS = [
  {
    id: 'lofi-midnight',
    title: 'Midnight Rain & Vinyl Beats',
    artist: 'Aesthetic Chill',
    genre: 'Lo-Fi Chill Hop',
    duration: 20,
    bpm: 75,
    mood: 'Relaxing & Nostalgic',
    color: '#fb923c',
    style: 'relaxing' as const,
    coverPreset: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'synth-cyber',
    title: 'Neon Odyssey 2088',
    artist: 'Cyber Pulse',
    genre: 'Synthwave / Retrowave',
    duration: 20,
    bpm: 120,
    mood: 'Energetic & Futuristic',
    color: '#ec4899',
    style: 'cyberpunk' as const,
    coverPreset: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cinematic-horizon',
    title: 'Echoes of the Starlight Realm',
    artist: 'Aethelgard Philharmonic',
    genre: 'Epic Orchestral',
    duration: 20,
    bpm: 90,
    mood: 'Majestic & Heroic',
    color: '#f59e0b',
    style: 'cinematic' as const,
    coverPreset: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'anime-blossom',
    title: 'Sakura Sunset Sky',
    artist: 'Yuki & Sora',
    genre: 'Anime Instrumental',
    duration: 20,
    bpm: 105,
    mood: 'Dreamy & Emotional',
    color: '#f43f5e',
    style: 'anime' as const,
    coverPreset: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
  },
];
