import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, FileText, Code, Type, ChevronRight } from 'lucide-react';
import type { Memory } from '../../types';
import TagList from './TagList';

interface MemoryListItemProps {
  memory: Memory;
}

const contentTypeIcons = {
  text: Type,
  markdown: FileText,
  code: Code
};

export default function MemoryListItem({ memory }: MemoryListItemProps) {
  const ContentIcon = contentTypeIcons[memory.contentType];
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                      transition-shadow duration-200">
      <Link to={`/memories/${memory.id}`} className="block p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                {memory.title}
              </h3>
              <ContentIcon className="w-5 h-5 text-gray-400 ml-2" />
            </div>
            
            {memory.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {memory.summary}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {memory.metadata.readingTime} min read
                </span>
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {memory.tags.length} tags
                </span>
              </div>
              
              {memory.tags.length > 0 && (
                <div className="hidden sm:block">
                  <TagList tags={memory.tags.slice(0, 3)} size="sm" />
                </div>
              )}
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
        </div>
      </Link>
    </article>
  );
}