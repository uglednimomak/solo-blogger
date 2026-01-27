import React from 'react';
import { Newspaper, Zap, BrainCircuit } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface HeaderProps {
  lastUpdated: number | null;
  onRefresh: () => void;
  loading: boolean;
  onShowDemo: () => void;
}


export const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, loading, onShowDemo }) => {

  const location = useLocation();
  const isArticles = location.pathname === '/' || (!location.pathname.startsWith('/summaries') && location.pathname !== '/');
  const isSummaries = location.pathname.startsWith('/summaries');

  return (
    <header className="border-b-4 border-black py-6 mb-8 bg-paper sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-black text-white p-2">
              <Newspaper size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tighter leading-none">ZEITGEIST AI</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">The Autonomous Observer</p>
            </div>
          </Link>


          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-gray-400 uppercase">Last Global Scan</div>
              <div className="font-bold text-sm">
                {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
              </div>
            </div>

            <button
              onClick={onShowDemo}
              className="px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Zap size={14} className="fill-current" />
              Watch Demo
            </button>
          </div>


          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Refresh Agents"
          >
            <Zap size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 border-t border-gray-300 pt-3">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-mono uppercase tracking-wider transition-colors pb-1 ${isArticles
              ? 'text-black border-b-2 border-black font-bold'
              : 'text-gray-500 hover:text-black'
              }`}
          >
            <Newspaper size={16} />
            Articles
          </Link>
          <Link
            to="/summaries"
            className={`flex items-center gap-2 text-sm font-mono uppercase tracking-wider transition-colors pb-1 ${isSummaries
              ? 'text-accent border-b-2 border-accent font-bold'
              : 'text-gray-500 hover:text-accent'
              }`}
          >
            <BrainCircuit size={16} />
            Philosophical Syntheses
          </Link>
        </nav>
      </div>
    </header>
  );
};
