import { createWaveform } from '../utils/helpers.js';

export class AudioAnalyzer {
  async analyzeAudio(file) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

    const channelData = audioBuffer.getChannelData(0);
    const waveform = createWaveform(channelData, 160);

    const duration = Number(audioBuffer.duration.toFixed(2));
    const totalRms = this.calculateRms(channelData);
    const segments = this.estimateSegments(duration);

    return {
      fileName: file.name,
      fileSize: file.size,
      duration,
      waveform,
      volume: Number((totalRms * 100).toFixed(1)),
      format: file.type || 'audio/mpeg',
      segments,
      audioContext
    };
  }

  calculateRms(channelData) {
    let sum = 0;
    for (let i = 0; i < channelData.length; i += 1) {
      sum += channelData[i] * channelData[i];
    }
    return Math.sqrt(sum / channelData.length);
  }

  estimateSegments(duration) {
    const segmentCount = Math.max(3, Math.ceil(duration / 5));
    const segments = [];

    for (let index = 0; index < segmentCount; index += 1) {
      const start = index * (duration / segmentCount);
      const end = index === segmentCount - 1 ? duration : (index + 1) * (duration / segmentCount);
      segments.push({
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        duration: Number((end - start).toFixed(2)),
        text: '',
        topic: '',
        visualQuery: '',
        emotion: '',
        importance: index < 2 ? 'high' : 'medium'
      });
    }

    return segments;
  }
}
