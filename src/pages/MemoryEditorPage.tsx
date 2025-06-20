import { type FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MemoryEditor } from '@/components/memory/MemoryEditor'
import { type CreateMemoryDto, type UpdateMemoryDto, type Memory } from '@/types'
// import { api } from '@/lib/api' // Will be implemented later

export const MemoryEditorPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const isEditMode = !!id

  // Mock data for now - will be replaced with API calls
  const { data: memory, isLoading: isLoadingMemory } = useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      // Mock implementation
      if (!id) return null
      return {
        id,
        title: 'Sample Memory',
        content: '# Sample Content\n\nThis is a sample memory content.',
        tags: ['sample', 'test'],
        collection: 'Default',
        metadata: { source: 'manual', priority: 'high' },
        entities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Memory
    },
    enabled: isEditMode,
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateMemoryDto) => {
      // Mock implementation - will call api.createMemory(data)
      console.log('Creating memory:', data)
      return { id: 'new-id', ...data, entities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      navigate('/memories')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateMemoryDto) => {
      // Mock implementation - will call api.updateMemory(id, data)
      console.log('Updating memory:', id, data)
      return { ...memory, ...data, updated_at: new Date().toISOString() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      navigate('/memories')
    },
  })

  const handleSave = (data: CreateMemoryDto | UpdateMemoryDto) => {
    if (isEditMode) {
      updateMutation.mutate(data as UpdateMemoryDto)
    } else {
      createMutation.mutate(data as CreateMemoryDto)
    }
  }

  const handleCancel = () => {
    navigate('/memories')
  }

  if (isEditMode && isLoadingMemory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading memory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <MemoryEditor
        memory={isEditMode ? memory! : undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}