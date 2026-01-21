import React, { useState } from 'react';
import { Command, Send, Loader2 } from 'lucide-react';
import { NewsStory } from '../types';

interface AdminPanelProps {
  onInjectStory: (story: NewsStory) => void;
  isProcessing: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onInjectStory, isProcessing }) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !context.trim()) return;
    
    onInjectStory({ topic, context });
    setTopic('');
    setContext('');
    // Keep open to allow multiple additions or close if preferred
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all z-40 group"
      >
        <Command size={24} className="group-hover:rotate-90 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-full max-w-md animate-[slideUp_0.3s_ease-out]">
      <div className="bg-ink text-white p-6 rounded-lg shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-sm uppercase tracking-widest text-accent flex items-center gap-2">
            <Command size={14} /> Admin Override
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">Esc</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Story Topic / Headline</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-accent focus:outline-none"
              placeholder="e.g. Breakthrough in Fusion Energy"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Context / Research Notes</label>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-accent focus:outline-none h-24"
              placeholder="Provide context for the Journalist AI to analyze..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isProcessing ? 'Agent Working...' : 'Dispatch to Journalist AI'}
          </button>
        </form>
      </div>
    </div>
  );
};
