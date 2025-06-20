import { type FC, useState } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import MDEditor from '@uiw/react-md-editor'
import { Save, X, Plus, Hash } from 'lucide-react'
import { type CreateMemoryDto, type UpdateMemoryDto, type Memory } from '@/types'
import { cn } from '@/lib/utils'

interface MemoryEditorProps {
  memory?: Memory
  onSave: (data: CreateMemoryDto | UpdateMemoryDto) => void
  onCancel: () => void
  isLoading?: boolean
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(1, 'Title cannot be empty'),
  content: yup.string().required('Content is required').min(1, 'Content cannot be empty'),
  tags: yup.array().of(yup.string().required()).default([]),
  collection: yup.string().default(''),
  metadata: yup.object().default({}),
})

type FormData = {
  title: string
  content: string
  tags: string[]
  collection: string
  metadata: Record<string, string | number | boolean | null>
}

export const MemoryEditor: FC<MemoryEditorProps> = ({
  memory,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [tagInput, setTagInput] = useState('')
  const [metadataKey, setMetadataKey] = useState('')
  const [metadataValue, setMetadataValue] = useState('')

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: memory?.title || '',
      content: memory?.content || '',
      tags: memory?.tags || [],
      collection: memory?.collection || '',
      metadata: memory?.metadata || {} as Record<string, string | number | boolean | null>,
    },
  })

  const tags = watch('tags') || []
  const metadata = watch('metadata') || {}

  const onSubmit = (data: FormData) => {
    // Clean up the data before saving
    const saveData: CreateMemoryDto | UpdateMemoryDto = {
      title: data.title,
      content: data.content,
      tags: data.tags.length > 0 ? data.tags : undefined,
      collection: data.collection || undefined,
      metadata: Object.keys(data.metadata).length > 0 ? data.metadata : undefined,
    }
    
    // Remove undefined fields for update operations
    if (memory) {
      Object.keys(saveData).forEach(key => {
        if (saveData[key as keyof typeof saveData] === undefined) {
          delete saveData[key as keyof typeof saveData]
        }
      })
    }
    
    onSave(saveData)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag: string) => tag !== tagToRemove))
  }

  const addMetadata = () => {
    if (metadataKey.trim() && metadataValue.trim()) {
      setValue('metadata', {
        ...metadata,
        [metadataKey.trim()]: metadataValue.trim(),
      })
      setMetadataKey('')
      setMetadataValue('')
    }
  }

  const removeMetadata = (keyToRemove: string) => {
    const newMetadata = { ...metadata }
    delete newMetadata[keyToRemove]
    setValue('metadata', newMetadata)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold">
          {memory ? 'Edit Memory' : 'New Memory'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
          <button
            type="submit"
            className={cn(
              "px-4 py-2 rounded-lg bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors flex items-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            <Save size={20} />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className={cn(
                "w-full px-4 py-2 rounded-lg border",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all",
                errors.title && "border-destructive"
              )}
              placeholder="Give your memory a title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Collection */}
          <div>
            <label htmlFor="collection" className="block text-sm font-medium mb-2">
              Collection (optional)
            </label>
            <input
              id="collection"
              type="text"
              {...register('collection')}
              className={cn(
                "w-full px-4 py-2 rounded-lg border",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all"
              )}
              placeholder="e.g., Work, Personal, Ideas..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Content
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={(value) => field.onChange(value || '')}
                  preview="edit"
                  height={400}
                  textareaProps={{
                    placeholder: 'Write your memory content here...\n\nSupports **markdown** formatting!',
                  }}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-all"
                  )}
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                    >
                      <Hash size={14} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Metadata (optional)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-all"
                  )}
                  placeholder="Key..."
                />
                <input
                  type="text"
                  value={metadataValue}
                  onChange={(e) => setMetadataValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMetadata())}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-all"
                  )}
                  placeholder="Value..."
                />
                <button
                  type="button"
                  onClick={addMetadata}
                  className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              {Object.entries(metadata).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMetadata(key)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}