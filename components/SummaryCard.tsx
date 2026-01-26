import React from 'react';
import { PhilosophicalSummary } from '../types';
import { BrainCircuit, Calendar, FileText } from 'lucide-react';

interface SummaryCardProps {
  summary: PhilosophicalSummary;
  onClick: (summary: PhilosophicalSummary) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onClick }) => {
  // Format date range
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const dateRangeText = `${formatDate(summary.dateRange.start)} - ${formatDate(summary.dateRange.end)}`;
  
  return (
    <div 
      onClick={() => onClick(summary)}
      className="group cursor-pointer border-2 border-black bg-linear-to-br from-gray-50 to-white hover:from-accent/5 hover:to-accent/10 transition-all duration-300 p-6 shadow-md hover:shadow-xl flex flex-col h-full"
    >
      {/* Header Icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-black text-white rounded-full">
          <BrainCircuit size={24} />
        </div>
        <div className="text-xs font-mono uppercase tracking-wider text-gray-600">
          Philosophical Synthesis
        </div>
      </div>
      
      {/* Title */}
      <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent transition-colors leading-tight">
        {summary.title}
      </h2>
      
      {/* Date Range */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar size={16} />
        <span>{dateRangeText}</span>
      </div>
      
      {/* Content Preview */}
      <p className="text-gray-700 leading-relaxed mb-4 grow line-clamp-4">
        {summary.content.substring(0, 200)}...
      </p>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-bold text-accent">{summary.synthesis.themes.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Themes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-accent">{summary.synthesis.paradoxes.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Paradoxes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-accent">{summary.articleIds.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Articles</div>
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {summary.tags.slice(0, 4).map((tag, index) => (
          <span 
            key={index} 
            className="inline-flex items-center gap-1 text-xs bg-black text-white px-2 py-1 font-mono uppercase tracking-wider"
          >
            {tag}
          </span>
        ))}
      </div>
      
      {/* Hover Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm font-mono uppercase tracking-wider text-gray-600 group-hover:text-accent transition-colors">
          Read Full Analysis
        </span>
        <FileText size={20} className="text-gray-400 group-hover:text-accent transition-colors" />
      </div>
    </div>
  );
};
