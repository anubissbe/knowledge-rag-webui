# Memory Templates System

The Memory Templates system provides pre-defined templates for common memory types, enabling users to quickly create structured, professional memories with consistent formatting and organization.

## Overview

Memory Templates offer:
- 8 professionally designed system templates
- Dynamic form fields for template customization
- Template categories for easy browsing
- Usage analytics and popularity tracking
- Custom template creation capabilities
- Real-time placeholder replacement
- Seamless integration with memory creation workflow

## Architecture

### Backend Components

#### MemoryTemplate Model (`backend/src/models/MemoryTemplate.ts`)
```typescript
interface MemoryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'meeting' | 'learning' | 'project' | 'research' | 'personal' | 'code' | 'recipe' | 'book' | 'custom';
  icon: string;
  color: string;
  template: {
    title: string;
    content: string;
    contentType: 'text' | 'markdown' | 'code';
    tags: string[];
    metadata?: {
      fields: TemplateField[];
      structure?: string;
    };
  };
  isSystem: boolean;
  userId?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Template Fields System
```typescript
interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}
```

#### Database Service Methods (`backend/src/services/database.ts`)
- `getMemoryTemplates()` - Retrieve all available templates
- `getMemoryTemplatesByCategory()` - Filter templates by category
- `getMemoryTemplate()` - Get specific template details
- `createMemoryTemplate()` - Create custom templates
- `updateMemoryTemplate()` - Modify custom templates
- `deleteMemoryTemplate()` - Remove custom templates
- `incrementTemplateUsage()` - Track template usage
- `getTemplateStats()` - Retrieve usage analytics

#### API Endpoints (`backend/src/routes/memoryTemplates.ts`)
- `GET /api/v1/templates` - List all templates
- `GET /api/v1/templates/category/:category` - Filter by category
- `GET /api/v1/templates/:id` - Get specific template
- `POST /api/v1/templates` - Create custom template
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template
- `POST /api/v1/templates/:id/use` - Record usage
- `GET /api/v1/templates/:id/stats` - Usage statistics

### Frontend Components

#### TemplateSelector (`src/components/memory/TemplateSelector.tsx`)
Modal component for browsing and selecting templates with:
- Category-based filtering sidebar
- Template grid with visual cards
- Usage statistics display
- Search and filtering capabilities
- System vs. custom template indicators

#### TemplateFields (`src/components/memory/TemplateFields.tsx`)
Dynamic form component supporting:
- **Text Fields**: Single-line input with validation
- **Textarea Fields**: Multi-line content areas
- **Date/Time Fields**: Calendar and time pickers
- **Select Fields**: Dropdown menus with predefined options
- **Multi-select Fields**: Checkbox groups for multiple selections
- **Number Fields**: Numeric input with validation

#### TemplateManager (`src/components/memory/TemplateManager.tsx`)
Administrative interface for:
- Template overview with usage metrics
- Custom template creation and editing
- Template deletion with confirmation
- Usage analytics and popularity tracking

#### Memory Creation Integration (`src/pages/MemoryCreate.tsx`)
Enhanced memory creation with:
- "Use Template" button for template selection
- Real-time preview of processed content
- Template field form above memory content
- Automatic placeholder replacement
- Tag inheritance from templates

## Default System Templates

### 1. **👥 Meeting Notes**
**Category**: Meeting | **Color**: Blue (#3B82F6)
```markdown
# Meeting Notes - {{date}}

## Attendees
- {{attendee_name}}

## Agenda
1. {{agenda_item}}

## Discussion
### {{topic_name}}
{{discussion_notes}}

## Action Items
- [ ] {{action_item}} - {{assignee}} - Due: {{due_date}}

## Next Steps
{{next_steps}}
```

**Fields**: date, attendee_name, agenda_item, topic_name, discussion_notes, action_item, assignee, due_date, next_steps

### 2. **📚 Learning Notes**
**Category**: Learning | **Color**: Green (#10B981)
```markdown
# Learning Notes: {{topic}}

## Source
**{{source_type}}:** {{source_name}}
**Date:** {{date}}

## Key Concepts
### {{concept_name}}
{{concept_description}}

## Important Questions
1. {{question}}

## Summary
{{summary}}

## Further Reading
- {{reading_resource}}
```

**Fields**: topic (required), source_type (select), source_name, date, concept_name, concept_description, question, summary, reading_resource

### 3. **📋 Project Documentation**
**Category**: Project | **Color**: Purple (#8B5CF6)
```markdown
# Project: {{project_name}}

## Overview
{{project_description}}

## Objectives
- {{objective}}

## Requirements
### Functional Requirements
1. {{functional_requirement}}

### Non-Functional Requirements
1. {{non_functional_requirement}}

## Timeline
- **Start Date:** {{start_date}}
- **End Date:** {{end_date}}
- **Current Status:** {{status}}

## Team Members
- **Project Manager:** {{pm_name}}
- **Developers:** {{developer_names}}

## Tasks
- [ ] {{task_name}} - {{assignee}} - Due: {{due_date}}
```

**Fields**: project_name (required), project_description, objective, functional_requirement, non_functional_requirement, start_date, end_date, status (select), pm_name, developer_names, task_name, assignee, due_date

### 4. **🔬 Research Notes**
**Category**: Research | **Color**: Amber (#F59E0B)
```markdown
# Research: {{research_topic}}

## Research Question
{{research_question}}

## Methodology
{{methodology}}

## Sources
1. **{{source_title}}** - {{author}} ({{year}})
   - {{source_url}}
   - Key findings: {{key_findings}}

## Analysis
{{analysis}}

## Conclusions
{{conclusions}}

## Future Research
- {{future_research_topic}}
```

**Fields**: research_topic (required), research_question, methodology, source_title, author, year, source_url, key_findings, analysis, conclusions, future_research_topic

### 5. **📝 Personal Journal**
**Category**: Personal | **Color**: Pink (#EC4899)
```markdown
# Journal Entry - {{date}}

## Mood
**Overall Mood:** {{mood}} ({{mood_scale}}/10)

## Daily Highlights
### What went well today?
{{highlights}}

### What could have been better?
{{improvements}}

## Activities
- {{activity_1}}
- {{activity_2}}

## Gratitude
I'm grateful for:
1. {{gratitude_1}}
2. {{gratitude_2}}
3. {{gratitude_3}}

## Goals Progress
- **Goal:** {{goal_name}} - **Progress:** {{progress}}

## Tomorrow's Focus
{{tomorrow_focus}}

## Learning
**Today I learned:** {{learning}}
```

**Fields**: date (required, default: today), mood (select), mood_scale (1-10), highlights, improvements, activity_1, activity_2, gratitude_1, gratitude_2, gratitude_3, goal_name, progress, tomorrow_focus, learning

### 6. **💻 Code Snippet**
**Category**: Code | **Color**: Red (#EF4444)
```markdown
# {{function_name}} - {{language}}

## Description
{{description}}

## Usage
```{{language}}
{{code_example}}
```

## Parameters
- **{{param_name}}** ({{param_type}}): {{param_description}}

## Returns
**{{return_type}}**: {{return_description}}

## Example
```{{language}}
{{usage_example}}
```

## Notes
{{notes}}
```

**Fields**: function_name (required), language (select), description, code_example, param_name, param_type, param_description, return_type, return_description, usage_example, notes

### 7. **🍳 Recipe**
**Category**: Recipe | **Color**: Orange (#F97316)
```markdown
# {{recipe_name}}

## Description
{{description}}

**Prep Time:** {{prep_time}} minutes  
**Cook Time:** {{cook_time}} minutes  
**Servings:** {{servings}}

## Ingredients
- {{quantity}} {{unit}} {{ingredient}}

## Instructions
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

## Tips & Notes
{{tips}}

## Nutrition Info
{{nutrition}}

## Tags
{{dietary_tags}}
```

**Fields**: recipe_name (required), description, prep_time (number), cook_time (number), servings (number), quantity, unit (select), ingredient, step_1, step_2, step_3, tips, nutrition, dietary_tags (multiselect)

### 8. **📖 Book Notes**
**Category**: Book | **Color**: Lime (#84CC16)
```markdown
# Book Notes: {{book_title}}

## Book Information
- **Author:** {{author}}
- **Publication Year:** {{year}}
- **Genre:** {{genre}}
- **Rating:** {{rating}}/5

## Summary
{{summary}}

## Key Takeaways
1. {{takeaway_1}}
2. {{takeaway_2}}
3. {{takeaway_3}}

## Favorite Quotes
> "{{quote_1}}" - Page {{page_1}}

## Personal Thoughts
{{thoughts}}

## Action Items
- [ ] {{action_item}}

## Related Books
- {{related_book}}
```

**Fields**: book_title (required), author (required), year (number), genre (select), rating (1-5), summary, takeaway_1, takeaway_2, takeaway_3, quote_1, page_1, thoughts, action_item, related_book

## Placeholder System

### Placeholder Syntax
Templates use `{{field_name}}` syntax for dynamic content replacement.

### Built-in Variables
- `{{date}}` - Current date (YYYY-MM-DD)
- `{{time}}` - Current time (HH:MM)
- `{{today}}` - Formatted date string
- Custom field values from template definitions

### Processing Algorithm
1. Parse template content for placeholders
2. Match placeholders with field values
3. Replace placeholders with user input
4. Apply default values for empty fields
5. Validate required fields
6. Generate final content

## Usage Analytics

### Tracking Metrics
- **Usage Count**: Number of times template has been used
- **Last Used**: Timestamp of most recent usage
- **Popularity Ranking**: Templates sorted by usage frequency
- **Category Statistics**: Usage breakdown by template category

### Analytics API
```typescript
// Record template usage
POST /api/v1/templates/:id/use

// Get usage statistics
GET /api/v1/templates/:id/stats
// Response: { usageCount: number, lastUsed: string }
```

## Custom Templates

### Creation Process
1. User selects "Create Template" in TemplateManager
2. Fill template metadata (name, description, category)
3. Define template content with placeholders
4. Configure dynamic fields
5. Set field types and validation rules
6. Save as custom template

### Field Types Configuration
```typescript
const fieldTypes = {
  text: { validation: 'string', maxLength: 200 },
  textarea: { validation: 'string', maxLength: 5000 },
  date: { validation: 'date', format: 'YYYY-MM-DD' },
  time: { validation: 'time', format: 'HH:MM' },
  number: { validation: 'numeric', min: 0 },
  select: { validation: 'enum', options: [] },
  multiselect: { validation: 'array', options: [] }
};
```

### Template Management
- **Edit**: Modify custom templates only
- **Delete**: Remove custom templates with confirmation
- **Clone**: Duplicate existing templates as starting point
- **Share**: Export template definitions for sharing

## Integration Workflow

### Memory Creation Flow
1. User clicks "Create New Memory"
2. Optional: Click "Use Template" button
3. TemplateSelector modal opens with category filters
4. User selects desired template
5. TemplateFields component displays for customization
6. User fills dynamic fields
7. Real-time preview shows processed content
8. User can modify content further
9. Submit creates memory with processed content

### Template Selection Process
```typescript
const handleTemplateSelect = (template: MemoryTemplate) => {
  // 1. Record usage
  await memoryTemplatesApi.useTemplate(template.id);
  
  // 2. Process placeholders
  const processedContent = replacePlaceholders(
    template.template.content, 
    fieldValues
  );
  
  // 3. Update form
  setFormData({
    title: processedContent.title,
    content: processedContent.content,
    tags: [...existingTags, ...template.template.tags]
  });
};
```

## Performance Considerations

### Template Loading
- Templates cached after first load
- Category filtering performed client-side
- Lazy loading for template content
- Efficient template search and filtering

### Placeholder Processing
- Real-time processing with debounced updates
- Optimized regex for placeholder replacement
- Validation caching for repeated field checks
- Minimal re-renders during field updates

## Security

### Template Validation
- Input sanitization for all field types
- XSS prevention in template content
- SQL injection protection in API endpoints
- File upload restrictions for template imports

### Access Control
- System templates are read-only
- Custom templates owned by creator
- Template sharing with permission controls
- Administrative override capabilities

## Error Handling

### Common Scenarios
- **Template Not Found**: Graceful fallback to blank template
- **Field Validation Errors**: Inline error messages with guidance
- **Network Failures**: Offline template caching and retry logic
- **Malformed Templates**: Validation with helpful error descriptions

### User Feedback
- Loading states during template operations
- Success confirmations for template actions
- Clear error messages with recovery suggestions
- Progress indicators for bulk operations

## Testing Strategy

### Unit Tests
- Template model validation
- Placeholder replacement logic
- Field type validation
- API endpoint testing

### Integration Tests
- Template CRUD operations
- Usage tracking accuracy
- Category filtering functionality
- Memory creation with templates

### E2E Tests
- Complete template selection workflow
- Field customization and preview
- Template management operations
- Cross-browser compatibility

## Future Enhancements

### Planned Features
- **Template Import/Export**: Share templates between users
- **Template Versioning**: Track template changes over time
- **Advanced Fields**: Rich text, file upload, calculated fields
- **Template Inheritance**: Base templates with extensions
- **Collaborative Templates**: Team template libraries
- **AI-Generated Templates**: Smart template suggestions

### Performance Improvements
- **Template Compression**: Reduce storage and transfer size
- **Smart Caching**: Predictive template preloading
- **Field Optimization**: Faster field validation and processing
- **Batch Operations**: Bulk template management

This comprehensive Memory Templates system provides users with powerful tools for creating structured, professional memories while maintaining flexibility for customization and personalization.