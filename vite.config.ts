import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { huggingFaceProxyPlugin } from './vite-plugin-huggingface-proxy.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Environment-based provider configuration
  // Development: Use Ollama (local)
  // Production/Staging: Use Gemini (cloud)
  const isDevelopment = mode === 'development';
  const defaultResearcher = isDevelopment ? 'ollama' : 'gemini';
  const defaultJournalist = isDevelopment ? 'ollama' : 'gemini';
  const defaultPhilosopher = isDevelopment ? 'ollama' : 'gemini';
  const defaultOllamaModel = isDevelopment ? 'llama3.2' : 'llama3.2';
  const defaultGeminiModel = isDevelopment ? 'gemini-2.5-flash' : 'gemini-2.5-flash';

  // Get Hugging Face API key
  const huggingFaceApiKey = env.VITE_HUGGING_FACE_API_KEY || env.HUGGINGFACE_API_KEY || '';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), huggingFaceProxyPlugin(huggingFaceApiKey)],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_MODEL': JSON.stringify(env.GEMINI_MODEL || defaultGeminiModel),
      'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify(env.GEMINI_MODEL || defaultGeminiModel),
      'import.meta.env.VITE_TURSO_DATABASE_URL': JSON.stringify(env.TURSO_DATABASE_URL),
      'import.meta.env.VITE_TURSO_AUTH_TOKEN': JSON.stringify(env.TURSO_AUTH_TOKEN),
      'import.meta.env.VITE_RESEARCHER_PROVIDER': JSON.stringify(env.RESEARCHER_PROVIDER || defaultResearcher),
      'import.meta.env.VITE_JOURNALIST_PROVIDER': JSON.stringify(env.JOURNALIST_PROVIDER || defaultJournalist),
      'import.meta.env.VITE_PHILOSOPHER_PROVIDER': JSON.stringify(env.PHILOSOPHER_PROVIDER || defaultPhilosopher),
      'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434'),
      'import.meta.env.VITE_OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || defaultOllamaModel),
      'import.meta.env.VITE_HUGGING_FACE_API_KEY': JSON.stringify(env.VITE_HUGGING_FACE_API_KEY),
      'import.meta.env.MODE': JSON.stringify(mode)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
