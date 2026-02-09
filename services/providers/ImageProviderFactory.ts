import { HuggingFaceProvider } from './HuggingFaceProvider.js';
import { PollinationsProvider } from './PollinationsProvider.js';
import { GeminiNanoBananaProvider } from './GeminiNanoBananaProvider.js';
import { OllamaImageProvider } from './OllamaImageProvider.js';
import { PixazoImageProvider } from './PixazoImageProvider.js';
import { ImageProvider } from './ImageProvider.js';

export class ImageProviderFactory {
  static createProvider(provider: string, apiKey?: string, baseUrl?: string): ImageProvider {
    switch (provider) {
      case 'pixazo':
        // Free image generation with FLUX and Stable Diffusion
        console.log('🎨 Using Pixazo Image Provider for free image generation');
        return new PixazoImageProvider(baseUrl, 'flux-schnell', 60000, apiKey);
      case 'ollama':
        // For local development only
        console.log('🏠 Using Ollama Image Provider for local development');
        return new OllamaImageProvider(baseUrl);
      case 'gemini':
      case 'imagen':
        if (!apiKey) {
          console.warn('Gemini Nano Banana requires an API key. Falling back to Pixazo.');
          return new PixazoImageProvider();
        }
        return new GeminiNanoBananaProvider(apiKey);
      case 'huggingface':
        if (!apiKey) {
          console.warn('Hugging Face requires an API key. Falling back to Pixazo.');
          return new PixazoImageProvider();
        }
        return new HuggingFaceProvider(apiKey);
      case 'pollinations':
        return new PollinationsProvider();
      default:
        return new PixazoImageProvider(); // Default to Pixazo (free, no key needed)
    }
  }
  
  /**
   * Get the appropriate provider for the environment
   * Uses Pixazo as default (free), Ollama in development if available
   */
  static getEnvironmentProvider(apiKey?: string): ImageProvider {
    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
    const isLocal = typeof window === 'undefined' ? true : window.location.hostname === 'localhost';
    
    if (isDev || isLocal) {
      console.log('🏠 Development environment detected');
      
      // Try Ollama first if available (for local development)
      try {
        const ollamaProvider = new OllamaImageProvider();
        console.log('🦙 Using Ollama for local development');
        return ollamaProvider;
      } catch (error) {
        console.log('🎨 Ollama not available, using Pixazo for free image generation');
        return new PixazoImageProvider();
      }
    }
    
    // Production: Use Pixazo as free default
    console.log('🎨 Using Pixazo Image Provider for production');
    return new PixazoImageProvider();
  }
}
