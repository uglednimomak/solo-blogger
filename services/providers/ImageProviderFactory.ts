import { HuggingFaceProvider } from './HuggingFaceProvider.js';
import { PollinationsProvider } from './PollinationsProvider.js';
import { ImageProvider } from './ImageProvider.js';

export class ImageProviderFactory {
  static createProvider(provider: string, apiKey?: string): ImageProvider {
    switch (provider) {
      case 'huggingface':
        if (!apiKey) {
          console.warn('Hugging Face requires an API key. Falling back to Pollinations.');
          return new PollinationsProvider();
        }
        return new HuggingFaceProvider(apiKey);
      case 'pollinations':
        return new PollinationsProvider();
      default:
        return new PollinationsProvider(); // Default to pollinations (free, no key needed)
    }
  }
}
