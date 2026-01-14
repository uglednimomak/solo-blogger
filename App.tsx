import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AdminPanel } from './components/AdminPanel';
import { Article, AgentStatus, NewsStory } from './types';
import { runResearcherAgent, runJournalistAgent } from './services/geminiService';
import { Loader2, BrainCircuit } from 'lucide-react';

// Constants
const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 Hours
const STORAGE_KEY_ARTICLES = 'zeitgeist_articles';
const STORAGE_KEY_LAST_UPDATED = 'zeitgeist_last_updated';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Check for admin param
  const isAdmin = new URLSearchParams(window.location.search).get('adminTech') === 'in-the-house';

  // Load initial state
  useEffect(() => {
    const savedArticles = localStorage.getItem(STORAGE_KEY_ARTICLES);
    const savedTime = localStorage.getItem(STORAGE_KEY_LAST_UPDATED);

    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
    if (savedTime) {
      setLastUpdated(parseInt(savedTime, 10));
    }
  }, []);

  // Autonomous Check Loop
  useEffect(() => {
    const checkNeedUpdate = () => {
      const now = Date.now();
      if (!lastUpdated || (now - lastUpdated > UPDATE_INTERVAL_MS)) {
        console.log("Auto-update triggered");
        triggerFullCycle();
      }
    };

    const timer = setInterval(checkNeedUpdate, 60000); // Check every minute
    checkNeedUpdate(); // Check immediately on mount

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated]);

  const saveArticles = (newArticles: Article[]) => {
    const updatedList = [...newArticles, ...articles].slice(0, 50); // Keep last 50
    setArticles(updatedList);
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updatedList));
  };

  const triggerFullCycle = async () => {
    if (agentStatus !== AgentStatus.IDLE) return;
    
    setAgentStatus(AgentStatus.RESEARCHING);
    setStatusMessage("Researcher Agent: Scanning global data streams...");
    
    try {
      // 1. Research
      const stories = await runResearcherAgent();
      
      setAgentStatus(AgentStatus.WRITING);
      setStatusMessage(`Journalist Agent: Analyzing ${stories.length} identified narratives...`);

      // 2. Write (Parallel)
      const newArticles: Article[] = [];
      for (const story of stories) {
        setStatusMessage(`Journalist Agent: Writing analysis for "${story.topic}"...`);
        const article = await runJournalistAgent(story);
        newArticles.push(article);
      }

      // 3. Save
      saveArticles(newArticles);
      
      const now = Date.now();
      setLastUpdated(now);
      localStorage.setItem(STORAGE_KEY_LAST_UPDATED, now.toString());
      
      setAgentStatus(AgentStatus.COMPLETE);
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 3000);

    } catch (error) {
      console.error(error);
      setAgentStatus(AgentStatus.ERROR);
      setStatusMessage("System Failure: Agents disrupted.");
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 5000);
    }
  };

  const handleManualInject = async (story: NewsStory) => {
    if (agentStatus !== AgentStatus.IDLE) return;

    setAgentStatus(AgentStatus.WRITING);
    setStatusMessage(`Journalist Agent: Processing priority override for "${story.topic}"...`);

    try {
      const article = await runJournalistAgent(story);
      saveArticles([article]);
      setAgentStatus(AgentStatus.COMPLETE);
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 3000);
    } catch (error) {
      console.error(error);
      setAgentStatus(AgentStatus.ERROR);
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-paper pb-20">
      <Header 
        lastUpdated={lastUpdated} 
        onRefresh={triggerFullCycle} 
        loading={agentStatus !== AgentStatus.IDLE}
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4">
        
        {/* Status Bar */}
        {agentStatus !== AgentStatus.IDLE && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-pulse">
            <BrainCircuit size={20} className={agentStatus === AgentStatus.ERROR ? "text-red-500" : "text-accent"} />
            <span className="font-mono text-sm">{statusMessage}</span>
          </div>
        )}

        {articles.length === 0 && agentStatus === AgentStatus.IDLE && (
          <div className="text-center py-20 opacity-50">
            <h2 className="text-2xl font-serif mb-4">No analysis available.</h2>
            <button 
              onClick={triggerFullCycle}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              Initialize Autonomous Sequence
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {articles.map((article, index) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onClick={setSelectedArticle}
              featured={index === 0}
            />
          ))}
        </div>
      </main>

      {/* Admin Interface */}
      {isAdmin && (
        <AdminPanel 
          onInjectStory={handleManualInject} 
          isProcessing={agentStatus !== AgentStatus.IDLE}
        />
      )}

      {/* Read Modal */}
      {selectedArticle && (
        <ArticleView 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
}

export default App;