import { APP_CONFIG } from '../config.js';

export class MediaProvider {
  async search(query, options = {}) {
    const fallback = APP_CONFIG.demoSceneVisuals;
    const keyword = query || 'lifestyle';

    return fallback.map((url, index) => ({
      id: `media-${index}`,
      title: `${keyword} reference ${index + 1}`,
      url,
      type: options.type || 'video',
      width: 1280,
      height: 720,
      relevanceScore: 94 - index,
      qualityScore: 90,
      orientationScore: 90,
      resolutionScore: 88,
      durationScore: 85,
      motionScore: 82,
      source: 'demo'
    }));
  }
}
