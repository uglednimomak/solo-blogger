import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AdminPanel } from './components/AdminPanel';
import { TagFilter } from './components/TagFilter';
import { Article, AgentStatus, NewsStory } from './types';
import { runResearcherAgent, runJournalistAgent } from './services/geminiService';
import { dbService } from './services/db';
import { BrainCircuit, AlertTriangle } from 'lucide-react';

// Constants
const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 Hours

function App() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get('adminTech') === 'in-the-house';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  
  // Ref to track status reset timeout
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper to create URL-friendly slug
  const createSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  // Helper to safely set status with auto-reset
  const setStatusWithReset = (status: AgentStatus, delay: number) => {
    // Clear any existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    
    setAgentStatus(status);
    
    // Set new timeout to reset to IDLE
    statusTimeoutRef.current = setTimeout(() => {
      setAgentStatus(AgentStatus.IDLE);
      statusTimeoutRef.current = null;
    }, delay);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Load initial state from database (only once)
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      try {
        await dbService.waitForInit();
        const storedArticles = await dbService.getAllArticles();
        const storedTime = await dbService.getLastUpdated();
        
        if (mounted) {
          setArticles(storedArticles);
          setLastUpdated(storedTime);
        }
      } catch (e) {
        console.error("Failed to initialize DB data", e);
        if (mounted) {
          setDbError("Database initialization failed. Please reload or check console.");
        }
      } finally {
        if (mounted) {
          setIsLoadingDB(false);
        }
      }
    };
    
    initData();
    
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount
  
  // Handle slug changes separately
  useEffect(() => {
    if (slug && articles.length > 0) {
      const article = articles.find(a => createSlug(a.title) === slug);
      if (article) {
        setSelectedArticle(article);
        setPreviewArticle(null); // Clear preview when opening full article
      } else {
        setSelectedArticle(null);
      }
    } else if (!slug) {
      setSelectedArticle(null);
      setPreviewArticle(null); // Clear preview when returning to homepage
    }
  }, [slug, articles]);
  
  // Handle article selection with URL change
  const handleArticleClick = (article: Article) => {
    const articleSlug = createSlug(article.title);
    navigate(`/${articleSlug}`);
    setSelectedArticle(article);
  };
  
  // Handle close with URL reset
  const handleCloseArticle = () => {
    navigate('/');
    setSelectedArticle(null);
  };

  // Autonomous Check Loop
  useEffect(() => {
    if (isLoadingDB || dbError) return;

    const checkNeedUpdate = () => {
      const now = Date.now();
      if (!lastUpdated || (now - lastUpdated > UPDATE_INTERVAL_MS)) {
        console.log("Auto-update triggered");
        triggerFullCycle();
      }
    };

    const timer = setInterval(checkNeedUpdate, 60000); // Check every minute
    checkNeedUpdate(); // Check immediately on mount/load

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated, isLoadingDB, dbError]);

  // Derive unique tags from articles sorted by frequency
  const availableTags = useMemo(() => {
    const allTags = articles.flatMap(article => article.tags);
    const counts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).sort((a, b) => {
      const diff = counts[b] - counts[a];
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  }, [articles]);

  // Filter articles based on selection
  const filteredArticles = useMemo(() => {
    if (!selectedTag) return articles;
    return articles.filter(article => article.tags.includes(selectedTag));
  }, [articles, selectedTag]);

  const saveArticles = async (newArticles: Article[]) => {
    await dbService.saveArticles(newArticles);
    // Refresh state from DB to ensure sync
    const freshList = await dbService.getAllArticles();
    setArticles(freshList);
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
      await saveArticles(newArticles);
      
      const now = Date.now();
      await dbService.setLastUpdated(now);
      setLastUpdated(now);
      
      setStatusWithReset(AgentStatus.COMPLETE, 3000);

    } catch (error) {
      console.error(error);
      setStatusMessage("System Failure: Agents disrupted.");
      setStatusWithReset(AgentStatus.ERROR, 5000);
    }
  };

  const handleManualInject = async (story: NewsStory) => {
    if (agentStatus !== AgentStatus.IDLE) return;

    setAgentStatus(AgentStatus.WRITING);
    setStatusMessage(`Journalist Agent: Processing priority override for "${story.topic}"...`);

    try {
      const article = await runJournalistAgent(story);
      await saveArticles([article]);
      setStatusWithReset(AgentStatus.COMPLETE, 3000);
    } catch (error) {
      console.error(error);
      setStatusWithReset(AgentStatus.ERROR, 3000);
    }
  };

  if (isLoadingDB) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit size={48} className="mx-auto text-black animate-pulse mb-4" />
          <h2 className="text-xl font-serif">Initializing Neural Memory...</h2>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">System Failure</h2>
          <p className="text-gray-600 mb-6">{dbError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Reboot System
          </button>
        </div>
      </div>
    );
  }

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

        {/* Full Article View - Only on /:slug route */}
        {slug && selectedArticle && (
          <ArticleView 
            article={selectedArticle} 
            onClose={handleCloseArticle}
            isPreview={false}
          />
        )}
        
        {/* Home View - Only on / route */}
        {!slug && (
          <>
            {/* Tag Filter */}
            {articles.length > 0 && (
              <TagFilter 
                tags={availableTags} 
                selectedTag={selectedTag} 
                onSelectTag={setSelectedTag} 
              />
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

            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                {filteredArticles.map((article, index) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onClick={handleArticleClick}
                    onHoverPreview={setPreviewArticle}
                    featured={index === 0 && !selectedTag}
                  />
                ))}
              </div>
            ) : (
              articles.length > 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 font-serif italic">No stories found for "{selectedTag}".</p>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 text-accent hover:underline font-bold text-sm uppercase tracking-wider"
                  >
                    Clear Filter
                  </button>
                </div>
              )
            )}
            
            {/* Preview on Hover - Only on home */}
            {previewArticle && (
              <ArticleView 
                article={previewArticle} 
                onClose={() => setPreviewArticle(null)}
                isPreview={true}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Interface */}
      {isAdmin && (
        <AdminPanel 
          onInjectStory={handleManualInject} 
          isProcessing={agentStatus !== AgentStatus.IDLE}
        />
      )}
    </div>
  );
}

export default App;
