import { APP_CONFIG } from './config.js';
import { AudioAnalyzer } from './audio/AudioAnalyzer.js';
import { SpeechToTextProvider } from './ai/SpeechToText.js';
import { ContentAnalyzer } from './ai/ContentAnalyzer.js';
import { MediaProvider } from './media/MediaProvider.js';
import { SubtitleEngine } from './subtitle/SubtitleEngine.js';
import { TimelineEngine } from './timeline/TimelineEngine.js';
import { MusicEngine } from './music/MusicEngine.js';
import { VideoRenderer } from './renderer/VideoRenderer.js';
import { ProgressUI } from './ui/ProgressUI.js';
import { ApiClient } from './api/ApiClient.js';

export class App {
  constructor() {
    this.audioAnalyzer = new AudioAnalyzer();
    this.speechToText = new SpeechToTextProvider();
    this.contentAnalyzer = new ContentAnalyzer();
    this.mediaProvider = new MediaProvider();
    this.subtitleEngine = new SubtitleEngine();
    this.timelineEngine = new TimelineEngine();
    this.musicEngine = new MusicEngine();
    this.progressUI = new ProgressUI();
    this.apiClient = ApiClient;
    this.renderer = null;
    this.currentTimeline = null;
    this.currentAudioMeta = null;
    this.state = {
      uploadName: 'No file selected',
      audioDuration: '0:00',
      fileSize: '0 KB',
      progress: 0,
      activePreset: APP_CONFIG.defaultPreset,
      aspectRatio: APP_CONFIG.defaultAspectRatio,
      quality: APP_CONFIG.defaultQuality,
      scenes: []
    };
  }

  init() {
    const appRoot = document.getElementById('app');
    appRoot.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-wrap">
            <div class="brand-mark">L</div>
            <div>
              <h1>${APP_CONFIG.appName}</h1>
              <p>AI automatic video editor</p>
            </div>
          </div>

          <div class="toolbar-actions">
            <button class="secondary-btn" id="useDemoBtn">Use demo voice</button>
            <button class="primary-btn" id="renderBtn">Render video</button>
          </div>
        </header>

        <main class="workspace">
          <aside class="panel left-panel">
            <div class="section-header">
              <h2>Media / Assets</h2>
            </div>

            <label class="upload-box" for="audioUpload">
              <input id="audioUpload" type="file" accept="audio/*" />
              <span>Upload voice-over</span>
            </label>

            <div class="asset-card">
              <h3>Voice Input</h3>
              <p id="audioName">No file selected</p>
              <div class="meta-row">
                <span>Duration</span>
                <strong id="audioDuration">0:00</strong>
              </div>
              <div class="meta-row">
                <span>Size</span>
                <strong id="audioSize">0 KB</strong>
              </div>
            </div>

            <div class="asset-card">
              <h3>Progress</h3>
              <div class="progress-labels">
                <span id="progressText">Waiting for input</span>
                <span id="progressPercent">0%</span>
              </div>
              <div class="progress-bar">
                <span id="progressFill"></span>
              </div>
            </div>

            <div class="asset-card">
              <h3>Storyboard</h3>
              <div id="storyboardList" class="storyboard-list"></div>
            </div>
          </aside>

          <section class="center-panel">
            <div class="preview-header">
              <div>
                <h2>Video Preview</h2>
              </div>
              <div class="preset-selector">
                <label for="presetSelect">Preset</label>
                <select id="presetSelect">
                  <option value="cinematic">Cinematic</option>
                  <option value="documentary">Documentary</option>
                  <option value="social">Social Media</option>
                  <option value="educational">Educational</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>
            </div>

            <div class="video-stage">
              <canvas id="previewCanvas" width="1280" height="720"></canvas>
            </div>

            <div class="preview-controls">
              <button id="playPauseBtn">Play</button>
              <button id="stopBtn">Stop</button>
              <button id="exportBtn">Download WebM</button>
            </div>
          </section>

          <aside class="panel right-panel">
            <div class="section-header">
              <h2>Properties</h2>
            </div>

            <div class="property-card">
              <label>Aspect Ratio</label>
              <select id="aspectRatioSelect">
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:5">4:5</option>
              </select>
            </div>

            <div class="property-card">
              <label>Quality</label>
              <select id="qualitySelect">
                <option value="720p">Draft</option>
                <option value="1080p" selected>Standard</option>
                <option value="1080p-hb">High</option>
                <option value="4k">4K</option>
              </select>
            </div>

            <div class="property-card">
              <label>Subtitle Style</label>
              <select id="subtitleStyleSelect">
                <option value="clean">Clean</option>
                <option value="modern">Modern</option>
                <option value="bold">Bold</option>
                <option value="cinematic" selected>Cinematic</option>
              </select>
            </div>

            <div class="property-card">
              <label>Transition</label>
              <select id="transitionSelect">
                <option value="fade" selected>Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
                <option value="crossfade">Crossfade</option>
              </select>
            </div>

            <div class="property-card">
              <h3>Transcript</h3>
              <div id="transcriptList" class="transcript-list"></div>
            </div>
          </aside>
        </main>

        <footer class="timeline-panel">
          <div class="section-header">
            <h2>Timeline</h2>
          </div>
          <div id="timelineList" class="timeline-list"></div>
        </footer>
      </div>
    `;

    this.bindEvents();
    this.renderDemo();
  }

  bindEvents() {
    const upload = document.getElementById('audioUpload');
    const demoBtn = document.getElementById('useDemoBtn');
    const renderBtn = document.getElementById('renderBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const aspectSelect = document.getElementById('aspectRatioSelect');
    const presetSelect = document.getElementById('presetSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const subtitleStyleSelect = document.getElementById('subtitleStyleSelect');
    const transitionSelect = document.getElementById('transitionSelect');

    upload.addEventListener('change', (event) => this.handleAudioUpload(event));
    demoBtn.addEventListener('click', () => this.renderDemo());
    renderBtn.addEventListener('click', () => this.buildPipelineFromCurrentState());
    playPauseBtn.addEventListener('click', () => this.togglePlayback());
    stopBtn.addEventListener('click', () => this.stopPlayback());
    exportBtn.addEventListener('click', () => this.exportRender());
    aspectSelect.addEventListener('change', (event) => {
      this.state.aspectRatio = event.target.value;
      if (this.currentTimeline) this.updateCanvasSize();
    });
    presetSelect.addEventListener('change', (event) => {
      this.state.activePreset = event.target.value;
      this.setProgress('Preset updated', 95);
    });
    qualitySelect.addEventListener('change', (event) => {
      this.state.quality = event.target.value;
      this.setProgress('Quality set', 96);
    });
    subtitleStyleSelect.addEventListener('change', (event) => {
      this.setProgress(`Subtitle style: ${event.target.value}`, 98);
    });
    transitionSelect.addEventListener('change', (event) => {
      this.setProgress(`Transition: ${event.target.value}`, 99);
    });
  }

  async handleAudioUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.setProgress('Analyzing voice...', 15);
    const audioMeta = await this.audioAnalyzer.analyzeAudio(file);
    this.currentAudioMeta = audioMeta;
    document.getElementById('audioName').textContent = file.name;
    document.getElementById('audioDuration').textContent = `${Math.floor(audioMeta.duration / 60)}:${String(Math.floor(audioMeta.duration % 60)).padStart(2, '0')}`;
    document.getElementById('audioSize').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    this.state.uploadName = file.name;

    this.setProgress('Generating transcript...', 40);
    let transcript;
    try {
      transcript = await this.apiClient.getTranscript();
    } catch (error) {
      transcript = await this.speechToText.transcribe(audioMeta, { text: APP_CONFIG.demoVoice });
    }

    this.renderTranscript(transcript);
    await this.buildPipelineFromCurrentState(transcript, audioMeta);
  }

  renderDemo() {
    const demoText = APP_CONFIG.demoVoice;
    const audioMeta = {
      duration: 26,
      waveform: Array.from({ length: 120 }, (_, index) => 0.2 + ((index % 9) / 25)),
      fileName: 'demo-voice-over.mp3',
      fileSize: 3.2
    };

    this.currentAudioMeta = audioMeta;
    document.getElementById('audioName').textContent = 'demo-voice-over.mp3';
    document.getElementById('audioDuration').textContent = '0:26';
    document.getElementById('audioSize').textContent = '3.20 MB';

    this.setProgress('Preparing demo timeline...', 25);

    Promise.all([
      this.apiClient.getHealth().catch(() => ({ status: 'demo' })),
      this.apiClient.getTranscript().catch(() => this.speechToText.transcribe(audioMeta, { text: demoText }))
    ]).then(([health, transcript]) => {
      if (health?.status === 'ok') this.setProgress('Connected to API proxy', 35);
      this.renderTranscript(transcript);
      this.buildPipelineFromCurrentState(transcript, audioMeta);
    }).catch(() => {
      const transcript = this.speechToText.transcribe(audioMeta, { text: demoText });
      this.renderTranscript(transcript);
      this.buildPipelineFromCurrentState(transcript, audioMeta);
    });
  }

  async buildPipelineFromCurrentState(transcriptOverride = null, audioMetaOverride = null) {
    const transcript = transcriptOverride || this.speechToText.transcribe(this.currentAudioMeta || { duration: 26 }, { text: APP_CONFIG.demoVoice });
    const audioMeta = audioMetaOverride || this.currentAudioMeta || { duration: 26, waveform: [] };

    this.setProgress('Generating storyboard...', 52);
    const scenes = this.contentAnalyzer.createScenes(transcript.segments);

    const enrichedScenes = await Promise.all(
      scenes.map(async (scene, index) => {
        let media = [];
        try {
          const response = await this.apiClient.searchMedia(scene.visualQuery);
          media = response.items || [];
        } catch (error) {
          media = [];
        }

        const visual = media[index % media.length]?.url || APP_CONFIG.demoSceneVisuals[index % APP_CONFIG.demoSceneVisuals.length];
        const track = this.musicEngine.pickTrack(scene.mood);

        return {
          ...scene,
          visual,
          music: track,
          subtitle: scene.text,
          transition: scene.transition || 'fade',
          start: scene.start,
          end: scene.end,
          duration: scene.duration,
          title: `Scene ${index + 1}`
        };
      })
    );

    this.state.scenes = enrichedScenes;
    const timeline = this.timelineEngine.buildTimeline(audioMeta, enrichedScenes, this.state.aspectRatio);
    this.currentTimeline = timeline;
    const subtitles = this.subtitleEngine.createSubtitles(transcript, document.getElementById('subtitleStyleSelect')?.value || 'cinematic');

    this.setProgress('Creating subtitles...', 80);
    this.renderStoryboard(enrichedScenes);
    this.renderTimeline(timeline, subtitles);
    this.initRenderer();
    this.setProgress('Video complete.', 100);
  }

  initRenderer() {
    const canvas = document.getElementById('previewCanvas');
    const { width, height } = APP_CONFIG.aspectRatios[this.state.aspectRatio] || APP_CONFIG.aspectRatios['16:9'];
    canvas.width = width / 2;
    canvas.height = height / 2;
    this.renderer = new VideoRenderer(this.currentTimeline, canvas);
    this.renderer.startPreview();
  }

  updateCanvasSize() {
    const canvas = document.getElementById('previewCanvas');
    const { width, height } = APP_CONFIG.aspectRatios[this.state.aspectRatio] || APP_CONFIG.aspectRatios['16:9'];
    canvas.width = width / 2;
    canvas.height = height / 2;
  }

  togglePlayback() {
    if (!this.renderer) return;
    const btn = document.getElementById('playPauseBtn');
    if (this.renderer.isPlaying) {
      this.renderer.stopPreview();
      btn.textContent = 'Play';
    } else {
      this.renderer.startPreview();
      btn.textContent = 'Pause';
    }
  }

  stopPlayback() {
    if (!this.renderer) return;
    this.renderer.stopPreview();
    document.getElementById('playPauseBtn').textContent = 'Play';
  }

  async exportRender() {
    if (!this.currentTimeline) {
      this.setProgress('No timeline available', 0);
      return;
    }

    const canvas = document.getElementById('previewCanvas');
    const renderer = new VideoRenderer(this.currentTimeline, canvas);
    const result = await renderer.exportVideo();
    const anchor = document.createElement('a');
    anchor.href = result.url;
    anchor.download = 'lazuseditor-export.webm';
    anchor.click();
    this.setProgress('Download started', 100);
  }

  renderTranscript(transcript) {
    const container = document.getElementById('transcriptList');
    const segments = transcript?.segments || [];
    container.innerHTML = segments
      .map((segment) => `
        <div class="transcript-item">
          <strong>${segment.start.toFixed(1)}s</strong>
          <span>${segment.text}</span>
        </div>
      `)
      .join('');
  }

  renderStoryboard(scenes) {
    const container = document.getElementById('storyboardList');
    container.innerHTML = scenes
      .slice(0, 5)
      .map((scene, index) => `
        <div class="story-scene">
          <div class="story-thumb" style="background-image:url('${scene.visual}')"></div>
          <div>
            <strong>Scene ${index + 1}</strong>
            <small>${scene.topic}</small>
          </div>
        </div>
      `)
      .join('');
  }

  renderTimeline(timeline) {
    const timelineList = document.getElementById('timelineList');
    const scenes = timeline.scenes || [];
    timelineList.innerHTML = scenes
      .map((scene) => `
        <div class="timeline-item">
          <span class="time-pair">${(scene.start || 0).toFixed(1)}s - ${(scene.end || scene.start + scene.duration).toFixed(1)}s</span>
          <span>${scene.title}</span>
          <span>${scene.transition}</span>
          <span>${scene.mood}</span>
        </div>
      `)
      .join('');
  }

  setProgress(label, percent) {
    this.progressUI.setProgress(label, percent);
  }
}
