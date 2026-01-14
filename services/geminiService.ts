import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NewsStory, Article } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas
const researchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "The headline or main topic of the news." },
          context: { type: Type.STRING, description: "A brief summary of the event based on search results." }
        },
        required: ["topic", "context"]
      }
    }
  },
  required: ["stories"]
};

const articleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy, SEO-friendly headline." },
    summary: { type: Type.STRING, description: "A 2-sentence executive summary." },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING, description: "Section sub-headline." },
          content: { type: Type.STRING, description: "The analysis content for this section." }
        },
        required: ["heading", "content"]
      }
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 SEO keywords."
    }
  },
  required: ["title", "summary", "sections", "tags"]
};

// --- Researcher Agent ---
export const runResearcherAgent = async (): Promise<NewsStory[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better tool use and reasoning
      contents: "Find the top 3 biggest global news stories right now. Focus on events with significant geopolitical, scientific, or social impact.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: researchSchema,
        systemInstruction: "You are an elite Research AI. Your job is to scour the web for the most impactful news stories. Ignore celebrity gossip. Focus on macro-level events. Return exactly 3 stories."
      }
    });

    const result = JSON.parse(response.text || '{"stories": []}');
    return result.stories || [];
  } catch (error) {
    console.error("Researcher Agent Error:", error);
    throw new Error("Researcher Agent failed to gather intelligence.");
  }
};

// --- Journalist Agent ---
export const runJournalistAgent = async (story: NewsStory): Promise<Article> => {
  try {
    const prompt = `
      Topic: ${story.topic}
      Context: ${story.context}

      Write a deep-dive analysis article. 
      constraints:
      - NO INTRODUCTIONS OF YOURSELF. NO BIOS.
      - PURE VIEWPOINT.
      - Analyze from these angles: Moral implications, Economic impact, Human Progress/Evolution.
      - 3 Distinct sections.
      - Catchy, provocative title.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        systemInstruction: "You are a visionary Journalist AI. You write with the depth of a philosopher and the sharpness of an economist. You do not fluff. You analyze deeply."
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sourceTopic: story.topic,
      imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`, // Placeholder as requested
      ...data
    };

  } catch (error) {
    console.error("Journalist Agent Error:", error);
    throw new Error("Journalist Agent failed to compose the article.");
  }
};
