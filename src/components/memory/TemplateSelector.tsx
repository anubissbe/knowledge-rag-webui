import { useState, useEffect } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import { memoryTemplatesApi, type MemoryTemplate } from '../../services/api/memoryTemplatesApi';
import { useToast } from '../../hooks/useToast';
import { componentLogger } from '../../utils/logger';

interface TemplateSelectorProps {
  onTemplateSelect: (template: MemoryTemplate) => void;
  onClose: () => void;
  isOpen: boolean;
}

const categoryIcons: Record<string, string> = {
  meeting: '👥',
  learning: '📚',
  project: '📋',
  research: '🔬',
  personal: '📝',
  code: '💻',
  recipe: '🍳',
  book: '📖',
  custom: '⚙️'
};

const categoryNames: Record<string, string> = {
  meeting: 'Meeting Notes',
  learning: 'Learning & Study',
  project: 'Project Documentation',
  research: 'Research Notes',
  personal: 'Personal Journal',
  code: 'Code Snippets',
  recipe: 'Recipes',
  book: 'Book Notes',
  custom: 'Custom Templates'
};

export default function TemplateSelector({ onTemplateSelect, onClose, isOpen }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<MemoryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await memoryTemplatesApi.getMemoryTemplates();
      setTemplates(response.templates);
      componentLogger.info('Templates loaded successfully', { count: response.templates.length });
    } catch (error) {
      componentLogger.error('Failed to load templates', error);
      toast.error('Failed to load templates', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (template: MemoryTemplate) => {
    try {
      // Record template usage
      await memoryTemplatesApi.useTemplate(template.id);
      onTemplateSelect(template);
      onClose();
    } catch (error) {
      componentLogger.error('Failed to record template usage', error);
      // Still proceed with template selection even if usage recording fails
      onTemplateSelect(template);
      onClose();
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const categories = Array.from(new Set(templates.map(t => t.category))).sort();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Choose a Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close template selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* Category Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>📁</span>
                  <span>All Templates</span>
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {templates.length}
                  </span>
                </div>
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{categoryIcons[category] || '📝'}</span>
                    <span>{categoryNames[category] || category}</span>
                    <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {templates.filter(t => t.category === category).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">No templates found</p>
                <p className="text-sm">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg
                             hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md
                             transition-all duration-200 bg-white dark:bg-gray-800
                             hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <span 
                        className="text-2xl p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        {template.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          template.isSystem 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          {template.isSystem ? 'System' : 'Custom'}
                        </span>
                        {template.template.tags.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {template.template.tags.slice(0, 2).join(', ')}
                            {template.template.tags.length > 2 && '...'}
                          </span>
                        )}
                      </div>
                      {template.usageCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Used {template.usageCount}x
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a template to get started with pre-filled content and structure.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700
                     rounded-lg transition-colors font-medium"
          >
            Start from Scratch
          </button>
        </div>
      </div>
    </div>
  );
}