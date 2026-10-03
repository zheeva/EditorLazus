export class MusicEngine {
  pickTrack(mood = 'dynamic') {
    const tracks = {
      busy: { title: 'Morning Pulse', volume: 0.1, fadeIn: 1.2, fadeOut: 1.5 },
      stressful: { title: 'City Drift', volume: 0.12, fadeIn: 1.2, fadeOut: 1.8 },
      focused: { title: 'Clean Momentum', volume: 0.1, fadeIn: 1.2, fadeOut: 1.6 },
      dynamic: { title: 'Cinematic Bounce', volume: 0.1, fadeIn: 1.3, fadeOut: 1.6 }
    };

    return tracks[mood] || tracks.dynamic;
  }
}
