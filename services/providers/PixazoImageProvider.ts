import { ImageProvider } from './ImageProvider.js';

/**
 * PixazoImageProvider - Uses Pixazo API for free image generation
 * 
 * Free Tier: Truly free access with no paywalls, credit limits, or registration traps
 * 
 * Supported Models:
 * - FLUX Schnell API (Free) - Fast, high-quality outputs
 * - Stable Diffusion API (Free) - High-quality text-to-image generation
 * - Stable Diffusion Inpainting API (Free) - Image editing capabilities
 * 
 * Features:
 * - No watermarks on generated images
 * - Simple HTTP POST requests with JSON payloads
 * - Authentication is optional for free tier
 * - Automatic retry and rate limiting handling
 */
export class PixazoImageProvider implements ImageProvider {
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private apiKey?: string;

  constructor(
    baseUrl: string = "https://api.pixazo.ai/v1",
    model: string = "flux-schnell", // Options: flux-schnell, stable-diffusion, stable-diffusion-inpainting
    timeout: number = 60000,
    apiKey?: string // Optional for free tier, recommended for higher throughput
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeout = timeout;
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`🎨 Pixazo Provider (${this.model}): Generating image for: "${prompt}"`);
    
    // Validate prompt length (max 500 characters to avoid truncation)
    if (prompt.length > 500) {
      console.warn(`Prompt is ${prompt.length} characters, truncating to 500 to avoid errors`);
      prompt = prompt.substring(0, 500);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add API key if provided (recommended for higher throughput)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const requestBody = {
        prompt: prompt,
        model: this.model,
        // Default parameters optimized for quality and speed
        width: 800,
        height: 600,
        num_inference_steps: this.model === 'flux-schnell' ? 4 : 20,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
      };

      const response = await fetch('/api/pixazo-proxy', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pixazo API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      // Handle different response formats
      let imageUrl: string;
      
      if (data.image_url) {
        imageUrl = data.image_url;
      } else if (data.url) {
        imageUrl = data.url;
      } else if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].url || data.images[0];
      } else if (data.data && data.data.length > 0) {
        imageUrl = data.data[0].url || data.data[0];
      } else {
        throw new Error('No image URL found in response');
      }

      console.log(`✅ Generated image: ${imageUrl}`);
      return imageUrl;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Image generation timed out');
      }
      
      console.error('Pixazo Image Provider Error:', error);
      throw error;
    }
  }

  /**
   * Generate image with specific dimensions
   */
  async generateImageWithDimensions(
    prompt: string, 
    width: number = 800, 
    height: number = 600
  ): Promise<string> {
    console.log(`🎨 Pixazo Provider: Generating ${width}x${height} image for: "${prompt}"`);

    if (prompt.length > 500) {
      prompt = prompt.substring(0, 500);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          prompt: prompt,
          model: this.model,
          width: width,
          height: height,
          num_inference_steps: this.model === 'flux-schnell' ? 4 : 20,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pixazo API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract image URL from various possible response formats
      const imageUrl = data.image_url || data.url || 
                      (data.images && data.images[0]?.url) || 
                      (data.data && data.data[0]?.url) ||
                      data.images?.[0] || data.data?.[0];

      if (!imageUrl) {
        throw new Error('No image URL found in response');
      }

      return imageUrl;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Image generation timed out');
      }
      throw error;
    }
  }

  /**
   * Get available models and their capabilities
   */
  static getAvailableModels() {
    return {
      'flux-schnell': {
        name: 'FLUX Schnell',
        description: 'Fast, high-quality text-to-image outputs with minimal latency',
        speed: 'Very Fast (2-5 seconds)',
        quality: 'High',
        features: ['Text-to-image', 'Fast generation', 'Good prompt following'],
        free: true
      },
      'stable-diffusion': {
        name: 'Stable Diffusion',
        description: 'High-quality text-to-image generation with broad stylistic control',
        speed: 'Fast (5-10 seconds)',
        quality: 'Very High',
        features: ['Text-to-image', 'Style control', 'Detail retention'],
        free: true
      },
      'stable-diffusion-inpainting': {
        name: 'Stable Diffusion Inpainting',
        description: 'Modify specific regions of images using text prompts',
        speed: 'Medium (10-15 seconds)',
        quality: 'High',
        features: ['Image editing', 'Object removal', 'Background replacement'],
        free: true
      }
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });
      
      return testResponse.ok;
    } catch (error) {
      console.warn('Pixazo API test connection failed:', error);
      return false;
    }
  }

  /**
   * Get service status and available models
   */
  async getServiceInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Could not fetch service info:', error);
    }
    
    return null;
  }

  /**
   * Generate image with retry logic for better reliability
   */
  async generateImageWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for image generation`);
        return await this.generateImage(prompt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}
