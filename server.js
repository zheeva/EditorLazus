import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

const demoVoice = `Setiap pagi banyak orang terburu-buru pergi bekerja. Mereka menghadapi kemacetan dan menghabiskan banyak waktu di perjalanan.`;

const demoVisuals = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lazus-editor-api', timestamp: new Date().toISOString() });
});

app.get('/api/transcript', (_req, res) => {
  const segments = demoVoice
    .split(/(?<=[.!?])\s+/)
    .map((sentence, index) => {
      const text = sentence.trim();
      const start = Number((index * 6.5).toFixed(2));
      const end = Number(((index + 1) * 6.5).toFixed(2));

      return {
        start,
        end,
        duration: Number((end - start).toFixed(2)),
        text,
        topic: index === 0 ? 'morning commute' : index === 1 ? 'traffic rush' : 'daily journey',
        visualQuery: index === 0 ? 'people rushing to work in the morning' : index === 1 ? 'busy city traffic' : 'people commuting in a vehicle',
        emotion: index === 1 ? 'stressful' : 'focused',
        importance: index === 0 ? 'high' : 'medium'
      };
    })
    .filter(Boolean);

  res.json({
    provider: 'demo',
    language: 'id',
    confidence: 0.94,
    fullText: demoVoice,
    segments
  });
});

app.get('/api/media', (req, res) => {
  const query = String(req.query.q || 'lifestyle people');

  const items = demoVisuals.map((url, index) => ({
    id: `media-${index + 1}`,
    title: `${query} scene ${index + 1}`,
    url,
    type: index % 2 === 0 ? 'video' : 'image',
    source: 'demo',
    relevanceScore: 93 - index,
    qualityScore: 90,
    orientationScore: 87,
    resolutionScore: 88,
    durationScore: 84
  }));

  res.json({ query, items });
});

app.get('/api/music', (_req, res) => {
  res.json({
    tracks: [
      { id: 'track-1', title: 'Morning Pulse', mood: 'busy', volume: 0.12, fadeIn: 1.5, fadeOut: 1.8 },
      { id: 'track-2', title: 'City Drift', mood: 'stressful', volume: 0.1, fadeIn: 1.2, fadeOut: 2.0 },
      { id: 'track-3', title: 'Cinematic Lift', mood: 'motivational', volume: 0.09, fadeIn: 1.8, fadeOut: 2.2 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`LazusEditor API running at http://localhost:${PORT}`);
});
