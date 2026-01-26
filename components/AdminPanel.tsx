import React, { useState } from 'react';
import { Command, Send, Loader2, Sparkles, Tags, FileText, Image as ImageIcon } from 'lucide-react';
import { NewsStory } from '../types';
import { runImageGenerationAgent, generateTags, generateSeoMetadata } from '../services/geminiService';

interface AdminPanelProps {
  onInjectStory: (story: NewsStory) => void;
  isProcessing: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onInjectStory, isProcessing }) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateImage = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const generatedImageUrl = await runImageGenerationAgent(topic);
      setImageUrl(generatedImageUrl);
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!context) return;
    setIsGenerating(true);
    try {
      const generatedTags = await generateTags(context);
      setTags(generatedTags.join(', '));
    } catch (error) {
      console.error("Tag generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSeo = async () => {
    if (!context) return;
    setIsGenerating(true);
    try {
      const { title, description } = await generateSeoMetadata(context);
      setSeoTitle(title);
      setSeoDescription(description);
    } catch (error) {
      console.error("SEO metadata generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !context.trim()) return;
    
    onInjectStory({ 
      topic, 
      context,
      imageUrl,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      seo: {
        title: seoTitle,
        description: seoDescription
      }
    });
    setTopic('');
    setContext('');
    setImageUrl('');
    setTags('');
    setSeoTitle('');
    setSeoDescription('');
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
    <div className="fixed bottom-6 right-6 z-200 w-full max-w-md animate-[slideUp_0.3s_ease-out]">
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

          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={handleGenerateImage} disabled={isGenerating || !topic} className="text-xs bg-gray-800 hover:bg-gray-700 p-2 rounded flex items-center justify-center gap-1 disabled:opacity-50">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />} Image
            </button>
            <button type="button" onClick={handleGenerateTags} disabled={isGenerating || !context} className="text-xs bg-gray-800 hover:bg-gray-700 p-2 rounded flex items-center justify-center gap-1 disabled:opacity-50">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Tags size={14} />} Tags
            </button>
            <button type="button" onClick={handleGenerateSeo} disabled={isGenerating || !context} className="text-xs bg-gray-800 hover:bg-gray-700 p-2 rounded flex items-center justify-center gap-1 disabled:opacity-50">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} SEO
            </button>
          </div>

          {imageUrl && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Generated Image</label>
              <img src={imageUrl} alt="Generated" className="w-full rounded" />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Tags (comma-separated)</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-accent focus:outline-none"
              placeholder="e.g. tech, ai, future"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">SEO Title</label>
            <input 
              type="text" 
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-accent focus:outline-none"
              placeholder="SEO-friendly title"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">SEO Description</label>
            <textarea 
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-accent focus:outline-none h-16"
              placeholder="Meta description for SEO"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing || isGenerating}
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
