import { useState, useEffect } from 'react';
import { Clock, GitBranch, RotateCcw, Eye, GitCompare, User, FileText } from 'lucide-react';
import { memoryVersionsApi, type MemoryVersionSummary, type MemoryVersion } from '../../services/api/memoryVersionsApi';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';
import ConfirmationDialog from '../ui/ConfirmationDialog';

interface MemoryVersionHistoryProps {
  memoryId: string;
  currentVersion?: number;
  onVersionRestore?: (version: number) => void;
  onVersionView?: (version: MemoryVersion) => void;
}

export default function MemoryVersionHistory({ 
  memoryId, 
  currentVersion, 
  onVersionRestore,
  onVersionView 
}: MemoryVersionHistoryProps) {
  const [versions, setVersions] = useState<MemoryVersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadVersions();
  }, [memoryId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await memoryVersionsApi.getMemoryVersions(memoryId);
      setVersions(response.versions);
    } catch (error) {
      logger.error('Failed to load memory versions', `memoryId: ${memoryId}`);
      toast.error('Failed to load version history', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    try {
      setIsRestoring(true);
      await memoryVersionsApi.restoreVersion(
        memoryId, 
        version, 
        `Restored from version ${version}`
      );
      
      toast.success('Version restored', `Memory restored to version ${version}`);
      onVersionRestore?.(version);
      setShowRestoreDialog(false);
      await loadVersions(); // Reload to show the new version
    } catch (error) {
      logger.error('Failed to restore version', `memoryId: ${memoryId}, version: ${version}`);
      toast.error('Failed to restore version', 'Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleViewVersion = async (version: number) => {
    try {
      const versionData = await memoryVersionsApi.getMemoryVersion(memoryId, version);
      onVersionView?.(versionData);
    } catch (error) {
      logger.error('Failed to load version details', `memoryId: ${memoryId}, version: ${version}`);
      toast.error('Failed to load version', 'Please try again.');
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'updated':
        return <GitBranch className="w-4 h-4 text-blue-500" />;
      case 'restored':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'Created';
      case 'updated':
        return 'Updated';
      case 'restored':
        return 'Restored';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Version History
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No version history available
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-4 border rounded-lg transition-colors ${
                version.version === currentVersion
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getChangeTypeIcon(version.changeType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Version {version.version}
                      </span>
                      {version.version === currentVersion && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                          Current
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getChangeTypeLabel(version.changeType)}
                      </span>
                    </div>
                    
                    {version.changeDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {version.changeDescription}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{version.createdBy}</span>
                      </div>
                      {version.changedFields.length > 0 && (
                        <div>
                          <span>Changed: {version.changedFields.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewVersion(version.version)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="View this version"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {version.version !== currentVersion && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedVersion(version.version);
                          setShowRestoreDialog(true);
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                        title="Restore to this version"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          // TODO: Implement compare functionality
                          toast.info('Compare feature coming soon');
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                        title="Compare with current"
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onConfirm={() => selectedVersion && handleRestoreVersion(selectedVersion)}
        title="Restore Version"
        message={`Are you sure you want to restore this memory to version ${selectedVersion}? This will create a new version with the restored content.`}
        confirmText="Restore"
        variant="warning"
        isLoading={isRestoring}
      />
    </div>
  );
}