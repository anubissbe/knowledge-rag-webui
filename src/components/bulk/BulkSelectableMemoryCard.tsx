import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, Code, Type, Check } from 'lucide-react';
import type { Memory } from '../../types';
import TagList from '../memory/TagList';

interface BulkSelectableMemoryCardProps {
  memory: Memory;
  isSelected: boolean;
  onToggleSelect: (memoryId: string) => void;
  isBulkMode: boolean;
}

const contentTypeIcons = {
  text: Type,
  markdown: FileText,
  code: Code
};

export default function BulkSelectableMemoryCard({ 
  memory, 
  isSelected, 
  onToggleSelect, 
  isBulkMode 
}: BulkSelectableMemoryCardProps) {
  const ContentIcon = contentTypeIcons[memory.contentType];

  const handleCardClick = (e: React.MouseEvent) => {
    if (isBulkMode) {
      e.preventDefault();
      onToggleSelect(memory.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleSelect(memory.id);
  };

  return (
    <article 
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200 overflow-hidden cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isBulkMode ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Selection Overlay */}
      {(isBulkMode || isSelected) && (
        <div className="relative">
          <div 
            className={`
              absolute top-4 left-4 z-10 w-6 h-6 rounded border-2 flex items-center justify-center
              transition-all duration-200 cursor-pointer
              ${isSelected 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400'
              }
            `}
            onClick={handleCheckboxClick}
            data-testid="bulk-checkbox"
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-6 ${isBulkMode ? 'pl-12' : ''}`}>
        <Link 
          to={`/memories/${memory.id}`} 
          className={`block ${isBulkMode ? 'pointer-events-none' : 'touch-manipulation'}`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className={`
              text-base sm:text-lg font-semibold line-clamp-2 flex-1 leading-tight
              transition-colors duration-200
              ${isSelected 
                ? 'text-blue-900 dark:text-blue-100' 
                : 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
              }
            `}>
              {memory.title}
            </h3>
            <ContentIcon className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
          </div>
          
          {memory.summary && (
            <p className={`
              text-sm mb-4 line-clamp-3 transition-colors duration-200
              ${isSelected 
                ? 'text-blue-700 dark:text-blue-200' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {memory.summary}
            </p>
          )}
          
          <div className={`
            flex flex-wrap items-center text-xs gap-x-4 gap-y-1 mb-4 
            transition-colors duration-200
            ${isSelected 
              ? 'text-blue-600 dark:text-blue-300' 
              : 'text-gray-500 dark:text-gray-400'
            }
          `}>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(memory.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {memory.metadata.readingTime} min
            </span>
            {memory.metadata.wordCount && (
              <span className="hidden sm:inline">{memory.metadata.wordCount} words</span>
            )}
          </div>
          
          {memory.tags.length > 0 && (
            <TagList 
              tags={memory.tags} 
              size="sm" 
              className={`transition-opacity duration-200 ${isSelected ? 'opacity-80' : ''}`}
            />
          )}
        </Link>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-8 h-8">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-t-8 border-l-transparent border-t-blue-600"></div>
            <Check className="absolute top-1 right-1 w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </article>
  );
}