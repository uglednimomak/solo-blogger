import { NewsStory, Article, PhilosophicalSummary } from "../types.js";
import { ProviderFactory } from "./providers/ProviderFactory.js";
import { ImageProviderFactory } from "./providers/ImageProviderFactory.js";
import { PollinationsProvider } from "./providers/PollinationsProvider.js";

// Create provider instances
const researcherProvider = ProviderFactory.createResearcher();
const journalistProvider = ProviderFactory.createJournalist();
const philosopherProvider = ProviderFactory.createPhilosopher();

const imageProvider = ImageProviderFactory.createProvider(
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_PROVIDER) || process.env.IMAGE_PROVIDER || 'huggingface',
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HUGGING_FACE_API_KEY) || process.env.HUGGING_FACE_API_KEY || ''
);

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
export const generateTags = async (content: string): Promise<string[]> => {
  const prompt = `You are a tagging assistant. Based on this article context, generate exactly 3-5 relevant tags.

RULES:
- Return ONLY the tags as a comma-separated list
- No explanations, no conversational text
- Just the tags: tag1, tag2, tag3

Article context:
${content}

Tags:`;

  const result = await journalistProvider.generateText(prompt);
  // Clean up the response and split into tags
  const cleanResult = result.trim().replace(/^[\s\S]*?Tags:\s*/i, '');
  return cleanResult.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

export const generateSeoMetadata = async (content: string): Promise<{ title: string; description: string }> => {
  const promptTitle = `You are an SEO expert. Based on this article context, create ONE concise, SEO-friendly title.

RULES:
- Return ONLY the title text
- No quotes, no explanations
- Maximum 60 characters
- Make it compelling and keyword-rich

Article context:
${content}

SEO Title:`;

  const title = (await journalistProvider.generateText(promptTitle)).trim().replace(/^["']|["']$/g, '');

  const promptDescription = `You are an SEO expert. Based on this article context, create ONE compelling meta description.

RULES:
- Return ONLY the description text
- No quotes, no explanations
- 150-160 characters exactly
- Make it engaging and include key terms

Article context:
${content}

Meta Description:`;

  const description = (await journalistProvider.generateText(promptDescription)).trim().replace(/^["']|["']$/g, '');

  return { title, description };
};
