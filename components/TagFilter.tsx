import React from 'react';
import { Tag, X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTag, onSelectTag }) => {
  if (tags.length === 0) return null;

  return (
    <div className="mb-10 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={14} className="text-gray-400" />
        <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Filter by Theme</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectTag(null)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 ${
            selectedTag === null
              ? 'bg-black text-white border-black'
              : 'bg-transparent text-gray-400 border-gray-200 hover:border-black hover:text-black'
          }`}
        >
          All Stories
        </button>

        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 flex items-center gap-2 ${
              selectedTag === tag
                ? 'bg-accent text-white border-accent shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'
            }`}
          >
            {tag}
            {selectedTag === tag && <X size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
};