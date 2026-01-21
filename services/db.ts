import initSqlJs from 'sql.js';
import { Article } from '../types';

let db: any = null;
const DB_STORAGE_KEY = 'zeitgeist.sqlite';
let initializationPromise: Promise<void> | null = null;

const initDB = async () => {
  console.log("Initializing SQL.js...");
  try {
    // Handle potential default export differences in some environments
    const initFunc = (initSqlJs as any).default || initSqlJs;
    
    const SQL = await initFunc({
      // Point to the WASM file on a CDN that matches the version
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.0/${file}`
    });
    
    console.log("SQL.js loaded, checking storage...");
    const saved = localStorage.getItem(DB_STORAGE_KEY);
    
    if (saved) {
      try {
        const binString = atob(saved);
        const len = binString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binString.charCodeAt(i);
        }
        db = new SQL.Database(bytes);
        console.log("Database restored from storage.");
      } catch (e) {
        console.error("Failed to restore DB, creating new:", e);
        db = new SQL.Database();
        createTables();
      }
    } else {
      db = new SQL.Database();
      createTables();
      console.log("New database created.");
    }
  } catch (err) {
    console.error("Fatal: Could not initialize database", err);
    throw err;
  }
};

function createTables() {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT,
      summary TEXT,
      sections TEXT,
      tags TEXT,
      timestamp INTEGER,
      sourceTopic TEXT,
      imageUrl TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS system_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  saveToDisk();
}

function saveToDisk() {
  if (!db) return;
  try {
    const data = db.export();
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i]);
    }
    localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
  } catch (e) {
    console.error("Failed to save DB to disk (quota exceeded?)", e);
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
    if (!db) return [];
    
    try {
      const stmt = db.prepare("SELECT * FROM articles ORDER BY timestamp DESC LIMIT 50");
      const articles: Article[] = [];
      
      while(stmt.step()) {
        const row = stmt.getAsObject();
        articles.push({
          id: row.id,
          title: row.title,
          summary: row.summary,
          sections: JSON.parse(row.sections as string),
          tags: JSON.parse(row.tags as string),
          timestamp: row.timestamp as number,
          sourceTopic: row.sourceTopic,
          imageUrl: row.imageUrl
        } as Article);
      }
      stmt.free();
      return articles;
    } catch (e) {
      console.error("DB Fetch Error", e);
      return [];
    }
  },

  async saveArticles(articles: Article[]) {
    await this.waitForInit();
    if (!db) return;
    
    try {
      db.run("BEGIN TRANSACTION");
      const stmt = db.prepare("INSERT OR REPLACE INTO articles VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      
      for (const a of articles) {
        stmt.run([
          a.id,
          a.title,
          a.summary,
          JSON.stringify(a.sections),
          JSON.stringify(a.tags),
          a.timestamp,
          a.sourceTopic,
          a.imageUrl
        ]);
      }
      stmt.free();
      db.run("COMMIT");
      saveToDisk();
    } catch (e) {
      console.error("DB Save Error", e);
      // Try to rollback if possible, or ignore
      try { db.run("ROLLBACK"); } catch {}
    }
  },

  async getLastUpdated(): Promise<number | null> {
    await this.waitForInit();
    if (!db) return null;
    
    try {
      const stmt = db.prepare("SELECT value FROM system_state WHERE key = 'last_updated'");
      let result = null;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        result = parseInt(row.value as string, 10);
      }
      stmt.free();
      return result;
    } catch (e) {
      return null;
    }
  },

  async setLastUpdated(timestamp: number) {
    await this.waitForInit();
    if (!db) return;
    try {
      db.run("INSERT OR REPLACE INTO system_state (key, value) VALUES ('last_updated', ?)", [timestamp.toString()]);
      saveToDisk();
    } catch (e) {
      console.error("DB State Save Error", e);
    }
  }
};