import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // or vue

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Whenever you hit /api on your frontend, Vite routes it to Flask
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});