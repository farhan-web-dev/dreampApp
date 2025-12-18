import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_FREE_KEY': JSON.stringify(env.GEMINI_FREE_KEY),
        'process.env.GEMINI_PAID_KEY': JSON.stringify(env.GEMINI_PAID_KEY),
        'process.env.VITE_TEST_MODE': JSON.stringify(env.VITE_TEST_MODE)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
