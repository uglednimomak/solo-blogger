import { NewsStory, Article, PhilosophicalSummary } from "../../types.js";

export interface AIProvider {
  name: string;
  research(): Promise<NewsStory[]>;
  writeArticle(story: NewsStory): Promise<Article>;
  synthesizePhilosophy(articles: Article[]): Promise<PhilosophicalSummary>;
  generateText?(prompt: string): Promise<string>;
}
