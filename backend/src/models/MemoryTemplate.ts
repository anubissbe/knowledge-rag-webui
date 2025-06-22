export interface MemoryTemplate {
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

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  category: MemoryTemplate['category'];
  icon?: string;
  color?: string;
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
}

export interface TemplateUsage {
  templateId: string;
  memoryId: string;
  userId: string;
  usedAt: string;
}

// Default system templates
export const defaultTemplates: Omit<MemoryTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  {
    name: 'Meeting Notes',
    description: 'Structure for meeting notes with agenda, attendees, and action items',
    category: 'meeting',
    icon: '👥',
    color: '#3B82F6',
    template: {
      title: 'Meeting Notes - {{date}}',
      content: `# Meeting Notes - {{date}}

## Attendees
- 

## Agenda
1. 

## Discussion
### Topic 1


### Topic 2


## Action Items
- [ ] {{action_item}} - {{assignee}} - Due: {{due_date}}

## Next Steps


## Notes
`,
      contentType: 'markdown',
      tags: ['meeting', 'notes'],
      metadata: {
        fields: [
          { name: 'date', label: 'Meeting Date', type: 'date', required: true },
          { name: 'attendees', label: 'Attendees', type: 'textarea', placeholder: 'List meeting attendees...' },
          { name: 'action_item', label: 'Action Item', type: 'text', placeholder: 'Action item description' },
          { name: 'assignee', label: 'Assignee', type: 'text', placeholder: 'Person responsible' },
          { name: 'due_date', label: 'Due Date', type: 'date' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Learning Notes',
    description: 'Template for study materials with key concepts and questions',
    category: 'learning',
    icon: '📚',
    color: '#10B981',
    template: {
      title: 'Learning Notes: {{topic}}',
      content: `# Learning Notes: {{topic}}

## Source
**{{source_type}}:** {{source_name}}
**Date:** {{date}}

## Key Concepts
### Concept 1


### Concept 2


## Important Questions
1. 

## Summary


## Further Reading
- 

## Review Notes
`,
      contentType: 'markdown',
      tags: ['learning', 'study'],
      metadata: {
        fields: [
          { name: 'topic', label: 'Topic/Subject', type: 'text', required: true, placeholder: 'What are you learning about?' },
          { name: 'source_type', label: 'Source Type', type: 'select', options: ['Book', 'Course', 'Article', 'Video', 'Lecture', 'Other'] },
          { name: 'source_name', label: 'Source Name', type: 'text', placeholder: 'Title of book, course, etc.' },
          { name: 'date', label: 'Study Date', type: 'date', defaultValue: 'today' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Project Documentation',
    description: 'Structure for project details, requirements, and tasks',
    category: 'project',
    icon: '📋',
    color: '#8B5CF6',
    template: {
      title: 'Project: {{project_name}}',
      content: `# Project: {{project_name}}

## Overview
{{project_description}}

## Objectives
- 

## Requirements
### Functional Requirements
1. 

### Non-Functional Requirements
1. 

## Timeline
- **Start Date:** {{start_date}}
- **End Date:** {{end_date}}
- **Current Status:** {{status}}

## Team Members
- **Project Manager:** {{pm_name}}
- **Developers:** 
- **Designers:** 

## Tasks
- [ ] {{task_name}} - {{assignee}} - Due: {{due_date}}

## Resources
- 

## Notes
`,
      contentType: 'markdown',
      tags: ['project', 'documentation'],
      metadata: {
        fields: [
          { name: 'project_name', label: 'Project Name', type: 'text', required: true },
          { name: 'project_description', label: 'Project Description', type: 'textarea', placeholder: 'Brief description of the project' },
          { name: 'start_date', label: 'Start Date', type: 'date' },
          { name: 'end_date', label: 'End Date', type: 'date' },
          { name: 'status', label: 'Status', type: 'select', options: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'] },
          { name: 'pm_name', label: 'Project Manager', type: 'text' },
          { name: 'task_name', label: 'Task', type: 'text' },
          { name: 'assignee', label: 'Assignee', type: 'text' },
          { name: 'due_date', label: 'Due Date', type: 'date' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Research Notes',
    description: 'Template for research findings with sources and methodology',
    category: 'research',
    icon: '🔬',
    color: '#F59E0B',
    template: {
      title: 'Research: {{research_topic}}',
      content: `# Research: {{research_topic}}

## Research Question
{{research_question}}

## Methodology
{{methodology}}

## Sources
1. **{{source_title}}** - {{author}} ({{year}})
   - {{source_url}}
   - Key findings: 

## Findings
### Finding 1


### Finding 2


## Analysis


## Conclusions


## Future Research
- 

## References
`,
      contentType: 'markdown',
      tags: ['research', 'analysis'],
      metadata: {
        fields: [
          { name: 'research_topic', label: 'Research Topic', type: 'text', required: true },
          { name: 'research_question', label: 'Research Question', type: 'textarea', placeholder: 'What question are you trying to answer?' },
          { name: 'methodology', label: 'Methodology', type: 'textarea', placeholder: 'How will you conduct this research?' },
          { name: 'source_title', label: 'Source Title', type: 'text' },
          { name: 'author', label: 'Author', type: 'text' },
          { name: 'year', label: 'Publication Year', type: 'number' },
          { name: 'source_url', label: 'Source URL', type: 'text' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Code Snippet',
    description: 'Template for code examples with language and usage',
    category: 'code',
    icon: '💻',
    color: '#EF4444',
    template: {
      title: 'Code: {{function_name}} ({{language}})',
      content: `# {{function_name}} - {{language}}

## Description
{{description}}

## Usage
\`\`\`{{language}}
{{code_example}}
\`\`\`

## Parameters
- **{{param_name}}** ({{param_type}}): {{param_description}}

## Returns
**{{return_type}}**: {{return_description}}

## Example
\`\`\`{{language}}
{{usage_example}}
\`\`\`

## Notes
{{notes}}
`,
      contentType: 'markdown',
      tags: ['code', 'programming'],
      metadata: {
        fields: [
          { name: 'function_name', label: 'Function/Method Name', type: 'text', required: true },
          { name: 'language', label: 'Programming Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Other'] },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What does this code do?' },
          { name: 'code_example', label: 'Code Example', type: 'textarea', placeholder: 'Paste your code here...' },
          { name: 'param_name', label: 'Parameter Name', type: 'text' },
          { name: 'param_type', label: 'Parameter Type', type: 'text' },
          { name: 'param_description', label: 'Parameter Description', type: 'text' },
          { name: 'return_type', label: 'Return Type', type: 'text' },
          { name: 'return_description', label: 'Return Description', type: 'text' },
          { name: 'usage_example', label: 'Usage Example', type: 'textarea' },
          { name: 'notes', label: 'Additional Notes', type: 'textarea' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Recipe',
    description: 'Template for cooking recipes with ingredients and instructions',
    category: 'recipe',
    icon: '🍳',
    color: '#F97316',
    template: {
      title: 'Recipe: {{recipe_name}}',
      content: `# {{recipe_name}}

## Description
{{description}}

**Prep Time:** {{prep_time}} minutes  
**Cook Time:** {{cook_time}} minutes  
**Total Time:** {{total_time}} minutes  
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
`,
      contentType: 'markdown',
      tags: ['recipe', 'cooking'],
      metadata: {
        fields: [
          { name: 'recipe_name', label: 'Recipe Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the dish' },
          { name: 'prep_time', label: 'Prep Time (minutes)', type: 'number' },
          { name: 'cook_time', label: 'Cook Time (minutes)', type: 'number' },
          { name: 'total_time', label: 'Total Time (minutes)', type: 'number' },
          { name: 'servings', label: 'Servings', type: 'number' },
          { name: 'quantity', label: 'Ingredient Quantity', type: 'text' },
          { name: 'unit', label: 'Unit', type: 'select', options: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'whole'] },
          { name: 'ingredient', label: 'Ingredient', type: 'text' },
          { name: 'step_1', label: 'Step 1', type: 'textarea' },
          { name: 'step_2', label: 'Step 2', type: 'textarea' },
          { name: 'step_3', label: 'Step 3', type: 'textarea' },
          { name: 'tips', label: 'Tips & Notes', type: 'textarea' },
          { name: 'nutrition', label: 'Nutrition Info', type: 'textarea' },
          { name: 'dietary_tags', label: 'Dietary Tags', type: 'multiselect', options: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'low-carb', 'high-protein', 'quick', 'easy'] }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Book Notes',
    description: 'Template for book summaries with key takeaways and quotes',
    category: 'book',
    icon: '📖',
    color: '#84CC16',
    template: {
      title: 'Book Notes: {{book_title}}',
      content: `# Book Notes: {{book_title}}

## Book Information
- **Author:** {{author}}
- **Publication Year:** {{year}}
- **Genre:** {{genre}}
- **Pages:** {{pages}}
- **Rating:** {{rating}}/5

## Summary
{{summary}}

## Key Takeaways
1. {{takeaway_1}}
2. {{takeaway_2}}
3. {{takeaway_3}}

## Favorite Quotes
> "{{quote_1}}" - Page {{page_1}}

> "{{quote_2}}" - Page {{page_2}}

## Personal Thoughts
{{thoughts}}

## Action Items
- [ ] {{action_item}}

## Related Books
- {{related_book}}

## Notes by Chapter
### Chapter 1: {{chapter_title}}
{{chapter_notes}}
`,
      contentType: 'markdown',
      tags: ['book', 'reading', 'notes'],
      metadata: {
        fields: [
          { name: 'book_title', label: 'Book Title', type: 'text', required: true },
          { name: 'author', label: 'Author', type: 'text', required: true },
          { name: 'year', label: 'Publication Year', type: 'number' },
          { name: 'genre', label: 'Genre', type: 'select', options: ['Fiction', 'Non-fiction', 'Biography', 'History', 'Science', 'Technology', 'Business', 'Self-help', 'Philosophy', 'Other'] },
          { name: 'pages', label: 'Number of Pages', type: 'number' },
          { name: 'rating', label: 'Rating (1-5)', type: 'select', options: ['1', '2', '3', '4', '5'] },
          { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief summary of the book' },
          { name: 'takeaway_1', label: 'Key Takeaway 1', type: 'text' },
          { name: 'takeaway_2', label: 'Key Takeaway 2', type: 'text' },
          { name: 'takeaway_3', label: 'Key Takeaway 3', type: 'text' },
          { name: 'quote_1', label: 'Favorite Quote 1', type: 'textarea' },
          { name: 'page_1', label: 'Page Number', type: 'number' },
          { name: 'quote_2', label: 'Favorite Quote 2', type: 'textarea' },
          { name: 'page_2', label: 'Page Number', type: 'number' },
          { name: 'thoughts', label: 'Personal Thoughts', type: 'textarea' },
          { name: 'action_item', label: 'Action Item', type: 'text' },
          { name: 'related_book', label: 'Related Book', type: 'text' },
          { name: 'chapter_title', label: 'Chapter Title', type: 'text' },
          { name: 'chapter_notes', label: 'Chapter Notes', type: 'textarea' }
        ]
      }
    },
    isSystem: true,
  },
  {
    name: 'Personal Journal',
    description: 'Template for daily reflections, mood tracking, and activities',
    category: 'personal',
    icon: '📝',
    color: '#EC4899',
    template: {
      title: 'Journal Entry - {{date}}',
      content: `# Journal Entry - {{date}}

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
- {{activity_3}}

## Gratitude
I'm grateful for:
1. {{gratitude_1}}
2. {{gratitude_2}}
3. {{gratitude_3}}

## Goals Progress
- **Goal:** {{goal_name}} - **Progress:** {{progress}}

## Tomorrow's Focus
{{tomorrow_focus}}

## Random Thoughts
{{thoughts}}

## Learning
**Today I learned:** {{learning}}
`,
      contentType: 'markdown',
      tags: ['journal', 'personal', 'reflection'],
      metadata: {
        fields: [
          { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: 'today' },
          { name: 'mood', label: 'Mood', type: 'select', options: ['Excellent', 'Good', 'Okay', 'Not Great', 'Terrible'] },
          { name: 'mood_scale', label: 'Mood Scale (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
          { name: 'highlights', label: 'Daily Highlights', type: 'textarea' },
          { name: 'improvements', label: 'Areas for Improvement', type: 'textarea' },
          { name: 'activity_1', label: 'Activity 1', type: 'text' },
          { name: 'activity_2', label: 'Activity 2', type: 'text' },
          { name: 'activity_3', label: 'Activity 3', type: 'text' },
          { name: 'gratitude_1', label: 'Gratitude 1', type: 'text' },
          { name: 'gratitude_2', label: 'Gratitude 2', type: 'text' },
          { name: 'gratitude_3', label: 'Gratitude 3', type: 'text' },
          { name: 'goal_name', label: 'Goal', type: 'text' },
          { name: 'progress', label: 'Progress', type: 'text' },
          { name: 'tomorrow_focus', label: "Tomorrow's Focus", type: 'textarea' },
          { name: 'thoughts', label: 'Random Thoughts', type: 'textarea' },
          { name: 'learning', label: 'What I Learned', type: 'textarea' }
        ]
      }
    },
    isSystem: true,
  },
];