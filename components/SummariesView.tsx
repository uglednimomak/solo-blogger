import React, { useState, useEffect } from 'react';
import { PhilosophicalSummary } from '../types';
import { SummaryCard } from './SummaryCard';
import { BrainCircuit } from 'lucide-react';
import { dbService } from '../services/db';

interface SummariesViewProps {
  onSummaryClick: (summary: PhilosophicalSummary) => void;
}

export const SummariesView: React.FC<SummariesViewProps> = ({ onSummaryClick }) => {
  const [summaries, setSummaries] = useState<PhilosophicalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSummaries();
  }, []);
  
  const loadSummaries = async () => {
    try {
      const data = await dbService.getAllSummaries();
      setSummaries(data);
    } catch (error) {
      console.error("Failed to load summaries", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit size={48} className="mx-auto text-black animate-pulse mb-4" />
          <h2 className="text-xl font-serif">Loading Philosophical Syntheses...</h2>
        </div>
      </div>
    );
  }
  
  if (summaries.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <BrainCircuit size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="font-serif text-3xl font-bold mb-4">No Philosophical Syntheses Yet</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The Philosopher Agent automatically generates meta-analyses after every 6 articles. 
              These syntheses explore overarching themes, paradoxes, and humanity's trajectory.
            </p>
            <div className="bg-white border-2 border-gray-200 p-6 text-left">
              <h3 className="font-serif text-xl font-bold mb-3">What are Philosophical Syntheses?</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Meta-analyses of recent articles</li>
                <li>• Connections between disparate narratives</li>
                <li>• Insights into the zeitgeist</li>
                <li>• Questions about humanity's evolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BrainCircuit size={48} className="text-accent" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              Philosophical Syntheses
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Meta-analyses exploring the deeper patterns, paradoxes, and implications 
            connecting our most impactful narratives.
          </p>
        </div>
        
        {/* Summaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {summaries.map((summary) => (
            <SummaryCard 
              key={summary.id} 
              summary={summary} 
              onClick={onSummaryClick}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};
