# LazusEditor

AI Automatic Video Editor prototype built with HTML5, CSS3, and modern JavaScript. This MVP demonstrates a modular AI video editing pipeline for voice-over driven workflows.

## Features

- Audio upload and analysis
- Speech-to-text mock pipeline with timestamped transcript segments
- AI scene segmentation and storyboard generation
- Media search via proxy/API abstraction
- Visual matching and storyboard preview
- Automatic subtitle generation
- Timeline creation and preview rendering
- Downloadable WebM export from browser canvas
- Local demo backend for testing without external APIs
- GitHub Pages friendly static build

## Project structure

```text
/src
  /ai
  /api
  /audio
  /effects
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
server.js
vite.config.js
README.md
.env.example
package.json
```

## Local development

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Local API proxy

If you want the demo backend running locally:

```bash
npm run server
```

Or run both together:

```bash
npm run dev:all
```

## GitHub Pages deployment

This app is configured for GitHub Pages with a Vite base path:

- Repository: `zheeva/EditorLazus`
- GitHub Pages URL: `https://zheeva.github.io/EditorLazus/`

### Steps

1. Push to GitHub
2. Go to repository settings
3. Open Pages
4. Set source to GitHub Actions or deploy static site from branch
5. Build and publish the Vite output from `dist/`

### Build static app

```bash
npm run build
```

The generated site will be in `dist/`.

## Demo mode

The app runs without external API keys using built-in mock providers and sample visuals. This keeps the UI and editing pipeline testable even before you connect real services.

## Environment variables

Copy `.env.example` to `.env` and add your provider keys when ready:

```bash
cp .env.example .env
```

Example:

```env
PEXELS_API_KEY=
UNSPLASH_ACCESS_KEY=
FREESOUND_API_KEY=
OPENAI_API_KEY=
```

## Notes

This is an MVP focused on modular architecture and a usable workflow. It is intentionally easy to extend with real Whisper transcription, real media APIs, and cloud rendering providers.
