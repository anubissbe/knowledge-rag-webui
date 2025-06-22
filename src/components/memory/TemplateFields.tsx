import { useState } from 'react';
import { Calendar, Clock, Hash, Type, List, ChevronDown } from 'lucide-react';
import type { TemplateField } from '../../services/api/memoryTemplatesApi';

interface TemplateFieldsProps {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  className?: string;
}

export default function TemplateFields({ fields, values, onChange, className = '' }: TemplateFieldsProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const handleFieldChange = (fieldName: string, value: string) => {
    onChange({
      ...values,
      [fieldName]: value,
    });
  };

  const getFieldIcon = (type: TemplateField['type']) => {
    switch (type) {
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'select':
      case 'multiselect':
        return <List className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const renderField = (field: TemplateField) => {
    const fieldValue = values[field.name] || '';
    const fieldId = `template-field-${field.name}`;

    const baseInputClasses = `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent
                            placeholder-gray-500 dark:placeholder-gray-400 transition-colors`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            className={`${baseInputClasses} resize-vertical`}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <select
              id={fieldId}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className={`${baseInputClasses} appearance-none cursor-pointer pr-10`}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              {fieldValue.split(',').filter(Boolean).map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                           bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {value.trim()}
                  <button
                    type="button"
                    onClick={() => {
                      const values = fieldValue.split(',').filter(Boolean);
                      values.splice(index, 1);
                      handleFieldChange(field.name, values.join(','));
                    }}
                    className="ml-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {field.options?.map(option => {
                const isSelected = fieldValue.split(',').includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentValues = fieldValue.split(',').filter(Boolean);
                        if (e.target.checked) {
                          currentValues.push(option);
                        } else {
                          const index = currentValues.indexOf(option);
                          if (index > -1) {
                            currentValues.splice(index, 1);
                          }
                        }
                        handleFieldChange(field.name, currentValues.join(','));
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'date':
        const today = new Date().toISOString().split('T')[0];
        return (
          <input
            id={fieldId}
            type="date"
            value={fieldValue || (field.defaultValue === 'today' ? today : field.defaultValue || '')}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case 'time':
        return (
          <input
            id={fieldId}
            type="time"
            value={fieldValue || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={fieldValue || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClasses}
          />
        );

      default: // text
        return (
          <input
            id={fieldId}
            type="text"
            value={fieldValue || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClasses}
          />
        );
    }
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Template Fields
        </h3>
        <button
          type="button"
          onClick={() => setExpandedField(expandedField ? null : 'all')}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          {expandedField ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={`template-field-${field.name}`}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {getFieldIcon(field.type)}
              <span>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            
            {renderField(field)}
            
            {field.placeholder && field.type !== 'select' && field.type !== 'multiselect' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {field.placeholder}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
          Template Preview
        </h4>
        <p className="text-sm text-purple-700 dark:text-purple-400">
          Fill in the fields above to customize your template. The placeholders in your content 
          (like <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">{'{{field_name}}'}</code>) 
          will be replaced with your values.
        </p>
      </div>
    </div>
  );
}