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
  private model: string;

  constructor(apiKey: string, model?: string) {
    if (!model) throw new Error("GEMINI_MODEL must be set in the environment");
    this.model = model;
    this.client = new GoogleGenAI({ apiKey });
  }

  async research(): Promise<NewsStory[]> {
    console.log(`🤖 Gemini Provider (${this.model}): Researching news stories`);
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: "Find the top 3 biggest global news stories right now. Focus on events with significant geopolitical, scientific, or social impact. Return ONLY valid JSON in this exact format: {\"stories\": [{\"topic\":\"headline here\",\"context\":\"brief summary here\"}, ...]}",
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are an elite Research AI. Your job is to scour the web for the most impactful news stories. Ignore celebrity gossip. Focus on macro-level events. Return exactly 3 stories. Output ONLY valid JSON as specified."
        }
      });
      let stories: NewsStory[] = [];
      // Try to parse JSON directly
      try {
        const result = JSON.parse(response.text || '{"stories": []}');
        if (Array.isArray(result.stories)) stories = result.stories;
      } catch (e) {
        // fallback: try to extract stories from plain text
        const match = response.text?.match(/\{\s*"stories"\s*:\s*\[.*\]\s*\}/s);
        if (match) {
          try {
            const result = JSON.parse(match[0]);
            if (Array.isArray(result.stories)) stories = result.stories;
          } catch {}
        }
        // fallback: try to extract numbered list stories from plain text
        if (!stories.length && response.text) {
          // Match numbered list items with bolded headlines and summaries
          const numberedRegex = /\d+\.\s+\*\*(.+?)\*\*\s+([\s\S]+?)(?=(\n\d+\.|$))/g;
          let m;
          while ((m = numberedRegex.exec(response.text)) !== null) {
            const topic = m[1].trim();
            const context = m[2].replace(/\s+/g, ' ').trim();
            stories.push({ topic, context });
          }
        }
        // fallback: try to extract lines that look like stories
        if (!stories.length && response.text) {
          const regex = /topic\s*:\s*"([^"\n]+)"[\s,\n]*context\s*:\s*"([^"\n]+)"/gi;
          let m;
          while ((m = regex.exec(response.text)) !== null) {
            stories.push({ topic: m[1], context: m[2] });
          }
        }
      }
      // Ensure we return at least 3 stories if possible
      return stories.slice(0, 3);
    } catch (error) {
      console.error("Gemini Research Error:", error);
      throw new Error("Gemini research failed");
    }
  }

  async writeArticle(story: NewsStory): Promise<Article> {
    console.log(`🤖 Gemini Provider (${this.model}): Writing article for "${story.topic}"`);
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
        model: this.model,
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
