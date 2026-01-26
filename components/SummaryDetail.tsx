import React, { useEffect } from 'react';
import { PhilosophicalSummary, Article } from '../types';
import { X, Calendar, BrainCircuit, Lightbulb, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react';

interface SummaryDetailProps {
  summary: PhilosophicalSummary;
  articles: Article[];
  onClose: () => void;
  onArticleClick: (article: Article) => void;
}

export const SummaryDetail: React.FC<SummaryDetailProps> = ({ summary, articles, onClose, onArticleClick }) => {
  // Prevent body scroll when detail view is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Format date range
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const dateRangeText = `${formatDate(summary.dateRange.start)} - ${formatDate(summary.dateRange.end)}`;
  
  // Get the source articles
  const sourceArticles = articles.filter(a => summary.articleIds.includes(a.id));
  
  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-50 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-xl"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-4 bg-black text-white rounded-full">
              <BrainCircuit size={32} />
            </div>
            <div>
              <div className="text-sm font-mono uppercase tracking-wider text-gray-600">
                Philosophical Synthesis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar size={16} />
                <span>{dateRangeText}</span>
              </div>
            </div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
            {summary.title}
          </h1>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {summary.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 text-xs bg-black text-white px-3 py-1 font-mono uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-white border-l-4 border-accent p-6 mb-8 shadow-sm">
            <p className="text-lg leading-relaxed italic text-gray-800">
              {summary.content}
            </p>
          </div>
        </div>
        
        {/* Themes */}
        <section className="mb-12 bg-white p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={28} className="text-accent" />
            <h2 className="font-serif text-3xl font-bold">Overarching Themes</h2>
          </div>
          <ul className="space-y-4">
            {summary.synthesis.themes.map((theme, index) => (
              <li key={index} className="flex gap-4">
                <span className="text-accent font-bold text-xl shrink-0">{index + 1}.</span>
                <p className="text-lg text-gray-800 leading-relaxed">{theme}</p>
              </li>
            ))}
          </ul>
        </section>
        
        {/* Paradoxes */}
        <section className="mb-12 bg-linear-to-br from-gray-50 to-white p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle size={28} className="text-accent" />
            <h2 className="font-serif text-3xl font-bold">Paradoxes & Tensions</h2>
          </div>
          <ul className="space-y-4">
            {summary.synthesis.paradoxes.map((paradox, index) => (
              <li key={index} className="flex gap-4">
                <span className="text-accent font-bold text-xl shrink-0">⚡</span>
                <p className="text-lg text-gray-800 leading-relaxed italic">{paradox}</p>
              </li>
            ))}
          </ul>
        </section>
        
        {/* Future Implications */}
        <section className="mb-12 bg-white p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={28} className="text-accent" />
            <h2 className="font-serif text-3xl font-bold">Future Implications</h2>
          </div>
          <ul className="space-y-4">
            {summary.synthesis.futureImplications.map((implication, index) => (
              <li key={index} className="flex gap-4">
                <span className="text-accent font-bold text-xl shrink-0">→</span>
                <p className="text-lg text-gray-800 leading-relaxed">{implication}</p>
              </li>
            ))}
          </ul>
        </section>
        
        {/* Source Articles */}
        {sourceArticles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink size={28} className="text-accent" />
              <h2 className="font-serif text-3xl font-bold">Analyzed Articles</h2>
            </div>
            <p className="text-gray-600 mb-6 italic">
              This synthesis was derived from the following {sourceArticles.length} articles:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sourceArticles.map((article, index) => (
                <div 
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className="group cursor-pointer border-2 border-gray-300 hover:border-accent bg-white p-4 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="text-xs font-mono text-gray-500 mb-2">
                    Article {index + 1}
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="mt-3 text-xs text-accent font-mono uppercase tracking-wider group-hover:underline">
                    Read Full Article →
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
};
