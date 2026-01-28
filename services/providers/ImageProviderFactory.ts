import { HuggingFaceProvider } from './HuggingFaceProvider.js';
import { PollinationsProvider } from './PollinationsProvider.js';
import { ImageProvider } from './ImageProvider.js';

export class ImageProviderFactory {
  static createProvider(provider: string, apiKey?: string): ImageProvider {
    switch (provider) {
      case 'huggingface':
        if (!apiKey) throw new Error('Hugging Face requires an API key');
        return new HuggingFaceProvider(apiKey);
      case 'pollinations':
        return new PollinationsProvider();
      default:
        return new PollinationsProvider(); // Default to pollinations (free, no key needed)
    }
  }
}
