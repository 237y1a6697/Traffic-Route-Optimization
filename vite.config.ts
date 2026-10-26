import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_STADIA_API_KEY': JSON.stringify(
        process.env.VITE_STADIA_API_KEY || env.VITE_STADIA_API_KEY || env.STADIA_API_KEY || ''
      )
    },
    server: {
      port: 5173,
      host: true
    }
  };
});

