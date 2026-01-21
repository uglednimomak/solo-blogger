import React, { useRef } from 'react';
import { Article } from '../types';
import { ArrowRight, Clock, Tag } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  onHoverPreview?: (article: Article | null) => void;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, onHoverPreview, featured = false }) => {
  const hoverTimeoutRef = useRef<number | null>(null);
  
  const handleHoverEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      onHoverPreview?.(article);
    }, 300);
  };
  
  const handleHoverLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    onHoverPreview?.(null);
  };
  
  // Get first sentence or first 100 chars as teaser
  const teaser = article.summary.split('.')[0] + '...' || article.summary.substring(0, 100) + '...';
  
  return (
    <div 
      onClick={() => onClick(article)}
      className={`group cursor-pointer border-2 border-transparent hover:border-black transition-all duration-300 p-4 bg-white shadow-sm hover:shadow-lg flex flex-col ${featured ? 'md:col-span-2 md:flex-row gap-6' : 'h-full'}`}
    >
      <div className={`${featured ? 'md:w-1/2' : 'w-full'} mb-4 md:mb-0 overflow-hidden relative aspect-video bg-gray-100`}>
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
        />
        <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 font-mono uppercase">
          Analysis
        </div>
      </div>

      <div className={`flex flex-col ${featured ? 'md:w-1/2 justify-center' : 'flex-1'}`}>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 mb-2 font-mono">
          <Clock size={12} />
          <span>{new Date(article.timestamp).toLocaleDateString()}</span>
          <span className="text-gray-300">|</span>
          <span className="uppercase tracking-wider text-accent font-bold">{article.sourceTopic}</span>
        </div>

        <h2 className={`${featured ? 'text-4xl' : 'text-xl'} font-serif font-bold mb-3 leading-tight group-hover:text-accent transition-colors`}>
          {article.title}
        </h2>

        <p className="text-gray-600 font-sans leading-relaxed mb-4 line-clamp-2">
          {teaser}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-sm">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
          <span 
            className="flex items-center gap-1 text-sm font-bold border-b-2 border-black pb-0.5 group-hover:border-accent group-hover:text-accent transition-all"
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}
          >
            Read Full Brief <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};
          