import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Tag } from 'lucide-react';
import type { Memory } from '../../types';

interface RelatedMemoriesProps {
  memoryIds: string[];
}

// Mock related memories for development
const mockRelatedMemories: Memory[] = [
  {
    id: '2',
    title: 'Vector Databases Explained',
    content: 'Understanding how vector databases work in RAG systems...',
    contentType: 'text',
    summary: 'Deep dive into vector databases and their role in similarity search.',
    userId: 'user-1',
    tags: ['Vector DB', 'Embeddings', 'Search'],
    entities: [],
    metadata: {
      wordCount: 350,
      readingTime: 3,
      language: 'en'
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    title: 'Implementing Semantic Search',
    content: 'How to build semantic search with embeddings...',
    contentType: 'markdown',
    summary: 'Practical guide to implementing semantic search in your applications.',
    userId: 'user-1',
    tags: ['Search', 'NLP', 'Implementation'],
    entities: [],
    metadata: {
      wordCount: 420,
      readingTime: 4,
      language: 'en'
    },
    createdAt: '2024-01-13T14:30:00Z',
    updatedAt: '2024-01-13T14:30:00Z'
  },
  {
    id: '4',
    title: 'LangChain Best Practices',
    content: 'Tips and tricks for using LangChain effectively...',
    contentType: 'text',
    summary: 'Collection of best practices when building with LangChain.',
    userId: 'user-1',
    tags: ['LangChain', 'Best Practices', 'LLM'],
    entities: [],
    metadata: {
      wordCount: 280,
      readingTime: 2,
      language: 'en'
    },
    createdAt: '2024-01-12T11:15:00Z',
    updatedAt: '2024-01-12T11:15:00Z'
  }
];

export default function RelatedMemories({ memoryIds }: RelatedMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch related memories from API
    const related = mockRelatedMemories.filter(m => memoryIds.includes(m.id));
    setMemories(related);
    setIsLoading(false);
  }, [memoryIds]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Related Memories
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related Memories
      </h2>
      
      <div className="space-y-4">
        {memories.map((memory) => (
          <Link
            key={memory.id}
            to={`/memories/${memory.id}`}
            className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors group"
          >
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 
                         dark:group-hover:text-blue-400 mb-2">
              {memory.title}
            </h3>
            
            {memory.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {memory.summary}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {memory.contentType}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {memory.tags.length > 0 && (
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  <span>{memory.tags.length} tags</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}