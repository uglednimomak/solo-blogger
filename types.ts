export interface NewsStory {
  topic: string;
  context: string;
  imageUrl?: string;
  tags?: string[];
  seo?: {
    title: string;
    description: string;
  };
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

export interface SummarySection {
  heading: string;
  content: string;
}

export interface PhilosophicalSummary {
  id: string;
  title: string;
  content: string;
  articleIds: string[];
  timestamp: number;
  dateRange: {
    start: number;
    end: number;
  };
  tags: string[];
  synthesis: {
    themes: string[];
    paradoxes: string[];
    futureImplications: string[];
  };
}

export enum AgentStatus {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  WRITING = 'WRITING',
  SYNTHESIZING = 'SYNTHESIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
