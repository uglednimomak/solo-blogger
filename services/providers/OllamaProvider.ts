import { AIProvider } from "./BaseProvider";
import { NewsStory, Article, PhilosophicalSummary } from "../../types";

export class OllamaProvider implements AIProvider {
  name = "Ollama";
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = "http://localhost:11434", model: string = "llama3.2") {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async research(): Promise<NewsStory[]> {
    console.log(`🤖 Ollama Provider (${this.model}): Researching news stories`);
    
    try {
      const prompt = `Generate 3 current global news stories that are significant and impactful. 
      Return ONLY valid JSON in this exact format with no additional text:
      {
        "stories": [
          {"topic": "headline here", "context": "brief summary here"},
          {"topic": "headline here", "context": "brief summary here"},
          {"topic": "headline here", "context": "brief summary here"}
        ]
      }`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          format: "json"
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.response);
      return result.stories || [];
    } catch (error) {
      console.error("Ollama Research Error:", error);
      throw new Error("Ollama research failed");
    }
  }

  async generateText(prompt: string): Promise<string> {
    console.log(`🤖 Ollama Provider (${this.model}): Generating text`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Ollama Generation Error:", error);
      throw new Error("Ollama text generation failed");
    }
  }

  async writeArticle(story: NewsStory): Promise<Article> {
    console.log(`🤖 Ollama Provider (${this.model}): Writing article for "${story.topic}"`);
    
    try {
      const prompt = `Topic: ${story.topic}
Context: ${story.context}

Write a deep analytical article about this topic. Return ONLY valid JSON in this exact format with no additional text:
{
  "title": "Catchy, provocative headline",
  "summary": "2-sentence executive summary",
  "sections": [
    {"heading": "Section title", "content": "Detailed analysis paragraph"},
    {"heading": "Section title", "content": "Detailed analysis paragraph"},
    {"heading": "Section title", "content": "Detailed analysis paragraph"}
  ],
  "tags": ["keyword1", "keyword2", "keyword3"]
}

Focus on moral implications, economic impact, and human progress. Be philosophical and sharp. No fluff.`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          format: "json"
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.response);
      
      return {
        id: `article-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        timestamp: Date.now(),
        sourceTopic: story.topic,
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        ...result
      };
    } catch (error) {
      console.error("Ollama Writing Error:", error);
      throw new Error("Ollama article generation failed");
    }
  }

  async synthesizePhilosophy(articles: Article[]): Promise<PhilosophicalSummary> {
    console.log(`🤖 Ollama Provider (${this.model}): Synthesizing philosophy from ${articles.length} articles`);
    
    try {
      const articlesContext = articles.map(a => `
Title: ${a.title}
Summary: ${a.summary}
Tags: ${a.tags.join(', ')}
      `).join('\n---\n');

      const prompt = `Analyze these ${articles.length} articles and create a meta-philosophical synthesis.

Articles:
${articlesContext}

Return ONLY valid JSON in this exact format with no additional text:
{
  "title": "A profound, thought-provoking title",
  "content": "The main philosophical synthesis and deep analysis",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "paradoxes": ["paradox 1", "paradox 2"],
  "futureImplications": ["implication 1", "implication 2", "implication 3"],
  "tags": ["keyword1", "keyword2", "keyword3"]
}

Identify overarching philosophical themes, paradoxes, what this reveals about humanity's trajectory, and future implications.`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          format: "json"
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.response);
      
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
        title: result.title,
        content: result.content,
        tags: result.tags || [],
        synthesis: {
          themes: result.themes || [],
          paradoxes: result.paradoxes || [],
          futureImplications: result.futureImplications || []
        }
      };
    } catch (error) {
      console.error("Ollama Philosophy Synthesis Error:", error);
      throw new Error("Ollama philosophy synthesis failed");
    }
  }
}
