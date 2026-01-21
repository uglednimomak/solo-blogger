import React from 'react';
import { Newspaper, Zap } from 'lucide-react';

interface HeaderProps {
  lastUpdated: number | null;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, loading }) => {
  return (
    <header className="border-b-4 border-black py-6 mb-12 bg-paper sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2">
            <Newspaper size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black tracking-tighter leading-none">ZEITGEIST AI</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">The Autonomous Observer</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono text-gray-400 uppercase">Last Global Scan</div>
          <div className="font-bold text-sm">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`sm:hidden p-2 rounded-full hover:bg-gray-200 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <Zap size={20} />
        </button>
      </div>
    </header>
  );
};
