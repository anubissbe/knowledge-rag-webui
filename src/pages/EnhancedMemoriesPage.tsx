import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'
import { OnboardingWelcomeCard, useOnboardingStatus } from '@/components/onboarding/OnboardingTrigger'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { sampleMemories, sampleCollections } from '@/utils/sampleData'

export const EnhancedMemoriesPage: React.FC = () => {
  const { shouldShowWelcome } = useOnboardingStatus()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [memories, setMemories] = useState(sampleMemories)

  // Filter memories based on search and collection
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCollection = selectedCollection === 'all' || memory.collection_id === selectedCollection
    
    return matchesSearch && matchesCollection
  })

  return (
    <div className="flex-1 p-6 space-y-6" data-testid="app-container">
      {/* Welcome Card for New Users */}
      {shouldShowWelcome && (
        <div data-onboarding-welcome>
          <OnboardingWelcomeCard />
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Memories</h1>
          <p className="text-muted-foreground mt-1">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} found
          </p>
        </div>
        
        <Button data-testid="create-memory-button" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Memory
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-testid="search-input"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Filter by collection"
          >
            <option value="all">All Collections</option>
            {sampleCollections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          
          <div className="flex border border-input rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Memory List/Grid */}
      {filteredMemories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery || selectedCollection !== 'all' ? (
                <div>
                  <p className="text-lg mb-2">No memories found</p>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">No memories found</p>
                  <p className="mb-4">Create your first memory to get started</p>
                  <Button data-testid="create-first-memory-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Memory
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredMemories.map(memory => (
            <Card 
              key={memory.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              data-testid="memory-card"
            >
              <CardHeader>
                <CardTitle className="text-lg">{memory.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(memory.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3" data-testid="memory-content">
                  {memory.content.slice(0, 150)}...
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3" data-testid="memory-tags">
                  {memory.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {memory.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{memory.tags.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {sampleCollections.find(c => c.id === memory.collection_id)?.name || 'Uncategorized'}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid="edit-memory-button">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" data-testid="delete-memory-button">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredMemories.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Memories
          </Button>
        </div>
      )}
    </div>
  )
}