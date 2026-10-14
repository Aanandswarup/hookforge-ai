import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          jspdf: ['jspdf'],
          vendor: ['react', 'react-dom', 'lucide-react', 'canvas-confetti'],
        },
      },
    },
  },
});
