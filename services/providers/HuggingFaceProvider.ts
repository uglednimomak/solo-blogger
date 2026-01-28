import { ImageProvider } from './ImageProvider.js';

const MODEL_ID = 'runwayml/stable-diffusion-v1-5';

export class HuggingFaceProvider implements ImageProvider {
  private apiKey: string; constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Hugging Face API key is required.');
    }
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const isNode = typeof window === 'undefined';

      if (isNode) {
        // Direct call to Hugging Face from server-side
        const response = await fetch(`https://router.huggingface.co/models/${MODEL_ID}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
          throw new Error(`HF API error: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:image/png;base64,${buffer.toString('base64')}`;
      } else {
        // Use the proxy endpoint to avoid CORS issues in the browser
        const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV);
        const apiUrl = isDev
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

        const arrayBuffer = await response.arrayBuffer();
        const imageBlob = new Blob([arrayBuffer], { type: 'image/png' });
        return URL.createObjectURL(imageBlob);
      }
    } catch (error) {
      console.error('Error generating image with Hugging Face:', error);
      throw error;
    }
  }
}
