import { ImageProvider } from './ImageProvider.js';

export class GeminiImageProvider implements ImageProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'imagen-4.0-fast-generate-001') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`🎨 Gemini Image Provider (${this.model}): Generating image for "${prompt.substring(0, 50)}..."`);
    
    try {
      // Use Google AI REST API for Imagen
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:predict?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '4:3',
              safetyFilterLevel: 'BLOCK_SOME'
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Imagen API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      
      // Extract base64 image from response
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      throw new Error('No image data returned from Gemini Imagen');
    } catch (error: any) {
      console.error('Gemini Image generation failed:', error);
      
      // Fallback to placeholder
      const seed = Math.floor(Math.random() * 10000);
      return `https://picsum.photos/seed/${seed}/800/600`;
    }
  }
}
