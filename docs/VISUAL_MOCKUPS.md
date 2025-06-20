# Visual Mockups & UI Flows

## 📱 Screen Mockups

### 1. Homepage/Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG                    🔍 Search memories...         👤 John ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        Welcome back, John! Here's what's happening...             │
│  📝 Memories                                                                │
│  🔍 Search      ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  📁 Collections │ 📊 Total        │ │ 🆕 This Week    │ │ 🔥 Most Used    │ │
│  🕸️  Graph      │ 247 memories    │ │ 12 new memories │ │ #react (156)    │ │
│  📈 Analytics   │ 89 tags         │ │ 3 collections   │ │ #javascript(89) │ │
│  ⚙️  Settings   │ 18 collections  │ │ 45 entities     │ │ #typescript(67) │ │
│  ╷             └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│  📡 Connected   ┌─────────────────────────────────────────────────────────┐ │
│                 │ 🚀 Recent Activity                                      │ │
│                 ├─────────────────────────────────────────────────────────┤ │
│                 │ ● Updated "React Hooks Guide" • 2 hours ago            │ │
│                 │ ● Created "Machine Learning Concepts" • 5 hours ago    │ │
│                 │ ● Added to "AI Research" collection • Yesterday        │ │
│                 │ ● Extracted 12 entities from "API Design" • 2 days ago │ │
│                 └─────────────────────────────────────────────────────────┘ │
│                 ┌─────────────────────────────────────────────────────────┐ │
│                 │ 🎯 Quick Actions                                        │ │
│                 ├─────────────────────────────────────────────────────────┤ │
│                 │ [+ Create Memory] [📁 New Collection] [🔍 Advanced Search] │
│                 │ [📊 View Analytics] [🕸️ Explore Graph] [📤 Export Data]  │
│                 └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Memory List with Bulk Operations
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG                    🔍 Search memories...         👤 John ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        📝 Memories                                    [+ New Memory] │
│  📝 Memories    ┌─────────────────────────────────────────────────────────┐ │
│  🔍 Search      │ ✓ 3 of 247 selected      [🗑️ Delete] [🏷️ Tag] [📁 Move] │ │
│  📁 Collections │                        [📤 Export] [❌ Cancel Selection] │ │
│  🕸️  Graph      └─────────────────────────────────────────────────────────┘ │
│  📈 Analytics   Filters: All ▼  Sort: Recent ▼  View: [⊞] [☰]              │
│  ⚙️  Settings   ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │
│  ╷             │ ☑ React Hooks │ │ ☐ TypeScript  │ │ ☑ API Design     │   │
│  📡 Connected   │ Complete guide│ │ Advanced types│ │ RESTful patterns │   │
│                 │ to useState,  │ │ and generics  │ │ and best practices│   │
│                 │ useEffect...  │ │ for better... │ │ for scalable...   │   │
│                 │ 🏷️ react js   │ │ 🏷️ ts types   │ │ 🏷️ api rest      │   │
│                 │ 📁 Development│ │ 📁 Development│ │ 📁 Backend       │   │
│                 │ ⏰ 2 hours ago │ │ ⏰ 1 day ago   │ │ ⏰ 3 days ago     │   │
│                 │ 👥 8 entities │ │ 👥 12 entities│ │ 👥 15 entities   │   │
│                 └───────────────┘ └───────────────┘ └───────────────────┘   │
│                 ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │
│                 │ ☑ ML Concepts │ │ ☐ Git Workflow│ │ ☐ Testing Guide  │   │
│                 │ Neural networks│ │ Branch strategies│ │ Jest and RTL    │   │
│                 │ and deep      │ │ for team      │ │ setup and best  │   │
│                 │ learning...   │ │ collaboration │ │ practices...     │   │
│                 │ 🏷️ ml ai      │ │ 🏷️ git vcs    │ │ 🏷️ test jest     │   │
│                 │ 📁 Learning   │ │ 📁 Tools      │ │ 📁 QA           │   │
│                 │ ⏰ 1 week ago  │ │ ⏰ 2 weeks ago │ │ ⏰ 3 weeks ago   │   │
│                 │ 👥 25 entities│ │ 👥 6 entities │ │ 👥 9 entities    │   │
│                 └───────────────┘ └───────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Memory Editor (Split View)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [←] Edit Memory: React Hooks Guide                [💾 Save] [❌ Cancel]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Title: [React Hooks Complete Guide                                       ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Editor                               │ Preview                             │
│ ┌─────────────────────────────────┐   │ ┌─────────────────────────────────┐ │
│ │ # React Hooks Complete Guide    │   │ │ React Hooks Complete Guide      │ │
│ │                                 │   │ │                                 │ │
│ │ ## Introduction                 │   │ │ Introduction                    │ │
│ │ React Hooks revolutionized how  │   │ │ React Hooks revolutionized how  │ │
│ │ we write functional components  │ ←→│ │ we write functional components  │ │
│ │                                 │   │ │                                 │ │
│ │ ## useState Hook                │   │ │ useState Hook                   │ │
│ │ ```javascript                   │   │ │ const [count, setCount] =       │ │
│ │ const [count, setCount] =       │   │ │   useState(0);                  │ │
│ │   useState(0);                  │   │ │                                 │ │
│ │ ```                             │   │ │ Allows you to add state to      │ │
│ │                                 │   │ │ functional components.          │ │
│ │ ## useEffect Hook               │   │ │                                 │ │
│ │ Handle side effects like:       │   │ │ useEffect Hook                  │ │
│ │ - API calls                     │   │ │ Handle side effects like:       │ │
│ │ - Subscriptions                 │   │ │ • API calls                     │ │
│ │ - Manual DOM updates            │   │ │ • Subscriptions                 │ │
│ │                                 │   │ │ • Manual DOM updates            │ │
│ └─────────────────────────────────┘   │ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tags: [react] [hooks] [javascript] [functional-components]     [+ Add Tag] │
│ Collection: [Development ▼] Privacy: [🔒 Private ▼] Auto-save: [●] Enabled │
│ Entities: @React @useState @useEffect @JavaScript                          │
│ Word count: 245 • Characters: 1,247 • Reading time: ~1 min                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. Search Interface with Filters
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG                    🔍 Search memories...         👤 John ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        🔍 Search                                                   │
│  📝 Memories    ┌─────────────────────────────────────────────────────────┐ │
│  🔍 Search      │ 🔍 react hooks useEffect                         [🔧]   │ │
│  📁 Collections │ ┌─ Suggestions ─────────────────────────────────────┐   │ │
│  🕸️  Graph      │ │ 💡 react hooks guide                           │   │ │
│  📈 Analytics   │ │ 📚 React documentation                         │   │ │
│  ⚙️  Settings   │ │ 👤 @john-smith (entity)                        │   │ │
│  ╷             │ │ 🏷️ #javascript #react #hooks                   │   │ │
│  📡 Connected   │ └─────────────────────────────────────────────────┘   │ │
│                 └─────────────────────────────────────────────────────────┘ │
│                 ┌─ Filters ──────────────────────────────────────────────┐ │
│                 │ Search Type: [🔀 Hybrid ▼] [🔍 Vector] [📝 Full-text]  │ │
│                 │ Date Range: [📅 All time ▼] [Last week] [Last month]   │ │
│                 │ Collections: [☐ All] [☑ Development] [☐ Learning]      │ │
│                 │ Tags: [☑ react] [☑ hooks] [☐ javascript] [+ More...]   │ │
│                 │ Sort by: [🔥 Relevance ▼] [📅 Date] [🔤 Title]         │ │
│                 │ [🗑️ Clear filters]                       [🔍 Search]   │ │
│                 └─────────────────────────────────────────────────────────┘ │
│                 ┌─ Results (24 found) ───────────────────────────────────┐ │
│                 │ ⭐ React **Hooks** Complete Guide                      │ │
│                 │ useState and **useEffect** are fundamental **hooks**   │ │
│                 │ 🏷️ react hooks javascript 📁 Development ⏰ 2h ago      │ │
│                 │ ──────────────────────────────────────────────────────  │ │
│                 │ ⭐ Advanced **React** Patterns                         │ │
│                 │ Custom **hooks** and higher-order components          │ │
│                 │ 🏷️ react patterns advanced 📁 Development ⏰ 1d ago     │ │
│                 │ ──────────────────────────────────────────────────────  │ │
│                 │ ⭐ **useEffect** Deep Dive                             │ │
│                 │ Understanding dependencies and cleanup in **useEffect**│ │
│                 │ 🏷️ react hooks useEffect 📁 Development ⏰ 3d ago      │ │
│                 └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. Knowledge Graph Visualization
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG - Knowledge Graph              Layout: [Force ▼] [⚙️] [🔍]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        ┌─ Controls ────┐ Graph Visualization                      │
│  📝 Memories    │ Layout:       │     ●React                               │
│  🔍 Search      │ ● Force       │    ╱│╲                                   │
│  📁 Collections │ ○ Radial      │   ╱ │ ╲                                  │
│  🕸️  Graph      │ ○ Tree        │  ●  │  ●Hooks                           │
│  📈 Analytics   │ ○ Cluster     │ useState useEffect                      │
│  ⚙️  Settings   │               │  │  │  │                                │
│  ╷             │ Color by:     │  ●──●──●                                 │
│  📡 Connected   │ ● Type        │ Components Functional                   │
│                 │ ○ Cluster     │       │                                 │
│                 │ ○ Centrality  │       ●JavaScript                       │
│                 │               │      ╱│╲                                │
│                 │ Show:         │     ╱ │ ╲                               │
│                 │ ☑ Node Labels │    ●  │  ●                              │
│                 │ ☑ Edge Labels │   ES6 │ DOM                             │
│                 │ ☑ Entities    │       │                                 │
│                 │ ☑ Memories    │       ●Modern                           │
│                 │ ☑ Collections │                                         │
│                 │               │ ┌─ Selected: React ──────────────────┐ │
│                 │ Filters:      │ │ Type: Entity                       │ │
│                 │ Min Conn: [2] │ │ Connections: 15                    │ │
│                 │ Max Depth:[3] │ │ Related memories: 8                │ │
│                 │               │ │ Collections: Development, Learning │ │
│                 │ [Export JSON] │ │                                    │ │
│                 │ [Reset View]  │ │ [👁️ View] [✏️ Edit] [🔗 Share]      │ │
│                 └───────────────┘ └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6. Collections Management
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG                    🔍 Search collections...     👤 John ⚙️   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        📁 Collections                           [+ New Collection] │
│  📝 Memories    Sort by: [📅 Recent ▼] [🔤 Name] [📊 Size]  View: [⊞] [☰]   │
│  🔍 Search      ┌───────────────┐ ┌───────────────┐ ┌─────────────────────┐ │
│  📁 Collections │ 💻 Development│ │ 🧠 Learning   │ │ 📊 Research         │ │
│  🕸️  Graph      │ Web dev stuff │ │ Study materials│ │ Academic papers    │ │
│  📈 Analytics   │ and tutorials │ │ and courses   │ │ and findings       │ │
│  ⚙️  Settings   │               │ │               │ │                     │ │
│  ╷             │ 📝 89 memories │ │ 📝 23 memories │ │ 📝 156 memories     │ │
│  📡 Connected   │ 🏷️ 45 tags    │ │ 🏷️ 18 tags    │ │ 🏷️ 78 tags         │ │
│                 │ 🔒 Private    │ │ 🌐 Public     │ │ 🔒 Private         │ │
│                 │ ⏰ 2h ago     │ │ ⏰ 1d ago     │ │ ⏰ 3d ago           │ │
│                 └───────────────┘ └───────────────┘ └─────────────────────┘ │
│                 ┌───────────────┐ ┌───────────────┐ ┌─────────────────────┐ │
│                 │ 🔧 Tools      │ │ 🎨 Design     │ │ 💼 Business         │ │
│                 │ CLI tools and │ │ UI/UX patterns│ │ Strategy and        │ │
│                 │ configurations│ │ and resources │ │ management          │ │
│                 │               │ │               │ │                     │ │
│                 │ 📝 12 memories│ │ 📝 34 memories │ │ 📝 67 memories      │ │
│                 │ 🏷️ 8 tags     │ │ 🏷️ 29 tags    │ │ 🏷️ 41 tags         │ │
│                 │ 🌐 Public     │ │ 🔒 Private    │ │ 🌐 Public          │ │
│                 │ ⏰ 1w ago     │ │ ⏰ 2w ago     │ │ ⏰ 1m ago           │ │
│                 └───────────────┘ └───────────────┘ └─────────────────────┘ │
│                 ┌─────────────────────────────────────────────────────────┐ │
│                 │ 📈 Collection Analytics                                  │ │
│                 ├─────────────────────────────────────────────────────────┤ │
│                 │ Most active: Development (89 memories, 15 this week)   │ │
│                 │ Fastest growing: Learning (+12 memories this month)    │ │
│                 │ Most collaborative: Research (3 contributors)          │ │
│                 └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7. Settings & Preferences
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Knowledge RAG - Settings                                   👤 John ⚙️      │
├─────────────────────────────────────────────────────────────────────────────┤
│ [≡]                                                                         │
│  🏠 Home        ┌─ Navigation ──┐ ┌─ Account Settings ──────────────────┐   │
│  📝 Memories    │ 👤 Account    │ │ Profile Information                 │   │
│  🔍 Search      │ 🧠 Memory     │ │ ┌─────────────────────────────────┐ │   │
│  📁 Collections │ 🎨 Appearance │ │ │ Name: [John Smith              ] │ │   │
│  🕸️  Graph      │ ♿ Accessibility│ │ │ Email: [john@example.com       ] │ │   │
│  📈 Analytics   │ 🔑 API Keys   │ │ │ Bio: [Software engineer and    ] │ │   │
│  ⚙️  Settings   │ 🔔 Notifications│ │ │      [lifelong learner...      ] │ │   │
│  ╷             │ 🔒 Privacy    │ │ └─────────────────────────────────┘ │   │
│  📡 Connected   │ 📤 Export     │ │                                     │   │
│                 │ 🌐 Language   │ │ Account Management                  │   │
│                 │ ⌨️ Shortcuts  │ │ [🔐 Change Password]               │   │
│                 └───────────────┘ │ [📧 Update Email]                  │   │
│                                   │ [📤 Export Data]                   │   │
│                                   │ [🗑️ Delete Account]                │   │
│                                   │                                     │   │
│                                   │ Sessions                            │   │
│                                   │ ● Current (Chrome, Mac) • Now      │   │
│                                   │ ○ iPhone Safari • 2 hours ago      │   │
│                                   │ ○ Firefox Windows • Yesterday      │   │
│                                   │ [🚪 Sign out all devices]          │   │
│                                   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow Diagrams

### Memory Creation Flow
```
Start → Search Existing → Not Found → Create New → Edit → Add Tags → 
Select Collection → Save → View Detail → Share/Edit Options
```

### Search & Discovery Flow
```
Enter Query → Show Suggestions → Apply Filters → View Results → 
Select Memory → View Detail → Related Memories → Knowledge Graph
```

### Bulk Operations Flow
```
Memory List → Enable Selection → Select Items → Choose Action → 
Confirm Action → Process → Show Results → Update List
```

## 📊 Component States

### Loading States
```
┌─────────────────┐
│ ⏳ Loading...   │  ← Initial load
│ ████████████░░░ │  ← Progress bar
│ Fetching data   │
└─────────────────┘

┌─────────────────┐
│ ╭─╮ ╭─╮ ╭─╮    │  ← Skeleton loading
│ │ │ │ │ │ │    │
│ ╰─╯ ╰─╯ ╰─╯    │
│ ░░░░░░░░░░░░░░░ │
└─────────────────┘
```

### Empty States
```
┌─────────────────┐
│     📝          │  ← No memories
│ No memories yet │
│ [+ Create first]│
└─────────────────┘

┌─────────────────┐
│     🔍          │  ← No search results
│ No results found│
│ Try different   │
│ search terms    │
└─────────────────┘
```

### Error States
```
┌─────────────────┐
│     ⚠️          │  ← Network error
│ Connection lost │
│ [🔄 Retry]      │
└─────────────────┘

┌─────────────────┐
│     ❌          │  ← Validation error
│ Invalid input   │
│ Please check    │
│ your data       │
└─────────────────┘
```

## 🎨 Color & Typography Examples

### Color Palette Usage
```
Primary:   [████] Main actions, links, focus
Secondary: [░░░░] Backgrounds, subtle elements  
Success:   [████] Confirmations, positive states
Warning:   [████] Cautions, non-critical alerts
Error:     [████] Errors, destructive actions
Info:      [████] Informational content
```

### Typography Hierarchy
```
H1: Main page titles (32px, bold)
H2: Section headers (24px, semibold)  
H3: Subsection titles (20px, semibold)
Body: Main content (16px, regular)
Small: Meta information (14px, regular)
Tiny: Captions, labels (12px, regular)
```

This comprehensive mockup collection provides visual guidance for implementing the Knowledge RAG Web UI design system.