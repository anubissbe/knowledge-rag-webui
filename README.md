# Knowledge RAG Web UI

[![CI](https://github.com/anubissbe/knowledge-rag-webui/actions/workflows/ci.yml/badge.svg)](https://github.com/anubissbe/knowledge-rag-webui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)](https://hub.docker.com/)

A modern web interface for the Knowledge RAG System, inspired by [Mem0](https://github.com/mem0ai/mem0). This application provides an intuitive way to manage memories, search through your knowledge base, organize collections, and visualize entity relationships.

## 🎯 Project Vision

Create a beautiful, user-friendly interface that makes it easy to:
- **Store Memories**: Save and organize your thoughts, documents, and knowledge
- **Search Intelligently**: Use hybrid search to find exactly what you need
- **Visualize Connections**: See how your knowledge is interconnected
- **Manage Collections**: Organize memories into meaningful groups
- **Track Insights**: Understand patterns in your knowledge base

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

### Memory List
Clean, organized view of all your memories with search and filtering capabilities.

### Knowledge Graph
Interactive visualization showing connections between entities and memories.

### Memory Editor
Rich markdown editor with live preview and metadata management.

### Collections
Organize your memories into themed collections with custom colors and icons.

</details>

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
API Gateway (Express)
    ↓
Knowledge RAG System
    ├── RAG Server (8002)
    ├── Knowledge Graph (8001)
    ├── Vector DB (8003)
    └── Unified DB (8004)
```

## ✨ Planned Features

### Core Features
- **Memory Management**
  - Create, edit, and delete memories
  - Rich text editor with markdown support
  - Metadata and tagging system
  - Version history

- **Advanced Search**
  - Hybrid search (vector + full-text)
  - Filters and faceted search
  - Search suggestions
  - Saved searches

- **Collections**
  - Organize memories into collections
  - Nested collections support
  - Sharing and collaboration
  - Collection templates

- **Knowledge Graph**
  - Interactive visualization
  - Entity relationships
  - Pattern discovery
  - Graph exploration

- **Import/Export** ✅
  - Import documents (Text, Markdown, JSON)
  - Export memories (JSON, Markdown, PDF)
  - Batch processing with progress tracking
  - Drag-and-drop file upload interface
  - Error handling and validation

### User Experience
- **Modern UI/UX**
  - Clean, minimalist design
  - Dark/light/system themes with auto-detection ✅
  - Interactive onboarding flow with guided tour ✅
  - Responsive layout
  - Keyboard shortcuts for power users ✅
  - Comprehensive user settings page ✅

- **Performance** ✅
  - Code splitting with lazy loading for optimal bundle size
  - Virtual scrolling for large datasets (1000+ items)
  - Performance monitoring and memory tracking
  - Debounced/throttled user interactions
  - Bundle analysis and optimization tools
  - Progressive loading with error boundaries

- **Bulk Operations** ✅
  - Select multiple memories for batch actions
  - Bulk delete with confirmation dialog
  - Add tags to multiple items simultaneously
  - Move selections to collections
  - Export in multiple formats (JSON, CSV, Markdown)
  - Visual selection indicators and counters

- **Accessibility** ✅
  - High contrast mode with customizable colors
  - Reduced motion preferences for sensitive users
  - Large text scaling for better readability
  - Enhanced screen reader support with live regions
  - Comprehensive keyboard navigation with help
  - Customizable focus indicators (default/enhanced/high-contrast)
  - System preference auto-detection
  - Skip-to-main-content links

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management  
- **Yup** - Schema validation
- **@uiw/react-md-editor** - Markdown editing
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Lucide React** - Icons
- **D3.js** - Knowledge graph visualization

### Backend Integration
- **MCP Servers** - Model Context Protocol integration
  - RAG Server (8002) - Memory storage and retrieval
  - Knowledge Graph (8001) - Entity extraction and relationships
  - Vector DB (8003) - Semantic search capabilities
  - Unified DB (8004) - Cross-database operations
- **JSON-RPC** - Communication protocol
- **WebSocket** - Real-time updates with Socket.IO ✅
  - Live memory synchronization
  - Collection updates
  - Knowledge graph real-time changes
  - User presence tracking
- **PostgreSQL** - Data persistence
- **Redis** - Caching layer

### Development Tools
- **Jest** - Unit testing ✅
- **Playwright** - E2E testing ✅  
- **ESLint** - Code quality ✅
- **TypeScript** - Type safety ✅
- **Bundle Analyzer** - Performance optimization ✅
- **Performance Monitoring** - Real-time metrics ✅

## 📋 Project Status

**Current Phase**: Core Feature Development ✅

**Total Tasks**: 30
- High Priority: 10
- Medium Priority: 13
- Low Priority: 7

**Estimated Hours**: ~110 hours

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Knowledge RAG System backend (see [setup guide](./docs/KNOWLEDGE_RAG_SETUP.md))

### Installation
```bash
# Clone the repository
git clone https://github.com/anubissbe/knowledge-rag-webui.git
cd knowledge-rag-webui

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Configuration
Edit `.env` file with your settings:
```env
VITE_API_URL=http://localhost:3001
VITE_RAG_URL=http://localhost:8002
VITE_KG_URL=http://localhost:8001
VITE_VECTOR_URL=http://localhost:8003
VITE_UNIFIED_URL=http://localhost:8004
VITE_WEBSOCKET_URL=ws://localhost:8005
```

## 🔌 API Integration

The web UI integrates with Knowledge RAG System through MCP (Model Context Protocol) servers:

### MCP Adapter Architecture
```typescript
// Core MCP communication
src/services/api/mcp-adapter.ts
├── JSON-RPC protocol implementation
├── Memory operations (CRUD, search)
├── Knowledge Graph operations
├── Collection management
└── Connection health checks
```

### Available APIs
- **Memory API** - Create, read, update, delete memories
- **Search API** - Hybrid, vector, and full-text search
- **Knowledge Graph API** - Entity extraction and graph visualization
- **Collection API** - Organize memories into collections

### Testing Integration
Access the MCP test page at `/test-mcp` (development mode only) to:
- Verify server connectivity
- Test memory operations
- Validate search functionality
- Check knowledge graph extraction

## 🚀 Quick Start with Example Server

For testing purposes, you can use the included example MCP server:

```bash
# Terminal 1: Start example MCP server
cd examples/mcp-servers
npm install
npm run start:rag

# Terminal 2: Start the web UI
cd ../..
npm run dev
```

Then navigate to `http://localhost:5173` to use the web UI.

## 📐 Design Principles

1. **Simplicity First**: Clean interface without clutter
2. **Speed Matters**: Fast response times and smooth interactions
3. **Privacy Focused**: Your data stays yours
4. **Keyboard Friendly**: Power users can navigate without mouse ✅
5. **Mobile Ready**: Works great on all devices

## 🎨 UI Mockups

### Memory List View
```
┌─────────────────────────────────────────┐
│ 🔍 Search memories...          [+ New]  │
├─────────────────────────────────────────┤
│ Filters: All ▼  Sort: Recent ▼         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Title of Memory                      │ │
│ │ Preview of content...                │ │
│ │ 2 hours ago • Work • 3 entities     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Another Memory                       │ │
│ │ More preview text...                 │ │
│ │ Yesterday • Personal • 5 entities    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Knowledge Graph View
```
┌─────────────────────────────────────────┐
│          Knowledge Graph                 │
├─────────────────────────────────────────┤
│     ○───────○                           │
│    ╱ ╲     ╱ ╲                         │
│   ○   ○───○   ○                        │
│    ╲ ╱     ╲ ╱                         │
│     ○───────○                           │
│                                         │
│ Entities: 24  Relations: 37            │
└─────────────────────────────────────────┘
```

## 🗺️ Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and configuration
- [ ] Basic layout and navigation
- [ ] Memory CRUD operations
- [ ] Simple search functionality

### Phase 2: Core Features (Week 3-4)
- [ ] Advanced search with filters
- [ ] Collections management
- [ ] Rich text editor
- [ ] Authentication system

### Phase 3: Advanced Features (Week 5-6)
- [x] Knowledge graph visualization ✅
- [x] Real-time updates ✅
- [x] Import/export functionality ✅
- [x] Analytics dashboard ✅

### Phase 4: Polish (Week 7-8)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Documentation and testing

## 🤝 Contributing

This project is part of the MCP-Enhanced Workspace ecosystem. Contributions are welcome!

1. Check the task list in the project management system
2. Pick a task and update its status
3. Create a feature branch
4. Implement with tests
5. Submit for review

## 📚 Documentation

### Project Documentation
- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and patterns
- [Development Guide](./docs/DEVELOPMENT.md) - Setup and development workflow
- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Testing Guide](./docs/TESTING.md) - Testing strategies and examples
- [Theme System](./docs/THEME_SYSTEM.md) - Dark/light theme implementation ✅
- [Onboarding System](./docs/ONBOARDING_SYSTEM.md) - Interactive user onboarding ✅
- [Accessibility Features](./docs/ACCESSIBILITY_FEATURES.md) - Comprehensive accessibility implementation ✅
- [Performance Guide](./docs/PERFORMANCE.md) - Optimization strategies and monitoring ✅
- [Import/Export Guide](./docs/IMPORT_EXPORT.md) - File import and memory export functionality ✅
- [WebSocket Real-time Sync](./docs/WEBSOCKET_REALTIME.md) - Real-time synchronization with Socket.IO ✅
- [MCP Integration Guide](./docs/MCP_INTEGRATION.md) - Complete MCP server integration documentation ✅
- [Analytics Dashboard](./docs/ANALYTICS_DASHBOARD.md) - Comprehensive analytics and insights ✅
- [Keyboard Shortcuts](./docs/KEYBOARD_SHORTCUTS.md) - Navigation and action shortcuts guide ✅
- [User Settings](./docs/USER_SETTINGS.md) - Comprehensive settings and preferences guide ✅
- [Bulk Operations](./docs/features/bulk-operations.md) - Batch actions for memory management ✅
- [API Integration Tests](./docs/API_INTEGRATION_E2E_TESTS.md) - E2E test results

### External Resources
- [Mem0 Inspiration](https://github.com/mem0ai/mem0)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [React Documentation](https://react.dev)

## 📄 License

Part of the MCP-Enhanced Workspace project.

## ☕ Support

If you find this project helpful, consider buying me a coffee!

<a href="https://buymeacoffee.com/anubissbe" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

**Note**: This is a work in progress. Check the task management system for the latest status and upcoming features.