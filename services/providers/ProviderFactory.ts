import { AIProvider } from "./BaseProvider";
import { MockProvider } from "./MockProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";

export class ProviderFactory {
  static createProvider(
    providerType: string,
    config?: { apiKey?: string; baseUrl?: string; model?: string }
  ): AIProvider {
    const type = providerType.toLowerCase();

    switch (type) {
      case "mock":
        return new MockProvider();

      case "gemini":
        if (!config?.apiKey) {
          throw new Error("Gemini API key is required");
        }
        return new GeminiProvider(config.apiKey);

      case "ollama":
        return new OllamaProvider(config?.baseUrl, config?.model);

      default:
        console.warn(`Unknown provider "${providerType}", falling back to Mock`);
        return new MockProvider();
    }
  }

  static createResearcher(): AIProvider {
    const providerType = import.meta.env.VITE_RESEARCHER_PROVIDER || "mock";
    const config = {
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL,
      model: import.meta.env.VITE_OLLAMA_MODEL
    };

    console.log(`📡 Researcher: ${providerType.toUpperCase()}`);
    return this.createProvider(providerType, config);
  }

  static createJournalist(): AIProvider {
    const providerType = import.meta.env.VITE_JOURNALIST_PROVIDER || "mock";
    const config = {
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL,
      model: import.meta.env.VITE_OLLAMA_MODEL
    };

    console.log(`✍️  Journalist: ${providerType.toUpperCase()}`);
    return this.createProvider(providerType, config);
  }
}
