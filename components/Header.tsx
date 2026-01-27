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


          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Last Global Scan</div>
              <div className="font-bold text-xs uppercase tracking-tight">
                {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onShowDemo}
                className="px-4 py-2 bg-black text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-accent transition-all flex items-center gap-2 font-bold"
              >
                <Zap size={12} className="fill-current" />
                Watch Demo
              </button>

              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all ${loading ? 'animate-spin' : ''}`}
                title="Refresh Agents"
              >
                <Zap size={18} />
              </button>
            </div>
          </div>
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
