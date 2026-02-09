/**
 * Development Configuration for Solo Blogger
 * This file contains settings optimized for local development
 */

export const devConfig = {
  // Image Provider Configuration
  imageProvider: {
    // Use Ollama for local development
    provider: 'ollama',
    
    // Ollama settings
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llava:latest', // Default vision model
      timeout: 60000, // 60 seconds
      
      // Alternative models you can use:
      alternativeModels: {
        vision: ['llava:latest', 'minicpm-v:latest', 'bakllava:latest'],
        // Future: when Ollama supports image generation models
        imageGeneration: ['stable-diffusion:latest', 'flux:latest'],
        text: ['llama3.2:latest', 'mistral:latest', 'codellama:latest']
      }
    },
    
    // Fallback configuration if Ollama is not available
    fallback: {
      provider: 'pollinations',
      warnOnFallback: true
    }
  },

  // AI Provider Configuration  
  aiProvider: {
    // Use Ollama for text generation in development
    provider: 'ollama',
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2:latest'
    }
  },

  // Development flags
  development: {
    enableOllamaImageProvider: true,
    enableDebugLogs: true,
    enableModelSuggestions: true,
    showPlaceholderInfo: true
  }
};

export const ollamaSetupInstructions = {
  installation: [
    '1. Install Ollama: https://ollama.ai/',
    '2. Start Ollama: ollama serve',
    '3. Pull recommended models:',
    '   - ollama pull llava:latest     # For vision-enhanced image descriptions',  
    '   - ollama pull llama3.2:latest  # For text generation',
    '   - ollama pull minicpm-v:latest # Alternative vision model'
  ],
  
  futureImageGeneration: [
    'When image generation models become available in Ollama:',
    '   - ollama pull stable-diffusion:latest',
    '   - ollama pull flux:latest',
    'Then update the model in config: model: "stable-diffusion:latest"'
  ],

  troubleshooting: {
    'Ollama not responding': [
      'Check if Ollama is running: ps aux | grep ollama',
      'Start Ollama: ollama serve',
      'Check port 11434: curl http://localhost:11434/api/tags'
    ],
    'Model not found': [
      'List available models: ollama list',
      'Pull missing model: ollama pull <model-name>',
      'Check model name format (e.g., "llava:latest" not just "llava")'
    ]
  }
};

// Helper function to get the appropriate configuration for the environment
export function getImageProviderConfig() {
  const isLocal = typeof window === 'undefined' ? true : 
                 window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
  
  const isDev = process?.env?.NODE_ENV === 'development';
  
  if (isDev || isLocal) {
    return devConfig.imageProvider;
  }
  
  // Production fallback
  return {
    provider: 'pollinations',
    fallback: { provider: 'pollinations' }
  };
}