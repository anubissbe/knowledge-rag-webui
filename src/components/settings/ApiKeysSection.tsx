import React, { useState } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useUserStore, useUIStore } from '../../stores';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export function ApiKeysSection() {
  const { apiKeys = [], createApiKey, deleteApiKey } = useUserStore();
  const { addNotification } = useUIStore();
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyPermissions, setKeyPermissions] = useState<string[]>(['read']);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      addNotification({
        title: 'Error',
        message: 'Please enter a name for the API key',
        type: 'error'
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: keyName,
      key: `rag_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      permissions: keyPermissions
    };

    createApiKey(newKey);
    setShowNewKeyModal(false);
    setKeyName('');
    setKeyPermissions(['read']);
    
    addNotification({
      title: 'API Key Created',
      message: 'Your new API key has been created successfully',
      type: 'success'
    });
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      deleteApiKey(keyId);
      addNotification({
        title: 'API Key Deleted',
        message: 'The API key has been deleted',
        type: 'success'
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyKey = async (keyId: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeys(new Set([...copiedKeys, keyId]));
      setTimeout(() => {
        setCopiedKeys(prev => {
          const next = new Set(prev);
          next.delete(keyId);
          return next;
        });
      }, 2000);
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to copy API key',
        type: 'error'
      });
    }
  };

  const maskKey = (key: string) => {
    return key.substr(0, 8) + '...' + key.substr(-4);
  };

  return (
    <>
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">API Keys</h2>
          </div>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Manage API keys for external integrations and applications.
        </p>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No API keys yet</p>
            <p className="text-sm">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete API key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-1.5 bg-muted rounded text-sm font-mono">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={visibleKeys.has(apiKey.id) ? "Hide API key" : "Show API key"}
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.id, apiKey.key)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copy API key"
                  >
                    {copiedKeys.has(apiKey.id) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  {apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowNewKeyModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-card rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key Name</label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Mobile App, CLI Tool"
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="mt-2 space-y-2">
                    {['read', 'write', 'delete'].map((permission) => (
                      <label key={permission} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={keyPermissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setKeyPermissions([...keyPermissions, permission]);
                            } else {
                              setKeyPermissions(keyPermissions.filter(p => p !== permission));
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}