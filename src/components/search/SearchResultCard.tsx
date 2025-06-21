import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, Code, Type, Star } from 'lucide-react';
import type { Memory } from '../../types';
import TagList from '../memory/TagList';
import { highlightText } from '../../utils/search';

interface SearchResultCardProps {
  memory: Memory;
  query: string;
  onTagClick: (tag: string) => void;
}

const contentTypeIcons = {
  text: Type,
  markdown: FileText,
  code: Code
};

export default function SearchResultCard({ memory, query, onTagClick }: SearchResultCardProps) {
  const ContentIcon = contentTypeIcons[memory.contentType];
  
  // Create highlighted versions of title and content
  const highlightedTitle = query ? highlightText(memory.title, query) : memory.title;
  const highlightedSummary = query && memory.summary ? 
    highlightText(memory.summary, query) : memory.summary;
  
  // Create snippet from content if no summary
  const snippet = memory.summary || memory.content.substring(0, 200) + '...';
  const highlightedSnippet = query ? highlightText(snippet, query) : snippet;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                      transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Title with highlights */}
          <Link to={`/memories/${memory.id}`} className="group">
            <h3 
              className="text-xl font-semibold text-gray-900 dark:text-white 
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 
                       transition-colors"
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          </Link>
          
          {/* Relevance Score */}
          {memory.score && (
            <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              <span>{Math.round(memory.score * 100)}% match</span>
            </div>
          )}
        </div>
        
        <ContentIcon className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
      </div>
      
      {/* Content snippet with highlights */}
      <p 
        className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{ 
          __html: memory.summary ? highlightedSummary! : highlightedSnippet 
        }}
      />
      
      {/* Metadata */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mb-4">
        <span className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(memory.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {memory.metadata.readingTime} min read
        </span>
        {memory.metadata.wordCount && (
          <span>{memory.metadata.wordCount} words</span>
        )}
      </div>
      
      {/* Tags */}
      {memory.tags.length > 0 && (
        <div className="flex items-center justify-between">
          <TagList 
            tags={memory.tags} 
            size="sm" 
            className="flex-1"
          />
          
          {/* Quick tag filter */}
          <div className="flex items-center space-x-2 ml-4">
            {memory.tags.slice(0, 2).map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 
                         text-gray-600 dark:text-gray-400 hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors"
                aria-label={`Filter by ${tag}`}
              >
                +{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}