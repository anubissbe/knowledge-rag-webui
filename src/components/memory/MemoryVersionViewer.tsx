import { useState } from 'react';
import { X, GitCompare } from 'lucide-react';
import { memoryVersionsApi, type MemoryVersion, type MemoryVersionComparison } from '../../services/api/memoryVersionsApi';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';
import MarkdownContent from '../MarkdownContent';

interface MemoryVersionViewerProps {
  memoryId: string;
  version: MemoryVersion;
  onClose: () => void;
  onCompare?: (comparison: MemoryVersionComparison) => void;
  currentVersion?: number;
}

export default function MemoryVersionViewer({ 
  memoryId, 
  version, 
  onClose, 
  onCompare, 
  currentVersion 
}: MemoryVersionViewerProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [compareWithVersion, setCompareWithVersion] = useState<number>(currentVersion || 1);
  const toast = useToast();

  const handleCompare = async () => {
    if (compareWithVersion === version.version) {
      toast.error('Cannot compare version with itself');
      return;
    }

    try {
      setIsComparing(true);
      const comparison = await memoryVersionsApi.compareVersions(
        memoryId,
        version.version,
        compareWithVersion
      );
      onCompare?.(comparison);
    } catch (error) {
      logger.error('Failed to compare versions', 
        `memoryId: ${memoryId}, fromVersion: ${version.version}, toVersion: ${compareWithVersion}`);
      toast.error('Failed to compare versions', 'Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Version {version.version}
            </h2>
            <span className={`px-2 py-1 text-xs rounded-full ${
              version.changeType === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              version.changeType === 'updated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            }`}>
              {version.changeType}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentVersion && currentVersion !== version.version && (
              <div className="flex items-center space-x-2">
                <select
                  value={compareWithVersion}
                  onChange={(e) => setCompareWithVersion(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: currentVersion }, (_, i) => i + 1)
                    .filter(v => v !== version.version)
                    .map(v => (
                      <option key={v} value={v}>Version {v}</option>
                    ))}
                </select>
                <button
                  onClick={handleCompare}
                  disabled={isComparing}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{isComparing ? 'Comparing...' : 'Compare'}</span>
                </button>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <p className="text-gray-900 dark:text-white">{formatDate(version.createdAt)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created by:</span>
              <p className="text-gray-900 dark:text-white">{version.createdBy}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Content Type:</span>
              <p className="text-gray-900 dark:text-white capitalize">{version.contentType}</p>
            </div>
          </div>
          
          {version.changeDescription && (
            <div className="mt-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
              <p className="text-gray-900 dark:text-white mt-1">{version.changeDescription}</p>
            </div>
          )}

          {version.metadata.changedFields.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">Changed fields:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {version.metadata.changedFields.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Title</h3>
              <p className="text-gray-700 dark:text-gray-300">{version.title}</p>
            </div>

            {/* Summary */}
            {version.summary && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{version.summary}</p>
              </div>
            )}

            {/* Tags */}
            {version.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {version.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                {version.contentType === 'markdown' ? (
                  <MarkdownContent content={version.content} />
                ) : (
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {version.content}
                  </pre>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Metadata</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Word Count:</span>
                  <p className="text-gray-900 dark:text-white">{version.metadata.wordCount}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Reading Time:</span>
                  <p className="text-gray-900 dark:text-white">{version.metadata.readingTime} min</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Language:</span>
                  <p className="text-gray-900 dark:text-white">{version.metadata.language}</p>
                </div>
                {version.metadata.previousVersion && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Previous Version:</span>
                    <p className="text-gray-900 dark:text-white">{version.metadata.previousVersion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}