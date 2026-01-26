import { ImageProvider } from './ImageProvider';

const MODEL_ID = 'runwayml/stable-diffusion-v1-5';

export class HuggingFaceProvider implements ImageProvider {
  private apiKey: string;  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Hugging Face API key is required.');
    }
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      // Use the proxy endpoint to avoid CORS issues
      const apiUrl = import.meta.env.DEV 
        ? '/api/huggingface-proxy' 
        : `${window.location.origin}/api/huggingface-proxy`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
          model: MODEL_ID 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`${response.status} – ${errorData.error || response.statusText}`);
      }

      // Get the image as arrayBuffer, then convert to blob
      const arrayBuffer = await response.arrayBuffer();
      const imageBlob = new Blob([arrayBuffer], { type: 'image/png' });
      return URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error('Error generating image with Hugging Face:', error);
      throw error;
    }
  }
}
