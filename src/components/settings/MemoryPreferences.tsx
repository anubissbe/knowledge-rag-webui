import React from 'react';
import { Brain, Clock, Hash, Eye, Archive } from 'lucide-react';
import { useUserStore } from '../../stores';

export function MemoryPreferences() {
  const { preferences, updatePreferences } = useUserStore();

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleSelectChange = (key: string, value: string) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Memory Preferences</h2>
      </div>
      
      <div className="space-y-6">
        {/* Default View */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Default Memory View</label>
          <select
            value={preferences.defaultView || 'grid'}
            onChange={(e) => handleSelectChange('defaultView', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
            <option value="compact">Compact View</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-3 border-t border-border pt-4">
          <label className="text-sm font-medium">Default Sort Order</label>
          <select
            value={preferences.defaultSort || 'recent'}
            onChange={(e) => handleSelectChange('defaultSort', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>

        {/* Items Per Page */}
        <div className="space-y-3 border-t border-border pt-4">
          <label className="text-sm font-medium">Items Per Page</label>
          <select
            value={preferences.itemsPerPage || '20'}
            onChange={(e) => handleSelectChange('itemsPerPage', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="10">10 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        </div>

        {/* Auto-save */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Auto-save Drafts</p>
              <p className="text-sm text-muted-foreground">
                Automatically save your work as you type
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('autoSave', !preferences.autoSave)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${preferences.autoSave ? 'bg-primary' : 'bg-muted'}
            `}
            aria-pressed={preferences.autoSave}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preferences.autoSave ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Show Tags */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Show Tags in List</p>
              <p className="text-sm text-muted-foreground">
                Display tags on memory cards
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showTags', !preferences.showTags)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${preferences.showTags !== false ? 'bg-primary' : 'bg-muted'}
            `}
            aria-pressed={preferences.showTags !== false}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preferences.showTags !== false ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Show Preview */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Show Content Preview</p>
              <p className="text-sm text-muted-foreground">
                Display content snippets in memory list
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showPreview', !preferences.showPreview)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${preferences.showPreview !== false ? 'bg-primary' : 'bg-muted'}
            `}
            aria-pressed={preferences.showPreview !== false}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preferences.showPreview !== false ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Archive Old Memories */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Auto-archive Old Memories</p>
              <p className="text-sm text-muted-foreground">
                Archive memories older than 6 months
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('autoArchive', !preferences.autoArchive)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${preferences.autoArchive ? 'bg-primary' : 'bg-muted'}
            `}
            aria-pressed={preferences.autoArchive}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preferences.autoArchive ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}