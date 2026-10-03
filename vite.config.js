import { defineConfig } from 'vite';

const repoName = 'EditorLazus';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
