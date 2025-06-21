import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, User, 
  Edit, Trash2, Share2, Copy, ExternalLink, 
  FileText
} from 'lucide-react';
import type { Memory } from '../types';
import { formatDistanceToNow } from '../utils/date';
import MarkdownContent from '../components/MarkdownContent';
import RelatedMemories from '../components/memory/RelatedMemories';
import EntityList from '../components/memory/EntityList';
import TagList from '../components/memory/TagList';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { useToast } from '../hooks/useToast';
import { memoryApi } from '../services/api';

// Mock data for development - DEPRECATED: Now using real API
/*
const mockMemory: Memory = {
  id: '1',
  title: 'Understanding RAG Systems',
  content: `# Understanding RAG Systems

Retrieval-Augmented Generation (RAG) is a powerful technique that combines the benefits of retrieval-based and generative AI systems.

## Key Components

1. **Document Store**: Where your knowledge base is stored
2. **Embeddings**: Vector representations of your documents
3. **Retrieval**: Finding relevant documents based on queries
4. **Generation**: Using LLMs to generate responses based on retrieved context

## Benefits

- Reduces hallucinations
- Provides source attribution
- Enables real-time knowledge updates
- Cost-effective compared to fine-tuning

## Implementation

\`\`\`python
from langchain import VectorStore, LLM

def rag_pipeline(query: str):
    # Retrieve relevant documents
    docs = vector_store.similarity_search(query, k=5)
    
    # Generate response with context
    context = "\\n".join([doc.content for doc in docs])
    response = llm.generate(f"Context: {context}\\n\\nQuery: {query}")
    
    return response
\`\`\``,
  contentType: 'markdown',
  summary: 'An overview of Retrieval-Augmented Generation systems, their components, benefits, and implementation.',
  userId: 'user-1',
  collectionId: 'tech-notes',
  tags: ['AI', 'RAG', 'Machine Learning', 'LLM', 'Knowledge Management'],
  entities: [
    {
      id: 'e1',
      name: 'RAG',
      type: 'concept',
      description: 'Retrieval-Augmented Generation',
      aliases: ['RAG System', 'Retrieval Augmented Generation'],
      properties: { category: 'AI Technology' },
      memoryIds: ['1', '2', '3']
    },
    {
      id: 'e2',
      name: 'LangChain',
      type: 'organization',
      description: 'Framework for developing LLM applications',
      aliases: [],
      properties: { website: 'https://langchain.com' },
      memoryIds: ['1']
    }
  ],
  metadata: {
    source: 'Personal Notes',
    author: 'John Doe',
    wordCount: 245,
    readingTime: 2,
    language: 'en'
  },
  relatedMemories: ['2', '3', '4'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z'
};
*/

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await memoryApi.getMemory(id);
        setMemory(data);
      } catch (error) {
        toast.error('Failed to load memory', 'The requested memory could not be found');
        navigate('/memories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemory();
  }, [id, navigate, toast]);

  const handleCopy = async () => {
    if (memory) {
      try {
        await navigator.clipboard.writeText(memory.content);
        toast.success('Copied!', 'Memory content copied to clipboard');
      } catch (error) {
        toast.error('Copy failed', 'Failed to copy content to clipboard');
      }
    }
  };

  const handleShare = () => {
    if (navigator.share && memory) {
      navigator.share({
        title: memory.title,
        text: memory.summary || memory.content.substring(0, 200),
        url: window.location.href,
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await memoryApi.deleteMemory(memory!.id);
      toast.success('Memory deleted', 'The memory has been permanently deleted');
      navigate('/memories');
    } catch (error) {
      toast.error('Delete failed', 'Failed to delete the memory. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Memory not found
        </h1>
        <Link to="/memories" className="text-blue-600 hover:text-blue-700">
          Back to memories
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/memories"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Back to memories"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Copy content"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Share memory"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <Link
                to={`/memories/${memory.id}/edit`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Edit memory"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete memory"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Memory Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {memory.title}
              </h1>
              
              {memory.summary && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {memory.summary}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <time dateTime={memory.createdAt}>
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{memory.metadata.readingTime} min read</span>
                </div>
                {memory.metadata.source && (
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{memory.metadata.source}</span>
                  </div>
                )}
                {memory.metadata.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{memory.metadata.author}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {memory.contentType === 'markdown' ? (
                <MarkdownContent content={memory.content} />
              ) : memory.contentType === 'code' ? (
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code>{memory.content}</code>
                </pre>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {memory.content}
                </div>
              )}
            </div>

            {/* Related Memories */}
            {memory.relatedMemories && memory.relatedMemories.length > 0 && (
              <RelatedMemories memoryId={memory.id} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Tags */}
            {memory.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h2>
                <TagList tags={memory.tags} />
              </div>
            )}

            {/* Entities */}
            {memory.entities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Entities
                </h2>
                <EntityList entities={memory.entities} />
              </div>
            )}

            {/* Additional Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Word Count
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {memory.metadata.wordCount.toLocaleString()} words
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Language
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {memory.metadata.language.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(memory.updatedAt))} ago
                  </dd>
                </div>
                {memory.metadata.url && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Source URL
                    </dt>
                    <dd className="text-sm">
                      <a
                        href={memory.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                      >
                        View source
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Memory"
        message={`Are you sure you want to delete "${memory?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}