export interface NewsStory {
  topic: string;
  context: string;
}

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
  tags: string[];
  timestamp: number;
  sourceTopic: string;
  imageUrl?: string;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  WRITING = 'WRITING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
