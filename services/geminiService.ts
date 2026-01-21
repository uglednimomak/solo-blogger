import { NewsStory, Article } from "../types";
import { ProviderFactory } from "./providers/ProviderFactory";

// Create provider instances
const researcherProvider = ProviderFactory.createResearcher();
const journalistProvider = ProviderFactory.createJournalist();

// --- Researcher Agent ---
export const runResearcherAgent = async (): Promise<NewsStory[]> => {
  return researcherProvider.research();
};

// --- Journalist Agent ---
export const runJournalistAgent = async (story: NewsStory): Promise<Article> => {
  return journalistProvider.writeArticle(story);
};
