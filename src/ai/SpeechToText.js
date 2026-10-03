export class SpeechToTextProvider {
  async transcribe(audioAnalysis, options = {}) {
    const text = options.text || `Setiap pagi banyak orang terburu-buru pergi bekerja. Mereka menghadapi kemacetan dan menghabiskan banyak waktu di perjalanan.`;
    const sentenceChunks = this.chunkIntoSentences(text);
    const totalDuration = audioAnalysis?.duration || 25;
    const segments = sentenceChunks.map((sentence, index) => {
      const chunkDuration = totalDuration / sentenceChunks.length;
      const start = Number((index * chunkDuration).toFixed(2));
      const end = Number(((index + 1) * chunkDuration).toFixed(2));

      return {
        start,
        end,
        duration: Number((end - start).toFixed(2)),
        text: sentence.trim(),
        topic: this.inferTopic(sentence),
        visualQuery: this.inferVisualQuery(sentence),
        emotion: this.inferEmotion(sentence),
        importance: index === 0 ? 'high' : 'medium',
      };
    });

    return {
      provider: 'demo',
      language: 'id',
      confidence: 0.92,
      segments,
      fullText: text,
      timestamps: segments.map(({ start, end, text }) => ({ start, end, text }))
    };
  }

  chunkIntoSentences(text) {
    return text
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  inferTopic(sentence) {
    if (sentence.toLowerCase().includes('bekerja')) return 'busy work morning';
    if (sentence.toLowerCase().includes('kemacetan')) return 'traffic and commuting';
    if (sentence.toLowerCase().includes('perjalanan')) return 'daily commute';
    return 'daily routine';
  }

  inferVisualQuery(sentence) {
    if (sentence.toLowerCase().includes('bekerja')) return 'people rushing to work in the morning';
    if (sentence.toLowerCase().includes('kemacetan')) return 'heavy traffic on city road';
    if (sentence.toLowerCase().includes('perjalanan')) return 'people commuting in car during rush hour';
    return 'professional lifestyle scene';
  }

  inferEmotion(sentence) {
    if (sentence.toLowerCase().includes('buru')) return 'busy';
    if (sentence.toLowerCase().includes('kemacetan')) return 'stressful';
    return 'focused';
  }
}
