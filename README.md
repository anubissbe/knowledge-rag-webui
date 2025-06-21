# Knowledge RAG WebUI

A modern web interface for Knowledge Retrieval-Augmented Generation (RAG) systems, inspired by Mem0. Built with React, TypeScript, and Tailwind CSS.

![Knowledge RAG WebUI](docs/images/banner.png)

## 🚀 Features

- **Analytics Dashboard**: Comprehensive analytics with memory growth charts, usage statistics, and performance insights
- **Memory Management**: Create, view, edit, and delete memories with rich metadata
- **Smart Search**: Full-text search with tag filtering and faceted search
- **Entity Recognition**: Automatic entity extraction and relationship mapping
- **Collections**: Organize memories into collections with custom icons and colors
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first design with touch interactions and adaptive layouts
- **Mobile Features**: Floating action buttons, swipe gestures, and mobile-optimized navigation
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and 44px touch targets
- **CI/CD Pipeline**: Automated testing, building, and deployment with GitHub Actions
- **Bulk Operations**: Select multiple memories for bulk delete, export, collection assignment, and tag management
- **Export/Import**: Export memories in multiple formats (JSON, CSV, PDF, Markdown) with bulk export support
- **Touch Optimized**: Enhanced mobile experience with proper touch targets and gestures
- **Progressive Web App**: Installable app with offline support, automatic updates, and native-like experience
- **Offline Mode**: Works offline with cached data and automatic sync when connection restored
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for power users (press ? for help)
- **Real-time Updates**: WebSocket integration for live synchronization across users
- **Live Notifications**: Instant notifications when memories are created, updated, or deleted
- **Connection Status**: Visual indicators showing connection state and latency
- **Error Boundaries**: Graceful error handling to prevent app crashes
- **Toast Notifications**: Non-intrusive feedback system for all user actions
- **API Integration**: Full REST API integration replacing mock data
- **Centralized Logging**: Structured logging system with environment-aware behavior and external service integration
- **API Key Security**: Secure API key display with masking, auto-hide, and security warnings
- **Memory Leak Prevention**: Comprehensive WebSocket and interval cleanup to prevent memory leaks
- **Code Splitting**: Intelligent bundle splitting reducing initial load from 904KB to 208KB (77% reduction)

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/anubissbe/knowledge-rag-webui.git
cd knowledge-rag-webui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔌 API Backend

This web UI requires a compatible backend API server. The backend should implement the following endpoints:

- **Memory Management**: CRUD operations for memories
- **Search**: Full-text and vector similarity search
- **Analytics**: Dashboard statistics and metrics
- **Export**: Data export in multiple formats
- **WebSocket**: Real-time updates for memory changes

See [API Integration Documentation](./docs/API_INTEGRATION.md) for detailed endpoint specifications.

## 🏗️ Project Structure

```
knowledge-rag-webui/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── bulk/          # Bulk operations components
│   │   ├── dashboard/     # Dashboard and analytics components
│   │   ├── memory/        # Memory-specific components
│   │   ├── mobile/        # Mobile-specific components
│   │   ├── search/        # Search-related components
│   │   ├── settings/      # Settings page components
│   │   └── Layout.tsx     # Main layout wrapper
│   ├── contexts/          # React contexts (Theme, Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (Dashboard, Memories, Search, Settings)
│   ├── services/          # API services and WebSocket integration
│   │   ├── api/          # REST API client services
│   │   └── websocket.ts  # Real-time WebSocket service
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/             # Utility functions and centralized logger
│   │   └── logger.ts     # Structured logging system with context support
│   └── styles/            # Global styles and mobile CSS
├── public/                # Static assets
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
└── docs/                  # Documentation
    ├── DESIGN_SYSTEM.md   # Design principles and component guidelines
    ├── COMPONENT_ARCHITECTURE.md # Component patterns and architecture
    ├── UI_MOCKUPS.md      # Wireframes and layout specifications
    ├── STYLE_GUIDE.md     # CSS implementation and styling standards
    ├── MOBILE.md          # Mobile-specific features and responsive design
    ├── ERROR_HANDLING.md  # Error boundaries and error recovery
    ├── TOAST_NOTIFICATIONS.md # Toast notification system guide
    ├── API_INTEGRATION.md # API services and integration guide
    └── README.md          # Documentation hub and navigation
```

## 🧪 Testing

### Run all tests:
```bash
npm test
```

### Run unit tests:
```bash
npm run test:unit
```

### Run E2E tests:
```bash
npm run test:e2e
```

### Run tests with coverage:
```bash
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🚀 Deployment

### Docker

```bash
# Build Docker image
docker build -t knowledge-rag-webui .

# Run container
docker run -p 8080:80 knowledge-rag-webui
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. The `dist` folder contains the built files ready for deployment
3. Serve the files using any static file server (nginx, Apache, etc.)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_WEBSOCKET_URL` | WebSocket URL | `ws://localhost:3001` |
| `VITE_PUBLIC_URL` | Public URL for sharing | `http://localhost:5173` |

### Theme Configuration

Themes can be customized in `tailwind.config.js`. The application supports:
- Light mode
- Dark mode
- System preference detection
- High contrast mode

## 🎯 Usage

### Analytics Dashboard

The dashboard (home page) provides comprehensive analytics:

1. **Statistics Overview**: View total memories, collections, tags, and search count
2. **Memory Growth Chart**: Interactive chart showing memory creation over time
3. **Recent Activity**: Track recent actions with timestamps
4. **Top Tags**: See most used tags with trend indicators
5. **Search Insights**: Analyze search patterns and query frequency
6. **Usage Metrics**: Monitor progress with goals and achievements
7. **Time Range Filter**: Select 7d, 30d, 90d, or 1y views

### Creating a Memory

1. Navigate to the Memories page
2. Click "New Memory"
3. Fill in the title and content
4. Add tags and select a collection
5. Click "Save"

### Searching Memories

1. Use the search bar to find memories by content
2. Click on tags to filter by specific tags
3. Use the faceted search for advanced filtering

### Bulk Operations

1. Navigate to the Memories page
2. Click "Select" to enable bulk selection mode
3. Choose memories by clicking their checkboxes
4. Use the bulk toolbar to:
   - Export selected memories (JSON, Markdown, CSV)
   - Add memories to collections
   - Add tags to multiple memories
   - Delete selected memories
5. Click "Cancel" to exit bulk mode

### Managing Settings

1. Click on Settings in the navigation
2. Configure your profile, preferences, and privacy settings
3. Manage API keys for programmatic access
4. Set up notification preferences

## ⌨️ Keyboard Shortcuts

Knowledge RAG WebUI provides comprehensive keyboard shortcuts for efficient navigation:

### Quick Start
- Press `?` anywhere to view all available shortcuts
- `Cmd/Ctrl + K` - Quick search
- `Cmd/Ctrl + N` - Create new memory
- `Shift + M/S/G` - Navigate to Memories/Search/Dashboard

For a complete list of shortcuts, see the [Keyboard Shortcuts Guide](docs/KEYBOARD_SHORTCUTS.md) or press `?` in the application.

## 📱 Mobile Experience

### Mobile Features

- **Responsive Navigation**: Hamburger menu for easy navigation on mobile devices
- **Touch-Optimized Interface**: All interactive elements meet the 44px minimum touch target size
- **Floating Action Button**: Quick access to create new memories on mobile
- **Mobile-Optimized Forms**: Larger input fields and buttons for better touch interaction
- **Swipe Gestures**: Enhanced navigation with touch gestures (where supported)

### Mobile Testing

Run mobile-specific E2E tests:
```bash
npm run test:e2e -- tests/e2e/mobile-basic.spec.ts
```

### Responsive Breakpoints

- **Mobile**: < 768px (xs: < 480px for very small screens)
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

## 💾 Progressive Web App (PWA)

Knowledge RAG WebUI is a fully-featured Progressive Web App that can be installed on your device:

### Installation
- **Desktop**: Click the install button in your browser's address bar or wait for the install prompt
- **Android**: Tap "Add to Home Screen" when prompted or use browser menu
- **iOS**: Tap the share button and select "Add to Home Screen"

### PWA Features
- **Offline Support**: All core features work offline with cached data
- **Automatic Updates**: App updates automatically with notification
- **Native Experience**: Launches in standalone window like a native app
- **Background Sync**: Changes sync automatically when online
- **App Shortcuts**: Quick actions from app icon (where supported)

For detailed PWA documentation, see the [PWA Features Guide](docs/PWA_FEATURES.md).

## 📚 Documentation

For comprehensive design and development documentation, see the [docs directory](docs/):

- **[Design System](docs/DESIGN_SYSTEM.md)** - Design principles, color palette, typography, and component guidelines
- **[Component Architecture](docs/COMPONENT_ARCHITECTURE.md)** - Component patterns, state management, and development practices
- **[UI Mockups](docs/UI_MOCKUPS.md)** - Wireframes and layout specifications for all pages and components
- **[Style Guide](docs/STYLE_GUIDE.md)** - CSS implementation details, animations, and accessibility standards
- **[Mobile Guide](docs/MOBILE.md)** - Mobile-specific features and responsive design patterns
- **[Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md)** - Complete list of keyboard shortcuts
- **[PWA Features](docs/PWA_FEATURES.md)** - Progressive Web App capabilities and configuration
- **[WebSocket Integration](docs/WEBSOCKET_INTEGRATION.md)** - Real-time updates and live synchronization
- **[Error Boundaries](docs/ERROR_BOUNDARIES.md)** - Error handling and crash prevention strategies
- **[Toast Notifications](docs/TOAST_NOTIFICATIONS.md)** - User feedback system implementation
- **[API Integration](docs/API_INTEGRATION.md)** - REST API integration and service architecture
- **[WebSocket Memory Management](docs/WEBSOCKET_MEMORY_LEAK_FIXES.md)** - Memory leak prevention and cleanup strategies
- **[API Key Security](docs/API_KEY_SECURITY.md)** - Secure API key handling and display
- **[Logging Implementation](docs/LOGGING_IMPLEMENTATION.md)** - Centralized logging system and best practices
- **[Code Splitting](docs/CODE_SPLITTING.md)** - Bundle optimization and lazy loading implementation

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests. Also review our [Design System](docs/DESIGN_SYSTEM.md) and [Component Architecture](docs/COMPONENT_ARCHITECTURE.md) documentation for development guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Mem0](https://mem0.ai/)
- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

- Issues: [GitHub Issues](https://github.com/anubissbe/knowledge-rag-webui/issues)
- Discussions: [GitHub Discussions](https://github.com/anubissbe/knowledge-rag-webui/discussions)