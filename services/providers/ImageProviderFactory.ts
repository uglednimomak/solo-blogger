import { HuggingFaceProvider } from './HuggingFaceProvider';
import { PollinationsProvider } from './PollinationsProvider';
import { ImageProvider } from './ImageProvider';

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
