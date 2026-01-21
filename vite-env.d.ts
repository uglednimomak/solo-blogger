/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURSO_DATABASE_URL: string
  readonly VITE_TURSO_AUTH_TOKEN: string
  readonly VITE_RESEARCHER_PROVIDER: 'gemini' | 'mock' | 'ollama'
  readonly VITE_JOURNALIST_PROVIDER: 'gemini' | 'mock' | 'ollama'
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_OLLAMA_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
