import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star, Users } from 'lucide-react';
import { memoryTemplatesApi, type MemoryTemplate } from '../../services/api/memoryTemplatesApi';
import { useToast } from '../../hooks/useToast';
import { componentLogger } from '../../utils/logger';
import ConfirmationDialog from '../ui/ConfirmationDialog';

interface TemplateManagerProps {
  onTemplateSelect?: (template: MemoryTemplate) => void;
  showActions?: boolean;
}

// const categoryIcons: Record<string, string> = {
//   meeting: '👥',
//   learning: '📚',
//   project: '📋',
//   research: '🔬',
//   personal: '📝',
//   code: '💻',
//   recipe: '🍳',
//   book: '📖',
//   custom: '⚙️'
// };

// const categoryColors: Record<string, string> = {
//   meeting: '#3B82F6',
//   learning: '#10B981',
//   project: '#8B5CF6',
//   research: '#F59E0B',
//   personal: '#EC4899',
//   code: '#EF4444',
//   recipe: '#F97316',
//   book: '#84CC16',
//   custom: '#6B7280'
// };

export default function TemplateManager({ onTemplateSelect, showActions = true }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MemoryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [showCreateForm, setShowCreateForm] = useState(false);
  // const [editingTemplate, setEditingTemplate] = useState<MemoryTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<MemoryTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await memoryTemplatesApi.getMemoryTemplates();
      setTemplates(response.templates);
      componentLogger.info('Templates loaded', { count: response.templates.length });
    } catch (error) {
      componentLogger.error('Failed to load templates', error);
      toast.error('Failed to load templates', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCreateTemplate = async (templateData: CreateTemplateDto) => {
  //   try {
  //     const newTemplate = await memoryTemplatesApi.createTemplate(templateData);
  //     setTemplates(prev => [newTemplate, ...prev]);
  //     setShowCreateForm(false);
  //     toast.success('Template created', `"${templateData.name}" template has been created.`);
  //     componentLogger.info('Template created', { templateId: newTemplate.id, name: newTemplate.name });
  //   } catch (error) {
  //     componentLogger.error('Failed to create template', error);
  //     toast.error('Failed to create template', 'Please check your input and try again.');
  //   }
  // };

  // const handleUpdateTemplate = async (templateId: string, updates: Partial<CreateTemplateDto>) => {
  //   try {
  //     const updatedTemplate = await memoryTemplatesApi.updateTemplate(templateId, updates);
  //     setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
  //     setEditingTemplate(null);
  //     toast.success('Template updated', 'Template has been updated successfully.');
  //     componentLogger.info('Template updated', { templateId, updates });
  //   } catch (error) {
  //     componentLogger.error('Failed to update template', error);
  //     toast.error('Failed to update template', 'Please try again.');
  //   }
  // };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    
    try {
      setIsDeleting(true);
      await memoryTemplatesApi.deleteTemplate(deletingTemplate.id);
      setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
      setDeletingTemplate(null);
      toast.success('Template deleted', `"${deletingTemplate.name}" has been deleted.`);
      componentLogger.info('Template deleted', { templateId: deletingTemplate.id, name: deletingTemplate.name });
    } catch (error) {
      componentLogger.error('Failed to delete template', error);
      toast.error('Failed to delete template', 'Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTemplateUse = async (template: MemoryTemplate) => {
    try {
      await memoryTemplatesApi.useTemplate(template.id);
      onTemplateSelect?.(template);
      
      // Update local usage count
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ));
    } catch (error) {
      componentLogger.error('Failed to record template usage', error);
      // Still proceed with template selection
      onTemplateSelect?.(template);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Memory Templates
        </h2>
        {showActions && (
          <button
            onClick={() => { /* TODO: Implement create template */ }}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-purple-500 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                     shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span 
                    className="text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: `${template.color}20` }}
                  >
                    {template.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.isSystem 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {template.isSystem ? (
                      <>
                        <Star className="w-3 h-3 mr-1" />
                        System
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 mr-1" />
                        Custom
                      </>
                    )}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {template.usageCount} uses
                  </span>
                </div>
              </div>

              {/* Template Tags */}
              {template.template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.template.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs
                               bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.template.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{template.template.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTemplateUse(template)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white
                           rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                           focus:ring-purple-500 transition-colors font-medium mr-2"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Use Template
                </button>
                
                {showActions && (
                  <div className="flex items-center space-x-1">
                    {!template.isSystem && (
                      <>
                        <button
                          onClick={() => { /* TODO: Implement edit template */ }}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400
                                   hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTemplate(template)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400
                                   hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first template to get started with structured memories.
          </p>
          {showActions && (
            <button
              onClick={() => { /* TODO: Implement create template */ }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-purple-500 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}