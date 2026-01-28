import { AIProvider } from "./BaseProvider.js";
import { MockProvider } from "./MockProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { OllamaProvider } from "./OllamaProvider.js";

export class ProviderFactory {
  static createProvider(
    providerType: string,
    config?: { apiKey?: string; model?: string; baseUrl?: string }
  ): AIProvider {
    const type = providerType.toLowerCase();

    switch (type) {
      case "mock":
        return new MockProvider();

      case "gemini":
        if (!config?.apiKey) {
          throw new Error("Gemini API key is required");
        }
        return new GeminiProvider(config.apiKey, config.model);

      case "ollama":
        return new OllamaProvider(config?.baseUrl, config?.model);

      default:
        console.warn(`Unknown provider "${providerType}", falling back to Mock`);
        return new MockProvider();
    }
  }

  static createResearcher(): AIProvider {
    const providerType = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEARCHER_PROVIDER) || process.env.RESEARCHER_PROVIDER || "mock";
    let config: { apiKey?: string; model?: string; baseUrl?: string } = {};
    if (providerType === "gemini") {
      config.apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || process.env.GEMINI_API_KEY;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || process.env.GEMINI_MODEL;
    } else if (providerType === "ollama") {
      config.baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_BASE_URL) || process.env.OLLAMA_BASE_URL;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_MODEL) || process.env.OLLAMA_MODEL;
    }
    console.log(`📡 Researcher: ${providerType.toUpperCase()} using model ${config.model}`);
    return this.createProvider(providerType, config);
  }

  static createJournalist(): AIProvider {
    const providerType = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_JOURNALIST_PROVIDER) || process.env.JOURNALIST_PROVIDER || "mock";
    let config: { apiKey?: string; model?: string; baseUrl?: string } = {};
    if (providerType === "gemini") {
      config.apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || process.env.GEMINI_API_KEY;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || process.env.GEMINI_MODEL;
    } else if (providerType === "ollama") {
      config.baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_BASE_URL) || process.env.OLLAMA_BASE_URL;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_MODEL) || process.env.OLLAMA_MODEL;
    }
    console.log(`✍️  Journalist: ${providerType.toUpperCase()} using model ${config.model}`);
    return this.createProvider(providerType, config);
  }

  static createPhilosopher(): AIProvider {
    const providerEnv = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_PHILOSOPHER_PROVIDER || import.meta.env?.VITE_JOURNALIST_PROVIDER) : (process.env.PHILOSOPHER_PROVIDER || process.env.JOURNALIST_PROVIDER);
    const providerType = providerEnv || "mock";
    let config: { apiKey?: string; model?: string; baseUrl?: string } = {};
    if (providerType === "gemini") {
      config.apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || process.env.GEMINI_API_KEY;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || process.env.GEMINI_MODEL;
    } else if (providerType === "ollama") {
      config.baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_BASE_URL) || process.env.OLLAMA_BASE_URL;
      config.model = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_MODEL) || process.env.OLLAMA_MODEL;
    }
    console.log(`🧠 Philosopher: ${providerType.toUpperCase()} using model ${config.model}`);
    return this.createProvider(providerType, config);
  }
}
