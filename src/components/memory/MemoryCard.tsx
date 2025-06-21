import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, FileText, Code, Type } from 'lucide-react';
import type { Memory } from '../../types';
import TagList from './TagList';

interface MemoryCardProps {
  memory: Memory;
}

const contentTypeIcons = {
  text: Type,
  markdown: FileText,
  code: Code
};

export default function MemoryCard({ memory }: MemoryCardProps) {
  const ContentIcon = contentTypeIcons[memory.contentType];
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                      transition-shadow duration-200 overflow-hidden">
      <Link to={`/memories/${memory.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {memory.title}
          </h3>
          <ContentIcon className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
        </div>
        
        {memory.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {memory.summary}
          </p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mb-4">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(memory.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {memory.metadata.readingTime} min
          </span>
        </div>
        
        {memory.tags.length > 0 && (
          <TagList tags={memory.tags} size="sm" />
        )}
      </Link>
    </article>
  );
}