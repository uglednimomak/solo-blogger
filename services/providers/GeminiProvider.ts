import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIProvider } from "./BaseProvider";
import { NewsStory, Article } from "../../types";

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

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async research(): Promise<NewsStory[]> {
    console.log("🤖 Gemini Provider: Researching news stories");
    
    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
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
      console.error("Gemini Research Error:", error);
      throw new Error("Gemini research failed");
    }
  }

  async writeArticle(story: NewsStory): Promise<Article> {
    console.log(`🤖 Gemini Provider: Writing article for "${story.topic}"`);
    
    try {
      const prompt = `
        Topic: ${story.topic}
        Context: ${story.context}

        Write a deep-dive analysis article. 
        constraints:
        - NO INTRODUCTIONS OF YOURSELF. NO BIOS.
        - PURE VIEWPOINT.
        - Analyze from these angles: Moral implications, Economic impact, Human Progress/Evolution.
        - 3-4 Distinct sections.
        - Catchy, provocative title.
      `;

      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: articleSchema,
          systemInstruction: "You are a visionary Journalist AI. You write with the depth of a philosopher and the sharpness of an economist. You do not fluff. You analyze deeply."
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      return {
        id: `article-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        timestamp: Date.now(),
        sourceTopic: story.topic,
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        ...data
      };
    } catch (error) {
      console.error("Gemini Writing Error:", error);
      throw new Error("Gemini article generation failed");
    }
  }
}
