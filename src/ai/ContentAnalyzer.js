export class ContentAnalyzer {
  createScenes(transcriptSegments) {
    return transcriptSegments.map((segment, index) => {
      const visualQuery = segment.visualQuery || `${segment.topic || 'daily life'} lifestyle`;

      return {
        id: `scene-${index + 1}`,
        start: segment.start,
        end: segment.end,
        duration: segment.duration,
        text: segment.text,
        topic: segment.topic || 'everyday routine',
        visualQuery,
        visualType: 'video',
        mood: segment.emotion || 'dynamic',
        transition: index % 2 === 0 ? 'fade' : 'slide',
        importance: segment.importance || 'medium',
        soundEffect: this.inferSoundEffect(visualQuery),
        title: `Scene ${index + 1}`
      };
    });
  }

  inferSoundEffect(visualQuery) {
    if (visualQuery.includes('traffic')) return 'city ambience';
    if (visualQuery.includes('work')) return 'office ambience';
    if (visualQuery.includes('commute')) return 'whoosh transition';
    return 'soft ambience';
  }
}
