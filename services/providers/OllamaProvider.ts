import { AIProvider } from "./BaseProvider";
import { NewsStory, Article } from "../../types";

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
}
