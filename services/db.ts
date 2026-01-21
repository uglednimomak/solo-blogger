import { createClient } from '@libsql/client';
import { Article } from '../types';

// Initialize Turso client
const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL || '',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || '',
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
    // Single query to create both tables
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
  }
};
