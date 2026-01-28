import { ImageProvider } from './ImageProvider.js';

export class PollinationsProvider implements ImageProvider {
  async generateImage(prompt: string): Promise<string> {
    try {
      // Use Lorem Picsum for reliable, high-quality stock photos
      // Generate a unique seed from the prompt for consistency
      const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;
      
      console.log(`Generated image URL for "${prompt}": ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error('Error generating image with Picsum:', error);
      throw error;
    }
  }
}
