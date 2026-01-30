import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIProvider } from "./BaseProvider.js";
import { NewsStory, Article, PhilosophicalSummary } from "../../types.js";

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

const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A profound, thought-provoking title for the meta-analysis." },
    content: { type: Type.STRING, description: "The main philosophical synthesis and analysis." },
    themes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 overarching philosophical themes connecting the narratives."
    },
    paradoxes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-4 paradoxes or tensions between different worldviews."
    },
    futureImplications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 future implications and questions to ponder."
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 philosophical keywords."
    }
  },
  required: ["title", "content", "themes", "paradoxes", "futureImplications", "tags"]
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

  async generateText(prompt: string): Promise<string> {
    console.log(`🤖 Gemini Provider (${this.model}): Generating text`);
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      
      if (!result.response) {
        console.error("Gemini returned no response. Full result:", JSON.stringify(result, null, 2));
        throw new Error("Gemini API returned no response - possibly blocked by safety filters");
      }
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating text with Gemini:", error);
      throw error;
    }
  }

  async research(): Promise<NewsStory[]> {
    console.log(`🤖 Gemini Provider (${this.model}): Researching news stories`);
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: `
          Find the top 3 biggest global news stories right now. 
          Focus on events with significant geopolitical, scientific, or social impact. 
          Return ONLY valid JSON in this exact format: 
          {"stories": [{"topic":"headline here","context":"brief summary here"}, ...]}
        `,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `
            You are an elite Research AI. 
            Your job is to scour the web for the most impactful news stories. 
            Ignore celebrity gossip. Focus on macro-level events. 
            Return exactly 3 stories. 
            Output ONLY valid JSON as specified.
          `
        }
      });
      
      if (!result.response) {
        console.error("Gemini research returned no response. Full result:", JSON.stringify(result, null, 2));
        throw new Error("Gemini API returned no response - possibly blocked by safety filters");
      }
      
      const response = result.response;
      let stories: NewsStory[] = [];
      // Try to parse JSON directly
      try {
        const result = JSON.parse(response.text() || '{"stories": []}');
        if (Array.isArray(result.stories)) stories = result.stories;
      } catch (e) {
        // fallback: try to extract stories from plain text
        const responseText = response.text();
        const match = responseText?.match(/\{\s*"stories"\s*:\s*\[.*\]\s*\}/s);
        if (match) {
          try {
            const result = JSON.parse(match[0]);
            if (Array.isArray(result.stories)) stories = result.stories;
          } catch { }
        }
        // fallback: try to extract numbered list stories from plain text
        if (!stories.length && responseText) {
          // Match numbered list items with bolded headlines and summaries
          const numberedRegex = /\d+\.\s+\*\*(.+?)\*\*\s+([\s\S]+?)(?=(\n\d+\.|$))/g;
          let m;
          while ((m = numberedRegex.exec(responseText)) !== null) {
            const topic = m[1].trim();
            const context = m[2].replace(/\s+/g, ' ').trim();
            stories.push({ topic, context });
          }
        }
        // fallback: try to extract lines that look like stories
        if (!stories.length && responseText) {
          const regex = /topic\s*:\s*"([^"\n]+)"[\s,\n]*context\s*:\s*"([^"\n]+)"/gi;
          let m;
          while ((m = regex.exec(responseText)) !== null) {
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

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: articleSchema,
          systemInstruction: `
            You are a visionary Journalist AI. 
            You write with the depth of a philosopher and the sharpness of an economist. 
            You do not fluff. 
            You analyze deeply.
          `
        }
      });

      if (!result.response) {
        console.error("Gemini writeArticle returned no response. Full result:", JSON.stringify(result, null, 2));
        throw new Error("Gemini API returned no response - possibly blocked by safety filters");
      }

      const data = JSON.parse(result.response.text() || '{}');
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

  async synthesizePhilosophy(articles: Article[]): Promise<PhilosophicalSummary> {
    console.log(`🤖 Gemini Provider (${this.model}): Synthesizing philosophy from ${articles.length} articles`);
    try {
      const articlesContext = articles.map(a => `
Title: ${a.title}
Summary: ${a.summary}
Tags: ${a.tags.join(', ')}
      `).join('\n---\n');

      const prompt = `
Analyze these ${articles.length} articles and create a meta-philosophical synthesis.

Articles:
${articlesContext}

Your task:
1. Identify overarching philosophical themes that connect these narratives
2. Explore paradoxes and tensions between different worldviews presented
3. Analyze what this collection reveals about humanity's current trajectory
4. Articulate future implications and deep questions to ponder

Write a profound, thought-provoking analysis that reveals the zeitgeist.
      `;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: summarySchema,
          systemInstruction: `
            You are a meta-philosopher analyzing the zeitgeist. 
            You see patterns others miss. 
            You connect disparate events into a coherent narrative about humanity's evolution.
            You write with the depth of a philosopher-historian looking back from the future.
            You are profound, not verbose. Every word matters.
          `
        }
      });

      const data = JSON.parse(response.text || '{}');

      // Calculate date range
      const timestamps = articles.map(a => a.timestamp).sort((a, b) => a - b);
      const dateRange = {
        start: timestamps[0],
        end: timestamps[timestamps.length - 1]
      };

      return {
        id: `summary-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        timestamp: Date.now(),
        articleIds: articles.map(a => a.id),
        dateRange,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        synthesis: {
          themes: data.themes || [],
          paradoxes: data.paradoxes || [],
          futureImplications: data.futureImplications || []
        }
      };
    } catch (error) {
      console.error("Gemini Philosophy Synthesis Error:", error);
      throw new Error("Gemini philosophy synthesis failed");
    }
  }
}
