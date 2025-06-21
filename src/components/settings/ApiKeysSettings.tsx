import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { ApiKey } from '../../types';
import { useToast } from '../../hooks/useToast';

export default function ApiKeysSettings() {
  const toast = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk-prod-1234567890abcdef1234567890abcdef',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      permissions: ['read', 'write'],
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk-dev-abcdef1234567890abcdef1234567890',
      createdAt: '2024-01-10',
      permissions: ['read'],
    },
  ]);

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [hideTimeouts, setHideTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Helper function to mask API key showing only last 4 characters
  const maskApiKey = (key: string): string => {
    if (key.length <= 4) return key;
    const lastFour = key.slice(-4);
    const prefix = key.startsWith('sk-') ? 'sk-' : '';
    const maskedLength = Math.max(8, key.length - 4 - prefix.length);
    const mask = '•'.repeat(maskedLength);
    return `${prefix}${mask}${lastFour}`;
  };

  // Auto-hide visible API keys after 30 seconds
  const toggleKeyVisibility = (keyId: string) => {
    const newShowKey = { ...showKey, [keyId]: !showKey[keyId] };
    setShowKey(newShowKey);

    // Clear existing timeout for this key
    if (hideTimeouts[keyId]) {
      clearTimeout(hideTimeouts[keyId]);
    }

    // If showing the key, set timeout to auto-hide after 30 seconds
    if (newShowKey[keyId]) {
      const timeoutId = setTimeout(() => {
        setShowKey(prev => ({ ...prev, [keyId]: false }));
        setHideTimeouts(prev => {
          const updated = { ...prev };
          delete updated[keyId];
          return updated;
        });
        toast.info('Auto-hidden', 'API key was automatically hidden for security');
      }, 30000);

      setHideTimeouts(prev => ({ ...prev, [keyId]: timeoutId }));
    } else {
      // Remove timeout tracking when manually hiding
      setHideTimeouts(prev => {
        const updated = { ...prev };
        delete updated[keyId];
        return updated;
      });
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(hideTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [hideTimeouts]);

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('Copied!', 'API key copied to clipboard');
    } catch (error) {
      toast.error('Copy failed', 'Failed to copy API key');
    }
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success('API key deleted', 'The API key has been removed');
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    setIsCreating(true);
    try {
      // API call to create new key
      // Generate a more realistic API key format
      const generateApiKey = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'sk-';
        for (let i = 0; i < 32; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: generateApiKey(),
        createdAt: new Date().toISOString().split('T')[0],
        permissions: ['read', 'write'],
      };
      
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      toast.success('API key created', `Successfully created "${newKey.name}"`);
    } catch (error) {
      toast.error('Creation failed', 'Failed to create API key. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            API Keys
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your API keys for programmatic access
          </p>
        </div>
      </div>

      {/* Create New Key Form */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Create New API Key
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Enter key name (e.g., Production API)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="API key name"
          />
          <button
            onClick={handleCreateKey}
            disabled={!newKeyName.trim() || isCreating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-busy={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Create Key
          </button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4" data-testid="api-keys-list">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {apiKey.name}
                </h4>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Created: {apiKey.createdAt}</span>
                  {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono select-all">
                    {showKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    aria-label={showKey[apiKey.id] ? 'Hide API key' : 'Show full API key'}
                    title={showKey[apiKey.id] ? 'Hide API key (auto-hides in 30s)' : 'Show full API key'}
                  >
                    {showKey[apiKey.id] ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyKey(apiKey.key)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    aria-label="Copy full API key to clipboard"
                    title="Copy full API key to clipboard"
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                {showKey[apiKey.id] && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ Security Warning:
                    </span>
                    <span className="text-yellow-700 dark:text-yellow-300 ml-1">
                      Full API key is visible. It will auto-hide in 30 seconds for security. Never share it publicly.
                    </span>
                  </div>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  {apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 
                               text-green-700 dark:text-green-400 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label={`Delete ${apiKey.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No API keys created yet. Create your first key to get started.
          </p>
        </div>
      )}
    </div>
  );
}