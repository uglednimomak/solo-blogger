
# Environment-Based AI Provider Configuration

## Overview

The application uses a flexible environment-based configuration system to switch between AI providers based on the deployment environment:

- **Development**: Uses Ollama (local AI)
- **Production/Staging**: Uses Gemini (cloud AI)

## How It Works

### 1. Environment Files

- `.env` — Base configuration (default values)
- `.env.development` — Development-specific configuration (auto-loaded in dev mode)
- `.env.production` — Production-specific configuration (auto-loaded in production builds)

### 2. Automatic Provider Selection

The `vite.config.ts` automatically selects the appropriate provider based on the mode:

```typescript
// Development mode → Ollama
// Production mode → Gemini
const isDevelopment = mode === 'development';
const defaultResearcher = isDevelopment ? 'ollama' : 'gemini';
```

### 3. Configuration Variables

#### AI Provider Selection

```env
RESEARCHER_PROVIDER=ollama    # or "gemini" or "mock"
JOURNALIST_PROVIDER=ollama    # or "gemini" or "mock"
```

#### Gemini (Cloud AI)

```env
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your_api_key_here
```

#### Ollama (Local AI)

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2          # or any Ollama model
```

#### Hugging Face (Image Generation)

```env
HUGGING_FACE_API_KEY=your_api_key_here
```

## Usage

### Development Mode (Ollama)

```sh
npm run dev
# Automatically uses Ollama with llama3.2 model
```

### Production Build (Gemini)

```sh
npm run build
npm run preview
# Automatically uses Gemini with gemini-2.5-flash model
```

### Override Provider in Development

Edit `.env.development`:

```env
# Force Gemini in development
RESEARCHER_PROVIDER=gemini
JOURNALIST_PROVIDER=gemini
```

### Override Provider in Production

Edit `.env.production`:

```env
# Force Ollama in production (if you have a hosted Ollama instance)
RESEARCHER_PROVIDER=ollama
JOURNALIST_PROVIDER=ollama
OLLAMA_BASE_URL=https://your-ollama-server.com
```

## Custom Provider Configuration

### Adding a New Provider

1. Create the provider class in `services/providers/`
2. Implement the `AIProvider` interface
3. Add it to `ProviderFactory.createProvider()` switch
4. Set the environment variable to use it

### Using Different Models

#### For Ollama

```env
# .env.development
OLLAMA_MODEL=mistral          # or llama3, codellama, etc.
```

#### For Gemini

```env
# .env.production
GEMINI_MODEL=gemini-pro       # or any Gemini model
```

### Using Different Providers for Different Agents

```env
# Use Ollama for research, Gemini for writing
RESEARCHER_PROVIDER=ollama
JOURNALIST_PROVIDER=gemini
```

## Testing Provider Configuration

Check console logs on startup:

```text
📡 Researcher: OLLAMA using model llama3.2
✍️  Journalist: OLLAMA using model llama3.2
```

## Environment Variables Priority

1. `.env.development` or `.env.production` (environment-specific)
2. `.env` (base configuration)
3. Vite config defaults (fallback)

## Best Practices

1. **Development**: Use Ollama for free local testing
2. **Production**: Use Gemini for production reliability
3. **Staging**: Use Gemini with rate limiting
4. **Testing**: Use Mock provider to avoid API costs

## Troubleshooting

### Ollama not connecting

- Ensure Ollama is running: `ollama serve`
- Check `OLLAMA_BASE_URL` matches your Ollama server
- Verify model is pulled: `ollama pull llama3.2`

### Gemini API errors

- Verify `GEMINI_API_KEY` is valid
- Check API quota hasn't been exceeded
- Ensure `GEMINI_MODEL` is a valid model name

### Wrong provider being used

- Check which `.env` file is being loaded
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server
