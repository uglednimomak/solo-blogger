import React, { useState } from 'react';
import { Tag, X, ChevronDown, ChevronUp } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tagCounts?: Record<string, number>;
}

const INITIAL_TAG_LIMIT = 10;

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTag, onSelectTag, tagCounts = {} }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  
  if (tags.length === 0) return null;

  const displayedTags = showAllTags ? tags : tags.slice(0, INITIAL_TAG_LIMIT);
  const hasMoreTags = tags.length > INITIAL_TAG_LIMIT;

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

        {displayedTags.map((tag, index) => {
          const isHidden = !showAllTags && index >= INITIAL_TAG_LIMIT;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 flex items-center gap-2 ${
                selectedTag === tag
                  ? 'bg-accent text-white border-accent shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'
              } ${
                showAllTags && index >= INITIAL_TAG_LIMIT 
                  ? 'animate-[slideIn_0.3s_ease-out_forwards]' 
                  : ''
              }`}
              style={{
                animationDelay: showAllTags && index >= INITIAL_TAG_LIMIT 
                  ? `${(index - INITIAL_TAG_LIMIT) * 50}ms` 
                  : '0ms'
              }}
            >
              <span>{tag}</span>
              {tagCounts[tag] && (
                <span className={`text-[10px] font-normal ${
                  selectedTag === tag ? 'opacity-80' : 'opacity-50'
                }`}>
                  ({tagCounts[tag]})
                </span>
              )}
              {selectedTag === tag && <X size={12} />}
            </button>
          );
        })}

        {hasMoreTags && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-dashed border-gray-300 rounded-sm transition-all duration-300 flex items-center gap-2 bg-transparent text-gray-500 hover:border-accent hover:text-accent"
          >
            {showAllTags ? (
              <>
                <span>Show Less</span>
                <ChevronUp size={12} />
              </>
            ) : (
              <>
                <span>+{tags.length - INITIAL_TAG_LIMIT} More Tags</span>
                <ChevronDown size={12} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
