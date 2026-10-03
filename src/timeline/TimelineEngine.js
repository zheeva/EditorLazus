export class TimelineEngine {
  buildTimeline(audioMeta, scenes, aspectRatio = '16:9') {
    const resolution = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '4:5': { width: 1080, height: 1350 }
    }[aspectRatio] || { width: 1920, height: 1080 };

    const duration = Math.max(audioMeta?.duration || 25, scenes.reduce((sum, scene) => sum + (scene.duration || 4), 0));

    return {
      duration: Number(duration.toFixed(2)),
      width: resolution.width,
      height: resolution.height,
      fps: 30,
      aspectRatio,
      scenes: scenes.map((scene) => ({
        ...scene,
        visual: scene.visual || null,
        transition: scene.transition || 'fade',
        subtitle: scene.text,
        music: scene.music || { title: 'ambient' },
      }))
    };
  }
}
