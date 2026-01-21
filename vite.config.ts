import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify(env.GEMINI_MODEL),
        'import.meta.env.VITE_TURSO_DATABASE_URL': JSON.stringify(env.TURSO_DATABASE_URL),
        'import.meta.env.VITE_TURSO_AUTH_TOKEN': JSON.stringify(env.TURSO_AUTH_TOKEN),
        'import.meta.env.VITE_RESEARCHER_PROVIDER': JSON.stringify(env.RESEARCHER_PROVIDER || 'mock'),
        'import.meta.env.VITE_JOURNALIST_PROVIDER': JSON.stringify(env.JOURNALIST_PROVIDER || 'mock'),
        'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434'),
        'import.meta.env.VITE_OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'llama3.2')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
