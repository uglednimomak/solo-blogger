#!/bin/bash

# Provider Configuration Info Script
# Shows which AI provider is configured for different environments

echo "🤖 AI Provider Configuration"
echo "=============================="
echo ""

# Check development config
if [ -f .env.development ]; then
    echo "📦 DEVELOPMENT MODE:"
    grep "RESEARCHER_PROVIDER\|JOURNALIST_PROVIDER\|PHILOSOPHER_PROVIDER\|OLLAMA_MODEL\|GEMINI_MODEL" .env.development | sed 's/^/  /'
    echo ""
fi

# Check production config  
if [ -f .env.production ]; then
    echo "🚀 PRODUCTION MODE:"
    grep "RESEARCHER_PROVIDER\|JOURNALIST_PROVIDER\|PHILOSOPHER_PROVIDER\|OLLAMA_MODEL\|GEMINI_MODEL" .env.production | sed 's/^/  /'
    echo ""
fi

# Check current .env
if [ -f .env ]; then
    echo "⚙️  BASE CONFIGURATION (.env):"
    grep "RESEARCHER_PROVIDER\|JOURNALIST_PROVIDER\|PHILOSOPHER_PROVIDER\|OLLAMA_MODEL\|GEMINI_MODEL" .env | sed 's/^/  /'
    echo ""
fi

echo "💡 Usage:"
echo "  npm run dev       → Uses development config (Ollama)"
echo "  npm run build     → Uses production config (Gemini)"
echo "  npm run preview   → Uses production config (Gemini)"
echo ""
echo "📝 To change providers, edit .env.development or .env.production"
