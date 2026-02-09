import { NewsStory, Article, PhilosophicalSummary } from "../types.js";
import { ProviderFactory } from "./providers/ProviderFactory.js";
import { ImageProviderFactory } from "./providers/ImageProviderFactory.js";
import { PollinationsProvider } from "./providers/PollinationsProvider.js";

// Create provider instances
const researcherProvider = ProviderFactory.createResearcher();
const journalistProvider = ProviderFactory.createJournalist();
const philosopherProvider = ProviderFactory.createPhilosopher();

const imageProviderType = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_PROVIDER) || process.env.IMAGE_PROVIDER || 'pollinations';
const imageProviderApiKey = imageProviderType === 'gemini' || imageProviderType === 'gemini'
  ? ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || process.env.GEMINI_API_KEY || '')
  : ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_HUGGING_FACE_API_KEY) || process.env.HUGGING_FACE_API_KEY || '');

const imageProvider = ImageProviderFactory.createProvider(imageProviderType, imageProviderApiKey);

// Fallback provider (Pollinations - free, no key needed)
const fallbackImageProvider = new PollinationsProvider();

// --- Researcher Agent ---
export const runResearcherAgent = async (): Promise<NewsStory[]> => {
  return researcherProvider.research();
};

// --- Journalist Agent ---
export const runJournalistAgent = async (story: NewsStory): Promise<Article> => {
  return journalistProvider.writeArticle(story);
};

// --- Philosopher Agent ---
export const runPhilosopherAgent = async (articles: Article[]): Promise<PhilosophicalSummary> => {
  return philosopherProvider.synthesizePhilosophy(articles);
};

// --- Image Generation Agent ---
export const runImageGenerationAgent = async (prompt: string): Promise<string> => {
  try {
    return await imageProvider.generateImage(prompt);
  } catch (error) {
    console.warn('Primary image provider failed, falling back to Pollinations:', error);
    return await fallbackImageProvider.generateImage(prompt);
  }
};

// --- Tagging and SEO ---
// --- Combined Tags and SEO (Single API call to save quota) ---
export const generateTagsAndSeo = async (content: string): Promise<{ 
  tags: string[]; 
  seo: { title: string; description: string } 
}> => {
  const prompt = `You are an SEO and content tagging expert. Based on this article context, generate:
1. Exactly 3-5 relevant tags
2. An SEO-friendly title (max 60 characters)
3. A compelling meta description (150-160 characters)

RULES:
- Return ONLY valid JSON in this exact format
- No explanations, no conversational text
- Format: {"tags": ["tag1", "tag2", "tag3"], "title": "...", "description": "..."}

Article context:
${content}

JSON:`;

  const result = await journalistProvider.generateText(prompt);
  
  try {
    // Strip markdown code blocks if present
    let cleanResult = result.trim();
    const jsonMatch = cleanResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanResult = jsonMatch[1];
    }
    
    // Try to parse JSON directly
    const data = JSON.parse(cleanResult);
    return {
      tags: data.tags || [],
      seo: {
        title: data.title?.trim().replace(/^["']|["']$/g, '') || '',
        description: data.description?.trim().replace(/^["']|["']$/g, '') || ''
      }
    };
  } catch (e) {
    console.warn('Failed to parse tags/SEO JSON, using fallback:', e);
    // Fallback: extract from text
    return {
      tags: ['AI', 'Technology', 'News'],
      seo: {
        title: content.substring(0, 60),
        description: content.substring(0, 155)
      }
    };
  }
};

// Legacy functions (kept for backwards compatibility)
export const generateTags = async (content: string): Promise<string[]> => {
  const result = await generateTagsAndSeo(content);
  return result.tags;
};

export const generateSeoMetadata = async (content: string): Promise<{ title: string; description: string }> => {
  const result = await generateTagsAndSeo(content);
  return result.seo;
};
