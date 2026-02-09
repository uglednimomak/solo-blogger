# Ollama Image Provider for Local Development

This document explains how to set up and use the Ollama Image Provider for local development in the Solo Blogger application.

## Overview

The Ollama Image Provider enables local image generation for development, reducing dependency on external APIs and improving development experience. It supports multiple modes:

1. **Real Image Generation** (Future) - When image generation models become available
2. **Vision Model Enhancement** - Uses vision models to create better image descriptions
3. **Smart Placeholder Generation** - Category-aware placeholder images

## Quick Start

### 1. Install Ollama

```bash
# Visit https://ollama.ai/ and download for your platform
# Or use package managers:

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama

```bash
ollama serve
```

### 3. Install Recommended Models

```bash
# Vision model for enhanced descriptions
ollama pull llava:latest

# Text model for article generation
ollama pull llama3.2:latest

# Alternative vision model (optional)
ollama pull minicpm-v:latest
```

### 4. Test the Setup

```bash
# Check if everything is working
npm run ollama:check

# Test image generation
npm run ollama:test
```

## Configuration

The Ollama Image Provider is configured in `config/dev.config.ts`:

```typescript
export const devConfig = {
  imageProvider: {
    provider: 'ollama',
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llava:latest',
      timeout: 60000
    },
    fallback: {
      provider: 'pollinations',
      warnOnFallback: true
    }
  }
};
```

## How It Works

### Mode 1: Vision Model Enhancement (Current)

1. Detects if you have vision models (llava, minicpm-v, bakllava)
2. Sends your prompt to the vision model to generate detailed image descriptions
3. Creates context-aware placeholder images based on the enhanced description
4. Categories images by content type (tech, nature, business, etc.)

### Mode 2: Image Generation (Future)

When Ollama supports image generation models:
1. Detects image generation models (stable-diffusion, flux, etc.)
2. Generates actual images using the model
3. Returns base64 encoded images or saves to local storage

### Mode 3: Smart Placeholders (Fallback)

1. Analyzes prompt content for keywords
2. Categorizes into predefined themes
3. Generates deterministic placeholder URLs
4. Ensures consistent images for the same prompts

## Available Models

### Recommended Vision Models
- `llava:latest` - Multi-modal model (text + vision)
- `minicpm-v:latest` - Efficient vision model
- `bakllava:latest` - Alternative vision model

### Future Image Generation Models
- `stable-diffusion:latest` - When available
- `flux:latest` - When available

## Development Scripts

```bash
# Show setup instructions
npm run ollama:setup

# Check Ollama status and available models  
npm run ollama:check

# Test image generation with sample prompts
npm run ollama:test

# Run troubleshooting guide
node scripts/setup-ollama.js troubleshoot
```

## API Usage

### Basic Usage

```typescript
import { ImageProviderFactory } from './services/providers/ImageProviderFactory.js';

// Automatic environment detection
const provider = ImageProviderFactory.getEnvironmentProvider();

// Generate image
const imageUrl = await provider.generateImage('AI technology innovation');
```

### Direct Usage

```typescript
import { OllamaImageProvider } from './services/providers/OllamaImageProvider.js';

const provider = new OllamaImageProvider(
  'http://localhost:11434',  // baseUrl
  'llava:latest',            // model
  60000                      // timeout
);

const imageUrl = await provider.generateImage('Climate change research');
```

### Advanced Configuration

```typescript
// Check available models
const models = await provider.getAvailableModels();
console.log('Available models:', models);

// Use specific model
const customProvider = new OllamaImageProvider(
  'http://localhost:11434',
  'minicpm-v:latest'  // Alternative vision model
);
```

## Environment Detection

The provider automatically detects your environment:

- **Development/Local**: Uses Ollama when available, falls back to Pollinations
- **Production**: Uses Pollinations or other configured providers
- **Offline**: Smart placeholder generation

## Troubleshooting

### Ollama Not Responding

```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Test API endpoint
curl http://localhost:11434/api/tags
```

### Model Not Found

```bash
# List installed models
ollama list

# Pull missing model
ollama pull llava:latest

# Verify installation
ollama run llava:latest "hello"
```

### Port Already in Use

```bash
# Check what's using port 11434
lsof -i :11434

# Kill the process if needed
kill -9 <PID>

# Start Ollama on different port
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

### Memory Issues

```bash
# Check system resources
htop

# Use smaller models
ollama pull llava:7b   # Instead of llava:latest (13b)
```

## Performance Tips

1. **Use appropriate model sizes**: Smaller models are faster but less capable
2. **Set reasonable timeouts**: 60s is good for most operations
3. **Cache results**: The provider generates consistent URLs for same prompts
4. **Monitor resources**: Vision models can be memory-intensive

## Integration with Main App

The Ollama Image Provider integrates seamlessly:

```typescript
// In your article generation
const article = await aiProvider.writeArticle(story);

// Image will be generated using Ollama in development
const imageUrl = await imageProvider.generateImage(article.title);

article.imageUrl = imageUrl;
```

## Future Enhancements

1. **True Image Generation**: When Ollama supports Stable Diffusion, DALL-E, etc.
2. **Image Caching**: Local storage of generated images
3. **Batch Processing**: Generate multiple images efficiently
4. **Custom Models**: Support for fine-tuned models
5. **WebUI Integration**: Visual interface for testing

## Contributing

When contributing to the Ollama Image Provider:

1. Test with multiple models
2. Handle errors gracefully
3. Provide meaningful fallbacks
4. Update documentation
5. Add tests for new features

## Security Notes

- Ollama runs locally, so no data leaves your machine
- No API keys required for local development
- Safe for sensitive content and proprietary information
- Network requests only go to localhost:11434

## License

Part of the Solo Blogger project. Check main LICENSE file for details.