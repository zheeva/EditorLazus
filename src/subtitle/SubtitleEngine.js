export class SubtitleEngine {
  createSubtitles(transcript, style = 'cinematic') {
    return transcript.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      style,
      position: 'bottom-center',
      fontSize: style === 'cinematic' ? 36 : 30,
      color: '#ffffff',
      background: 'rgba(15, 23, 42, 0.25)',
      outline: true,
      shadow: true
    }));
  }
}
