import type { Meta, StoryObj } from '@storybook/react';
import { MemoryCard } from './MemoryCard';
import { Memory } from '../../types';

const meta: Meta<typeof MemoryCard> = {
  title: 'Components/Memory/MemoryCard',
  component: MemoryCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A card component for displaying memory information with actions and metadata.',
      },
    },
  },
  argTypes: {
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
    onShare: { action: 'share' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MemoryCard>;

const sampleMemory: Memory = {
  id: '1',
  title: 'React Hooks Complete Guide',
  content: `# React Hooks Complete Guide

React Hooks revolutionized how we write functional components by allowing us to use state and other React features without writing a class.

## useState Hook
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect Hook
Handle side effects like API calls, subscriptions, and manual DOM updates.`,
  preview: 'React Hooks revolutionized how we write functional components by allowing us to use state and other React features without writing a class.',
  tags: ['react', 'hooks', 'javascript', 'functional-components'],
  collection: 'Development',
  entities: [
    {
      id: 'e1',
      name: 'React',
      type: 'Technology',
      properties: {},
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'e2',
      name: 'JavaScript',
      type: 'Language',
      properties: {},
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ],
  metadata: { 
    source: 'manual',
    category: 'tutorial',
    wordCount: 245,
    readingTime: 1
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T14:20:00Z',
};

export const Default: Story = {
  args: {
    memory: sampleMemory,
  },
};

export const WithoutActions: Story = {
  args: {
    memory: sampleMemory,
    onEdit: undefined,
    onDelete: undefined,
    onShare: undefined,
  },
};

export const LongTitle: Story = {
  args: {
    memory: {
      ...sampleMemory,
      title: 'This is a very long title that should be truncated when it exceeds the maximum length allowed in the card component',
    },
  },
};

export const NoTags: Story = {
  args: {
    memory: {
      ...sampleMemory,
      tags: [],
    },
  },
};

export const ManyTags: Story = {
  args: {
    memory: {
      ...sampleMemory,
      tags: ['react', 'hooks', 'javascript', 'functional-components', 'state-management', 'side-effects', 'modern-react', 'frontend'],
    },
  },
};

export const NoCollection: Story = {
  args: {
    memory: {
      ...sampleMemory,
      collection: undefined,
    },
  },
};

export const RecentMemory: Story = {
  args: {
    memory: {
      ...sampleMemory,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
  },
};

export const OldMemory: Story = {
  args: {
    memory: {
      ...sampleMemory,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
  },
};

export const ManyEntities: Story = {
  args: {
    memory: {
      ...sampleMemory,
      entities: [
        ...sampleMemory.entities!,
        {
          id: 'e3',
          name: 'useState',
          type: 'Hook',
          properties: {},
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'e4',
          name: 'useEffect',
          type: 'Hook',
          properties: {},
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'e5',
          name: 'Functional Components',
          type: 'Concept',
          properties: {},
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ],
    },
  },
};

export const Selectable: Story = {
  args: {
    memory: sampleMemory,
    selectable: true,
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    memory: sampleMemory,
    selectable: true,
    selected: true,
  },
};

// Interactive story for testing selection
export const Interactive: Story = {
  args: {
    memory: sampleMemory,
    selectable: true,
  },
  render: (args) => {
    const [selected, setSelected] = React.useState(false);
    
    return (
      <MemoryCard
        {...args}
        selected={selected}
        onSelect={() => setSelected(!selected)}
      />
    );
  },
};