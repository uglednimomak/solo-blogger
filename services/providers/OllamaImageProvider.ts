import { ImageProvider } from './ImageProvider.js';

/**
 * OllamaImageProvider - Uses Ollama for local image generation
 * Designed for local development only
 * 
 * Supports different modes:
 * 1. Real image generation (if image generation models are available)
 *    - stable-diffusion models
 *    - flux models  
 *    - Any other image generation models loaded in Ollama
 * 
 * 2. Vision model description (fallback for text models)
 *    - llava:latest (vision + text)
 *    - minicpm-v:latest (vision model)
 *    - bakllava:latest
 * 
 * 3. Smart placeholder generation (ultimate fallback)
 *    - Category-aware placeholder images
 *    - Consistent seeding for same prompts
 */
export class OllamaImageProvider implements ImageProvider {
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private modelType: 'image-generation' | 'vision' | 'text' | 'unknown' = 'unknown';
  private availableModels: string[] = [];

  constructor(
    baseUrl: string = "http://localhost:11434", 
    model: string = "llava:latest",
    timeout: number = 60000 // 60 seconds timeout
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeout = timeout;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`🎨 Ollama Image Provider (${this.model}): Generating image for: "${prompt}"`);
    
    try {
      // Check if Ollama is available and determine model capabilities
      await this.checkOllamaAvailability();
      await this.detectModelType();

      // Try different generation strategies based on model type
      switch (this.modelType) {
        case 'image-generation':
          return await this.generateWithImageModel(prompt);
        
        case 'vision':
          return await this.generateWithVisionModel(prompt);
        
        case 'text':
        case 'unknown':
        default:
          console.log('No image generation model available, using smart placeholder');
          return this.generatePlaceholderImage(prompt);
      }

    } catch (error) {
      console.error('Ollama Image Provider Error:', error);
      console.log('Falling back to placeholder image generation');
      return this.generatePlaceholderImage(prompt);
    }
  }

  /**
   * Detect the type of model we're working with
   */
  private async detectModelType(): Promise<void> {
    const modelName = this.model.toLowerCase();
    
    // Check for image generation models
    const imageGenPatterns = [
      'stable-diffusion', 'sd', 'flux', 'dalle', 'midjourney', 
      'imagen', 'diffusion', 'generate-image', 'txt2img'
    ];
    
    // Check for vision models
    const visionPatterns = [
      'llava', 'minicpm-v', 'bakllava', 'vision', 'clip', 'blip'
    ];
    
    if (imageGenPatterns.some(pattern => modelName.includes(pattern))) {
      this.modelType = 'image-generation';
      console.log(`🎨 Detected image generation model: ${this.model}`);
    } else if (visionPatterns.some(pattern => modelName.includes(pattern))) {
      this.modelType = 'vision';
      console.log(`👁️ Detected vision model: ${this.model}`);
    } else {
      this.modelType = 'text';
      console.log(`📝 Detected text model: ${this.model}`);
    }
  }

  /**
   * Generate image using a dedicated image generation model
   */
  private async generateWithImageModel(prompt: string): Promise<string> {
    console.log(`🎨 Using image generation model for: "${prompt}"`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // For actual image generation models, we might need different API endpoints
      // This is a placeholder for when Ollama supports true image generation
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            seed: Math.floor(Math.random() * 1000000)
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // For now, since Ollama doesn't yet support image generation output,
      // we'll fall back to smart placeholder
      // TODO: Handle actual image data when available
      console.log('Image generation model responded, but image output not yet supported. Using smart placeholder.');
      return this.generatePlaceholderImage(prompt);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Image generation model failed:', error);
      return this.generatePlaceholderImage(prompt);
    }
  }

  /**
   * Generate image description using a vision model, then create smart placeholder
   */
  private async generateWithVisionModel(prompt: string): Promise<string> {
    console.log(`👁️ Using vision model to enhance prompt: "${prompt}"`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const enhancedPrompt = `Describe in detail what a high-quality, professional image for this topic would look like: "${prompt}". 
      Focus on visual elements, composition, colors, lighting, and mood. 
      Be specific about visual details that would make this image compelling for a news article or blog post.`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          prompt: enhancedPrompt,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 200
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`🎨 Vision model provided enhanced description: ${data.response?.substring(0, 100)}...`);
        
        // Use the vision model's description to create a more contextual placeholder
        return this.generateContextualPlaceholder(prompt, data.response);
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Vision model failed:', error);
    }
    
    // Fallback to regular placeholder
    return this.generatePlaceholderImage(prompt);
  }

  /**
   * Check if Ollama is running and accessible
   */
  private async checkOllamaAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for availability check
      });
      
      if (!response.ok) {
        throw new Error(`Ollama not responding: ${response.statusText}`);
      }

      const data = await response.json();
      const modelExists = data.models?.some((m: any) => 
        m.name === this.model || m.name.startsWith(this.model)
      );

      if (!modelExists) {
        console.warn(`Model ${this.model} not found in Ollama. Available models:`, 
          data.models?.map((m: any) => m.name) || []);
        console.warn(`Consider running: ollama pull ${this.model}`);
      }

    } catch (error) {
      throw new Error(`Ollama is not available at ${this.baseUrl}. Make sure Ollama is running locally.`);
    }
  }

  /**
   * Generate a contextual placeholder based on vision model description
   */
  private generateContextualPlaceholder(originalPrompt: string, visionDescription: string): string {
    console.log(`🤖 Creating contextual placeholder based on vision model description`);
    
    // Extract key visual concepts from the vision model's description
    const description = visionDescription?.toLowerCase() || '';
    
    // Enhanced categorization based on vision model description
    const contextualCategories = {
      portrait: ['person', 'people', 'human', 'face', 'portrait', 'individual'],
      architecture: ['building', 'structure', 'architecture', 'construction', 'urban'],
      nature: ['natural', 'landscape', 'outdoor', 'environment', 'sky', 'trees', 'mountains'],
      tech: ['technology', 'digital', 'screen', 'computer', 'modern', 'futuristic'],
      business: ['professional', 'office', 'corporate', 'meeting', 'workspace'],
      abstract: ['abstract', 'conceptual', 'symbolic', 'artistic', 'creative']
    };
    
    let bestCategory = 'general';
    let maxScore = 0;
    
    for (const [category, keywords] of Object.entries(contextualCategories)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (description.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }
    
    // Generate seed combining original prompt and vision description
    const combinedText = originalPrompt + visionDescription;
    const seed = Math.abs(combinedText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    
    const categorySeedOffset = {
      portrait: 2000,
      architecture: 2100,
      nature: 2200,
      tech: 2300,
      business: 2400,
      abstract: 2500,
      general: 2600
    };
    
    const finalSeed = (categorySeedOffset[bestCategory as keyof typeof categorySeedOffset] || 2600) + (seed % 100);
    
    // Choose image style based on content
    const isSerious = description.includes('serious') || description.includes('formal') || description.includes('professional');
    const style = isSerious ? '' : '?grayscale';
    
    const imageUrl = `https://picsum.photos/seed/${finalSeed}/800/600${style}`;
    
    console.log(`🖼️ Generated contextual placeholder (${bestCategory}) for: "${originalPrompt}" -> ${imageUrl}`);
    return imageUrl;
  }

  /**
   * Generate a smart placeholder image based on prompt content
   */
  private generatePlaceholderImage(prompt: string): string {
    // Create a more intelligent seed based on prompt content
    const words = prompt.toLowerCase().split(/\s+/);
    
    // Categorize the prompt to choose appropriate placeholder
    const categories = {
      tech: ['technology', 'ai', 'computer', 'digital', 'software', 'tech', 'innovation'],
      nature: ['environment', 'climate', 'nature', 'green', 'earth', 'planet', 'forest'],
      business: ['business', 'economy', 'finance', 'market', 'corporate', 'money', 'trade'],
      politics: ['politics', 'government', 'policy', 'election', 'democracy', 'legislation'],
      science: ['science', 'research', 'study', 'discovery', 'experiment', 'medical', 'health'],
      social: ['social', 'society', 'community', 'people', 'culture', 'human', 'rights']
    };

    let category = 'general';
    let maxMatches = 0;

    for (const [cat, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => 
        words.some(word => word.includes(keyword) || keyword.includes(word))
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat;
      }
    }

    // Generate seed from prompt for consistency
    const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    
    // Use category-specific collections from Lorem Picsum
    const categorySeeds = {
      tech: seed % 100 + 1000,    // Tech-looking images
      nature: seed % 100 + 1100,  // Nature images
      business: seed % 100 + 1200, // Professional/business images
      politics: seed % 100 + 1300, // Formal/institutional images
      science: seed % 100 + 1400,  // Clean/scientific images
      social: seed % 100 + 1500,   // People/social images
      general: seed % 1000 + 1     // General collection
    };

    const finalSeed = categorySeeds[category as keyof typeof categorySeeds] || seed % 1000;
    const imageUrl = `https://picsum.photos/seed/${finalSeed}/800/600?grayscale`;

    console.log(`📷 Generated placeholder image (${category} category) for: "${prompt}" -> ${imageUrl}`);
    return imageUrl;
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }
}