# LazusEditor

AI Automatic Video Editor prototype built with HTML5, CSS3, and modern JavaScript. This MVP demonstrates the full pipeline for a voice-over driven video editor:

- audio upload and analysis
- speech-to-text mock pipeline
- AI scene segmentation
- visual matching and storyboard generation
- subtitle synchronization
- timeline creation
- preview rendering
- export as WebM from the browser

## Stack

- Vite + vanilla JavaScript
- Web Audio API
- Canvas + MediaRecorder
- Modular architecture

## Project structure

```text
/src
  /ai
  /audio
  /media
  /music
  /renderer
  /subtitle
  /timeline
  /ui
  /utils
  App.js
  config.js
  main.js
  styles.css
```

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Demo mode

The app runs without external API keys using built-in mock providers and sample footage URLs. You can upload your own audio file or use the default demo voice-over.

## Environment variables

Copy `.env.example` to `.env` and fill in the keys for external providers when you are ready to connect real APIs.

## Notes

This is an MVP focused on architecture and flow. It is intentionally modular so you can plug in real providers such as Whisper, Pexels, Unsplash, and cloud-based rendering later.
