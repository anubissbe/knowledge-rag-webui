import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import type { Memory } from '../types';
import MemoryCard from '../components/memory/MemoryCard';
import MemoryListItem from '../components/memory/MemoryListItem';

// Mock memories for development
const mockMemories: Memory[] = [
  {
    id: '1',
    title: 'Understanding RAG Systems',
    content: 'Retrieval-Augmented Generation (RAG) is a powerful technique...',
    contentType: 'markdown',
    summary: 'An overview of Retrieval-Augmented Generation systems, their components, benefits, and implementation.',
    userId: 'user-1',
    tags: ['AI', 'RAG', 'Machine Learning', 'LLM'],
    entities: [],
    metadata: {
      wordCount: 245,
      readingTime: 2,
      language: 'en'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
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
  }
];

export default function Memories() {
  const [memories] = useState<Memory[]>(mockMemories);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(memories.flatMap(m => m.tags))
  ).sort();

  // Filter memories based on search and tags
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (memory.summary && memory.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => memory.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Memories
            </h1>
            
            <Link
              to="/memories/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Memory
            </Link>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mt-4 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`
                      px-3 py-1 text-sm rounded-full transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || selectedTags.length > 0
                ? 'No memories found matching your criteria.'
                : 'No memories yet. Create your first memory!'}
            </p>
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMemories.map(memory => (
              <MemoryListItem key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}