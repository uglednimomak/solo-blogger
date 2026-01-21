import { AIProvider } from "./BaseProvider";
import { MockProvider } from "./MockProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";

export class ProviderFactory {
  static createProvider(
    providerType: string,
    config?: { apiKey?: string; model?: string }
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
        return new OllamaProvider(config?.model);

      default:
        console.warn(`Unknown provider "${providerType}", falling back to Mock`);
        return new MockProvider();
    }
  }

  static createResearcher(): AIProvider {
    const providerType = import.meta.env.VITE_RESEARCHER_PROVIDER || "mock";
    let config: { apiKey?: string; model?: string } = {};
    if (providerType === "gemini") {
      config.apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      config.model = import.meta.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL;
    } else if (providerType === "ollama") {
      config.model = import.meta.env.VITE_OLLAMA_MODEL || process.env.OLLAMA_MODEL;
    }
    console.log(`📡 Researcher: ${providerType.toUpperCase()} using model ${config.model}`);
    return this.createProvider(providerType, config);
  }

  static createJournalist(): AIProvider {
    const providerType = import.meta.env.VITE_JOURNALIST_PROVIDER || "mock";
    let config: { apiKey?: string; model?: string } = {};
    if (providerType === "gemini") {
      config.apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      config.model = import.meta.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL;
    } else if (providerType === "ollama") {
      config.model = import.meta.env.VITE_OLLAMA_MODEL || process.env.OLLAMA_MODEL;
    }
    console.log(`✍️  Journalist: ${providerType.toUpperCase()} using model ${config.model}`);
    return this.createProvider(providerType, config);
  }
}
