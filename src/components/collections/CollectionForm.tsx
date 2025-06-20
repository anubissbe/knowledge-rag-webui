import React from 'react'
import { X, Folder, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { Collection, CreateCollectionDto } from '../../types'

const collectionSchema = yup.object({
  name: yup
    .string()
    .required('Collection name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: yup
    .string()
    .optional()
    .max(200, 'Description must be less than 200 characters'),
  color: yup.string().optional(),
  icon: yup.string().optional(),
  isPublic: yup.boolean().optional(),
})

interface CollectionFormProps {
  collection?: Collection
  onSubmit: (data: CreateCollectionDto) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
]

const PRESET_ICONS = [
  '📁', '📚', '💼', '🎯', '🚀', '💡', 
  '🔬', '🎨', '📊', '🛠️', '🌟', '⚡'
]

export const CollectionForm: React.FC<CollectionFormProps> = ({
  collection,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditing = !!collection

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(collectionSchema) as any,
    defaultValues: {
      name: collection?.name || '',
      description: collection?.description || '',
      color: collection?.color || PRESET_COLORS[0],
      icon: collection?.icon || '',
      isPublic: collection?.isPublic || false,
    },
  })

  const selectedColor = watch('color')
  const selectedIcon = watch('icon')

  const handleFormSubmit = async (data: CreateCollectionDto) => {
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="p-6 space-y-4">
          {/* Collection Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Collection Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
              placeholder="Enter collection name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${errors.description 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
              placeholder="Describe this collection (optional)"
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all
                    ${selectedColor === color 
                      ? 'border-gray-900 dark:border-gray-100 scale-110' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', selectedIcon === icon ? '' : icon)}
                  className={`
                    w-8 h-8 rounded-md border text-lg flex items-center justify-center transition-all
                    ${selectedIcon === icon 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                {...register('icon')}
                placeholder="Or enter custom emoji"
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={loading}
              />
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              {...register('isPublic')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Make this collection public
            </label>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</div>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedIcon || <Folder className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {watch('name') || 'Collection Name'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  0 memories
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                text-white
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}