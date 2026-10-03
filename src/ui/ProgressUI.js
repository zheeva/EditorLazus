export class ProgressUI {
  constructor() {
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.progressPercent = document.getElementById('progressPercent');
  }

  setProgress(label, percent) {
    if (!this.progressFill || !this.progressText || !this.progressPercent) return;
    this.progressText.textContent = label;
    this.progressPercent.textContent = `${Math.round(percent)}%`;
    this.progressFill.style.width = `${percent}%`;
  }
}
