#!/usr/bin/env node

/**
 * Ollama Setup and Testing Utility
 * Helps developers set up and test Ollama image provider
 */

import { OllamaImageProvider } from '../services/providers/OllamaImageProvider.js';
import { devConfig, ollamaSetupInstructions } from '../config/dev.config.js';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printHeader() {
  console.log('\n' + colorize('🦙 Ollama Image Provider Setup & Testing', 'bright'));
  console.log(colorize('=' .repeat(50), 'cyan'));
}

function printInstructions() {
  console.log('\n' + colorize('📋 Setup Instructions:', 'bright'));
  ollamaSetupInstructions.installation.forEach(instruction => {
    console.log(colorize(instruction, 'yellow'));
  });
  
  console.log('\n' + colorize('🔮 Future Image Generation:', 'bright'));
  ollamaSetupInstructions.futureImageGeneration.forEach(instruction => {
    console.log(colorize(instruction, 'blue'));
  });
}

async function checkOllamaStatus() {
  console.log('\n' + colorize('🔍 Checking Ollama Status...', 'bright'));
  
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      console.log(colorize('✅ Ollama is running!', 'green'));
      
      if (data.models && data.models.length > 0) {
        console.log(colorize(`📚 Available models (${data.models.length}):`, 'cyan'));
        data.models.forEach(model => {
          console.log(colorize(`  - ${model.name}`, 'white'));
        });
      } else {
        console.log(colorize('⚠️  No models installed. Run the setup commands above.', 'yellow'));
      }
      
      return true;
    }
  } catch (error) {
    console.log(colorize('❌ Ollama is not running or not accessible', 'red'));
    console.log(colorize('💡 Try: ollama serve', 'yellow'));
    return false;
  }
}

async function testImageGeneration() {
  console.log('\n' + colorize('🎨 Testing Image Generation...', 'bright'));
  
  const provider = new OllamaImageProvider(
    devConfig.imageProvider.ollama.baseUrl,
    devConfig.imageProvider.ollama.model
  );
  
  const testPrompts = [
    'Technology innovation in artificial intelligence',
    'Climate change and environmental sustainability',
    'Modern business meeting in corporate office',
    'Scientific research and discovery'
  ];
  
  for (const prompt of testPrompts) {
    try {
      console.log(colorize(`\n📝 Testing: "${prompt}"`, 'cyan'));
      const imageUrl = await provider.generateImage(prompt);
      console.log(colorize(`🖼️  Generated: ${imageUrl}`, 'green'));
    } catch (error) {
      console.log(colorize(`❌ Failed: ${error.message}`, 'red'));
    }
  }
}

async function testModelAvailability() {
  console.log('\n' + colorize('🔍 Testing Model Availability...', 'bright'));
  
  const provider = new OllamaImageProvider();
  
  try {
    const models = await provider.getAvailableModels();
    
    if (models.length === 0) {
      console.log(colorize('⚠️  No models found', 'yellow'));
      return;
    }
    
    const recommendedModels = devConfig.imageProvider.ollama.alternativeModels.vision;
    const availableRecommended = models.filter(model => 
      recommendedModels.some(rec => model.includes(rec.split(':')[0]))
    );
    
    if (availableRecommended.length > 0) {
      console.log(colorize(`✅ Recommended models available:`, 'green'));
      availableRecommended.forEach(model => {
        console.log(colorize(`  - ${model}`, 'white'));
      });
    } else {
      console.log(colorize(`💡 Consider installing recommended models:`, 'yellow'));
      recommendedModels.forEach(model => {
        console.log(colorize(`  - ollama pull ${model}`, 'cyan'));
      });
    }
    
  } catch (error) {
    console.log(colorize(`❌ Could not check models: ${error.message}`, 'red'));
  }
}

function printTroubleshooting() {
  console.log('\n' + colorize('🛠️  Troubleshooting:', 'bright'));
  
  Object.entries(ollamaSetupInstructions.troubleshooting).forEach(([issue, solutions]) => {
    console.log(colorize(`\n❓ ${issue}:`, 'yellow'));
    solutions.forEach(solution => {
      console.log(colorize(`  - ${solution}`, 'white'));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  printHeader();
  
  switch (command) {
    case 'setup':
    case 'instructions':
      printInstructions();
      break;
      
    case 'check':
    case 'status':
      await checkOllamaStatus();
      await testModelAvailability();
      break;
      
    case 'test':
      const isRunning = await checkOllamaStatus();
      if (isRunning) {
        await testImageGeneration();
      }
      break;
      
    case 'troubleshoot':
    case 'help':
      printTroubleshooting();
      break;
      
    default:
      console.log(colorize('\n📝 Available commands:', 'bright'));
      console.log(colorize('  setup       - Show setup instructions', 'cyan'));
      console.log(colorize('  check       - Check Ollama status and models', 'cyan'));
      console.log(colorize('  test        - Test image generation', 'cyan'));
      console.log(colorize('  troubleshoot - Show troubleshooting guide', 'cyan'));
      break;
  }
  
  console.log('\n' + colorize('✨ Happy coding!', 'magenta'));
}

main().catch(error => {
  console.error(colorize(`Error: ${error.message}`, 'red'));
  process.exit(1);
});