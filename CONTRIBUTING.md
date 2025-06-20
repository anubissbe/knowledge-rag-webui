# Contributing to Knowledge RAG Web UI

Thank you for your interest in contributing to the Knowledge RAG Web UI project! This document provides guidelines and instructions for contributing.

## 📋 Before You Begin

1. **Check the Task Management System**: Visit http://192.168.1.24:5173/projects/9fbc487c-1b29-4f74-b235-4697cf9610e5 to see available tasks
2. **Read the Documentation**: Familiarize yourself with the project structure and design principles
3. **Set Up Your Environment**: Follow the setup instructions in README.md

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Access to the Knowledge RAG System API
- Task Management System account

### Development Setup
```bash
# Clone the repository
cd /opt/projects/projects/knowledge-rag-webui

# Load environment variables
source /opt/projects/export-secrets.sh

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📝 Development Workflow

### 1. Pick a Task
- Visit the task management system
- Choose an unassigned task with "pending" status
- Update the task status to "in_progress"
- Assign the task to yourself

### 2. Create a Branch
```bash
git checkout -b feature/task-name
# Example: git checkout -b feature/implement-memory-card
```

### 3. Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### Component Guidelines
```typescript
// Example component structure
import React from 'react';
import { cn } from '@/lib/utils';

interface MemoryCardProps {
  title: string;
  content: string;
  className?: string;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  title,
  content,
  className
}) => {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground">{content}</p>
    </div>
  );
};
```

#### State Management
- Use Zustand stores for global state
- Keep component state local when possible
- Use React Query for server state

#### API Integration
```typescript
// Use the API client service
import { ragClient } from '@/services/api';

export const useMemories = () => {
  return useQuery({
    queryKey: ['memories'],
    queryFn: () => ragClient.listDocuments(),
  });
};
```

### 4. Testing Requirements

#### Unit Tests
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { MemoryCard } from './MemoryCard';

describe('MemoryCard', () => {
  it('renders title and content', () => {
    render(<MemoryCard title="Test" content="Content" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

#### Integration Tests
- Test API integrations
- Test state management
- Test user workflows

#### E2E Tests
```typescript
// Playwright test example
import { test, expect } from '@playwright/test';

test('create new memory', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("New Memory")');
  await page.fill('input[name="title"]', 'Test Memory');
  await page.fill('textarea[name="content"]', 'Test content');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Test Memory')).toBeVisible();
});
```

### 5. Documentation
- Update README.md if adding new features
- Add JSDoc comments for public APIs
- Update TODO.md with progress
- Document any architectural decisions

### 6. Commit Guidelines

Follow conventional commits:
```
feat: add memory card component
fix: correct search filter logic
docs: update API documentation
style: format code with prettier
refactor: simplify state management
test: add memory list tests
chore: update dependencies
```

### 7. Submit for Review
1. Push your branch
2. Create a pull request
3. Update task status to "in_review"
4. Link PR in task comments

## 🧪 Testing Guidelines

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:all
```

### Test Coverage Requirements
- Minimum 80% coverage for new code
- Critical paths must have 100% coverage
- All user interactions must be tested

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── memories/       # Memory-specific components
│   └── layout/         # Layout components
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── memories/      # Memory management
│   └── search/        # Search functionality
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── stores/            # Zustand state stores
├── utils/             # Utility functions
└── types/             # TypeScript type definitions
```

## 🎨 Design System

### Colors
Use CSS variables defined in `globals.css`:
- `--primary`: Primary brand color
- `--secondary`: Secondary color
- `--destructive`: Error/delete actions
- `--muted`: Subtle backgrounds

### Components
Use Shadcn/ui components when possible:
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Spacing
Use Tailwind spacing utilities:
- `p-4`: Standard padding
- `gap-4`: Standard gap between elements
- `mt-8`: Section spacing

## 🚨 Important Rules

1. **Never commit directly to main branch**
2. **Always update task status in the management system**
3. **Write tests for all new features**
4. **Follow the design system consistently**
5. **Document breaking changes**
6. **Keep PRs focused and small**

## 🐛 Reporting Issues

1. Check existing issues in task management system
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Browser/environment details

## 💡 Suggesting Features

1. Check if feature already exists in backlog
2. Create feature request with:
   - Use case description
   - Proposed solution
   - Alternative solutions
   - Mockups if applicable

## 📞 Getting Help

- **Documentation**: Check `/docs` folder
- **Task System**: http://192.168.1.24:5173
- **API Docs**: `/opt/projects/projects/knowledge-rag-system/docs/`

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Task management system

Thank you for contributing to Knowledge RAG Web UI!