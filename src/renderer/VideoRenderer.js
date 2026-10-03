export class VideoRenderer {
  constructor(timeline, canvas) {
    this.timeline = timeline;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.animationFrame = null;
    this.previewImages = new Map();
    this.currentTime = 0;
    this.isPlaying = false;
    this.finished = false;
    this.sceneIndex = 0;
  }

  setTimeline(timeline) {
    this.timeline = timeline;
    this.currentTime = 0;
    this.sceneIndex = 0;
  }

  startPreview() {
    this.isPlaying = true;
    const render = () => {
      if (!this.isPlaying) return;
      this.drawFrame(this.currentTime);
      this.currentTime += 1 / this.timeline.fps;
      if (this.currentTime >= this.timeline.duration) {
        this.currentTime = 0;
      }
      this.animationFrame = requestAnimationFrame(render);
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(render);
  }

  stopPreview() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  drawFrame(time) {
    const { width, height } = this.canvas;
    const ctx = this.context;
    const scene = this.getSceneAtTime(time);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (scene?.visual) {
      const img = this.previewImages.get(scene.visual) || this.loadImage(scene.visual);
      if (img && img.complete) {
        const ratio = Math.max(width / img.width, height / img.height);
        const drawWidth = img.width * ratio;
        const drawHeight = img.height * ratio;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(2,6,23,0.15)');
    gradient.addColorStop(1, 'rgba(2,6,23,0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 42px Inter, sans-serif';
    ctx.fillText(scene?.title || 'LazusEditor', 60, 120);

    ctx.font = '500 28px Inter, sans-serif';
    const lines = this.wrapText(ctx, scene?.subtitle || 'AI-generated subtitle', width - 160);
    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, 60, height - 150 + idx * 40);
    });
  }

  getSceneAtTime(time) {
    const scenes = this.timeline.scenes || [];
    for (let index = 0; index < scenes.length; index += 1) {
      const scene = scenes[index];
      const start = scene.start || 0;
      const end = start + (scene.duration || 4);
      if (time >= start && time <= end) return scene;
    }
    return scenes[0] || null;
  }

  loadImage(src) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    this.previewImages.set(src, image);
    return image;
  }

  wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (context.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }

    if (current) lines.push(current);
    return lines;
  }

  async exportVideo() {
    const canvas = this.canvas;
    const stream = canvas.captureStream(this.timeline.fps || 30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    return new Promise((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        resolve({ blob, url, mimeType });
      };

      recorder.start();
      this.startPreview();

      setTimeout(() => {
        this.stopPreview();
        recorder.stop();
      }, (this.timeline.duration + 0.2) * 1000);
    });
  }
}
