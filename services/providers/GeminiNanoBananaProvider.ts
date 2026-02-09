import { GoogleGenAI } from '@google/genai';
import { ImageProvider } from './ImageProvider.js';

export class GeminiNanoBananaProvider implements ImageProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash-image') {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`🍌 Gemini Nano Banana (${this.model}): Generating image for "${prompt.substring(0, 50)}..."`);
    
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: [prompt],
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '4:3'
          }
        }
      });

      // Extract image from response parts
      const textResponse = this.extractText(result);
      const parts = result.candidates?.[0]?.content?.parts || [];
      
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          // Return as data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error('No image data returned from Nano Banana');
    } catch (error: any) {
      console.error('Nano Banana image generation failed:', error);
      
      // Fallback to placeholder
      const seed = Math.floor(Math.random() * 10000);
      return `https://picsum.photos/seed/${seed}/800/600`;
    }
  }

  private extractText(result: any): string {
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    }
    return '';
  }
}
