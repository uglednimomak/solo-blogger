import { NewsStory, Article } from "../../types";

export interface AIProvider {
  name: string;
  research(): Promise<NewsStory[]>;
  writeArticle(story: NewsStory): Promise<Article>;
}
