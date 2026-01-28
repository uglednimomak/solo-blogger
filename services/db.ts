import { createClient } from '@libsql/client';
import { Article, PhilosophicalSummary } from '../types.js';

// Initialize Turso client
const client = createClient({
  url: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TURSO_DATABASE_URL) || process.env.TURSO_DATABASE_URL || '',
  authToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TURSO_AUTH_TOKEN) || process.env.TURSO_AUTH_TOKEN || '',
});

let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

const initDB = async () => {
  if (isInitialized) {
    return; // Skip if already initialized
  }

  console.log("Initializing Turso database...");
  try {
    await createTables();
    isInitialized = true;
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Fatal: Could not initialize database", err);
    throw err;
  }
};

async function createTables() {
  try {
    // Single query to create all tables
    await client.batch([
      `CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        title TEXT,
        summary TEXT,
        sections TEXT,
        tags TEXT,
        timestamp INTEGER,
        sourceTopic TEXT,
        imageUrl TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS system_state (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS philosophical_summaries (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        articleIds TEXT,
        timestamp INTEGER,
        dateRangeStart INTEGER,
        dateRangeEnd INTEGER,
        tags TEXT,
        synthesis TEXT
      )`
    ], 'write');
  } catch (e) {
    console.error("Failed to create tables", e);
    throw e;
  }
}

export const dbService = {
  async waitForInit() {
    if (!initializationPromise) {
      initializationPromise = initDB();
    }
    await initializationPromise;
  },

  async getAllArticles(): Promise<Article[]> {
    await this.waitForInit();

    try {
      const result = await client.execute("SELECT * FROM articles ORDER BY timestamp DESC LIMIT 50");
      const articles: Article[] = [];

      for (const row of result.rows) {
        articles.push({
          id: row.id as string,
          title: row.title as string,
          summary: row.summary as string,
          sections: JSON.parse(row.sections as string),
          tags: JSON.parse(row.tags as string),
          timestamp: row.timestamp as number,
          sourceTopic: row.sourceTopic as string,
          imageUrl: row.imageUrl as string
        });
      }

      return articles;
    } catch (e) {
      console.error("DB Fetch Error", e);
      return [];
    }
  },

  async saveArticles(articles: Article[]) {
    await this.waitForInit();

    try {
      for (const article of articles) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO articles (id, title, summary, sections, tags, timestamp, sourceTopic, imageUrl) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            article.id,
            article.title,
            article.summary,
            JSON.stringify(article.sections),
            JSON.stringify(article.tags),
            article.timestamp,
            article.sourceTopic,
            article.imageUrl || ''
          ]
        });
      }
      console.log(`Saved ${articles.length} articles to Turso`);
    } catch (e) {
      console.error("DB Save Error", e);
      throw e;
    }
  },

  async getLastUpdated(): Promise<number | null> {
    await this.waitForInit();

    try {
      const result = await client.execute({
        sql: "SELECT value FROM system_state WHERE key = ?",
        args: ['lastUpdated']
      });

      if (result.rows.length > 0) {
        return parseInt(result.rows[0].value as string);
      }
      return null;
    } catch (e) {
      console.error("Failed to get lastUpdated", e);
      return null;
    }
  },

  async setLastUpdated(timestamp: number) {
    await this.waitForInit();

    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO system_state (key, value) VALUES (?, ?)",
        args: ['lastUpdated', timestamp.toString()]
      });
    } catch (e) {
      console.error("Failed to set lastUpdated", e);
    }
  },

  async getAllSummaries(): Promise<PhilosophicalSummary[]> {
    await this.waitForInit();

    try {
      const result = await client.execute("SELECT * FROM philosophical_summaries ORDER BY timestamp DESC LIMIT 50");
      const summaries: PhilosophicalSummary[] = [];

      for (const row of result.rows) {
        summaries.push({
          id: row.id as string,
          title: row.title as string,
          content: row.content as string,
          articleIds: JSON.parse(row.articleIds as string),
          timestamp: row.timestamp as number,
          dateRange: {
            start: row.dateRangeStart as number,
            end: row.dateRangeEnd as number
          },
          tags: JSON.parse(row.tags as string),
          synthesis: JSON.parse(row.synthesis as string)
        });
      }

      return summaries;
    } catch (e) {
      console.error("DB Fetch Summaries Error", e);
      return [];
    }
  },

  async saveSummary(summary: PhilosophicalSummary) {
    await this.waitForInit();

    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO philosophical_summaries 
              (id, title, content, articleIds, timestamp, dateRangeStart, dateRangeEnd, tags, synthesis) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          summary.id,
          summary.title,
          summary.content,
          JSON.stringify(summary.articleIds),
          summary.timestamp,
          summary.dateRange.start,
          summary.dateRange.end,
          JSON.stringify(summary.tags),
          JSON.stringify(summary.synthesis)
        ]
      });
      console.log(`Saved philosophical summary to Turso`);
    } catch (e) {
      console.error("DB Save Summary Error", e);
      throw e;
    }
  },

  async getSummaryById(id: string): Promise<PhilosophicalSummary | null> {
    await this.waitForInit();

    try {
      const result = await client.execute({
        sql: "SELECT * FROM philosophical_summaries WHERE id = ?",
        args: [id]
      });

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id as string,
          title: row.title as string,
          content: row.content as string,
          articleIds: JSON.parse(row.articleIds as string),
          timestamp: row.timestamp as number,
          dateRange: {
            start: row.dateRangeStart as number,
            end: row.dateRangeEnd as number
          },
          tags: JSON.parse(row.tags as string),
          synthesis: JSON.parse(row.synthesis as string)
        };
      }
      return null;
    } catch (e) {
      console.error("Failed to get summary by id", e);
      return null;
    }
  },

  async getArticlesSinceLastSummary(): Promise<number> {
    await this.waitForInit();

    try {
      const result = await client.execute({
        sql: "SELECT value FROM system_state WHERE key = ?",
        args: ['articlesSinceLastSummary']
      });

      if (result.rows.length > 0) {
        return parseInt(result.rows[0].value as string);
      }
      return 0;
    } catch (e) {
      console.error("Failed to get articlesSinceLastSummary", e);
      return 0;
    }
  },

  async setArticlesSinceLastSummary(count: number) {
    await this.waitForInit();

    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO system_state (key, value) VALUES (?, ?)",
        args: ['articlesSinceLastSummary', count.toString()]
      });
    } catch (e) {
      console.error("Failed to set articlesSinceLastSummary", e);
    }
  }
};
