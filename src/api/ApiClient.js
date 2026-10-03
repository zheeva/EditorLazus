const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiClient {
  static async request(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${endpoint}`);
    }

    return res.json();
  }

  static async getHealth() {
    return this.request('/health');
  }

  static async getTranscript() {
    return this.request('/transcript');
  }

  static async searchMedia(query = 'people commuting to work') {
    return this.request(`/media?q=${encodeURIComponent(query)}`);
  }

  static async getMusic() {
    return this.request('/music');
  }
}
