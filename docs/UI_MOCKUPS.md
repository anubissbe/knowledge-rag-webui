# UI Mockups and Wireframes

## Overview

This document contains ASCII-based mockups and wireframes for the Knowledge RAG WebUI, providing visual guidance for the user interface design and layout structures.

## 📱 Responsive Layout Patterns

### Desktop Layout (≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Knowledge RAG WebUI                                    🔍 Search   👤 Profile  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📚 Memories   🔍 Search   ⚙️ Settings                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              Main Content Area                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────────────┐
│  ☰  Knowledge RAG  🔍   │
├─────────────────────────┤
│                         │
│     Main Content        │
│                         │
│                         │
│                         │
│                    ┌──┐ │
│                    │+ │ │ <- Floating Action Button
│                    └──┘ │
└─────────────────────────┘
```

## 🏠 Home/Memories Page

### Desktop Memories Page
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Knowledge RAG WebUI                          🔍 [Search box]      👤 Profile   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📚 Memories   🔍 Search   ⚙️ Settings                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📝 My Memories                                            [+ New Memory]      │
│                                                                                 │
│  🔍 [Search memories...]           🏷️ [AI] [RAG] [ML]      📊 ⊞ ☰            │
│                                                                                 │
│  ┌─── Bulk Operations ────────────────────────────────────────────────────────┐ │
│  │ ✓ 3 memories selected    [Export ▼] [Collection ▼] [Tags +] [🗑️ Delete] │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │☑️ Understanding│  │☑️ Vector DB   │  │☐ Semantic   │  │☐ Advanced   │          │
│  │RAG Systems  │  │Explained    │  │Search Guide │  │Techniques   │          │
│  │             │  │             │  │             │  │             │          │
│  │📄 An overview │  │🔧 Deep dive  │  │📚 Practical │  │🎯 Expert    │          │
│  │of RAG...    │  │into vector  │  │guide to... │  │level...     │          │
│  │             │  │databases... │  │             │  │             │          │
│  │🏷️ AI, RAG, ML │  │🏷️ Vector, DB │  │🏷️ Search, NLP│  │🏷️ Advanced   │          │
│  │📅 Jan 15     │  │📅 Jan 14     │  │📅 Jan 13     │  │📅 Jan 12     │          │
│  │⏱️ 2 min read │  │⏱️ 3 min read │  │⏱️ 4 min read │  │⏱️ 5 min read │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │☐ Memory     │  │☐ Knowledge  │  │☐ Embeddings │  │☐ Fine-tuning│          │
│  │Management   │  │Graphs      │  │& Similarity │  │Strategies   │          │
│  │...          │  │...          │  │...          │  │...          │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Memories Page
```
┌─────────────────────────┐
│  ☰  My Memories    🔍   │
├─────────────────────────┤
│ 🔍 [Search memories...] │
│                         │
│ 🏷️ [AI] [RAG] [ML] [+] │
│                         │
│ ☑️ Select Mode   [❌]   │
│ 2 selected       [🗑️]  │
│                         │
│ ┌─────────────────────┐ │
│ │☑️ Understanding RAG │ │
│ │                    │ │
│ │📄 An overview of   │ │
│ │Retrieval-Augmented │ │
│ │Generation...       │ │
│ │                    │ │
│ │🏷️ AI, RAG, ML      │ │
│ │📅 Jan 15 ⏱️ 2 min  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │☑️ Vector Databases  │ │
│ │                    │ │
│ │🔧 Deep dive into   │ │
│ │vector databases... │ │
│ │                    │ │
│ │🏷️ Vector, DB       │ │
│ │📅 Jan 14 ⏱️ 3 min  │ │
│ └─────────────────────┘ │
│                    ┌──┐ │
│                    │+ │ │
│                    └──┘ │
└─────────────────────────┘
```

## 🔍 Search Page

### Desktop Search Interface
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Knowledge RAG WebUI                          🔍 [Search box]      👤 Profile   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📚 Memories   🔍 Search   ⚙️ Settings                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🔍 Search                                                                     │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 [RAG systems and vector databases...]              [🎯 Advanced] │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─── Filters ────┐  ┌────────── Search Results ──────────────────────────────┐ │
│ │📊 Search Stats │  │ 🎯 Found 12 results for "RAG systems" (0.24s)         │ │
│ │                │  │                                                        │ │
│ │📅 Date Range   │  │ ┌─────────────────────────────────────────────────────┐ │ │
│ │[Last 30 days▼] │  │ │📄 Understanding RAG Systems            ★★★★☆ 95%  │ │ │
│ │                │  │ │An comprehensive overview of Retrieval-Augmented   │ │ │
│ │🏷️ Tags (8)     │  │ │Generation systems, their components and benefits  │ │ │
│ │☑️ AI (5)       │  │ │🏷️ AI, RAG, ML  📅 Jan 15  ⏱️ 2 min read           │ │ │
│ │☑️ RAG (3)      │  │ └─────────────────────────────────────────────────────┘ │ │
│ │☐ ML (2)       │  │                                                        │ │
│ │☐ Vector (4)   │  │ ┌─────────────────────────────────────────────────────┐ │ │
│ │                │  │ │🔧 Vector Databases Explained           ★★★★☆ 87%  │ │ │
│ │📂 Collections  │  │ │Deep dive into vector databases and their role in  │ │ │
│ │☐ Personal (8) │  │ │similarity search for modern AI applications       │ │ │
│ │☐ Work (3)     │  │ │🏷️ Vector, DB  📅 Jan 14  ⏱️ 3 min read            │ │ │
│ │☐ Research (4) │  │ └─────────────────────────────────────────────────────┘ │ │
│ │                │  │                                                        │ │
│ │📊 Content Type │  │ ┌─────────────────────────────────────────────────────┐ │ │
│ │☑️ Markdown (7) │  │ │📚 Implementing Semantic Search         ★★★☆☆ 76%  │ │ │
│ │☐ Text (3)     │  │ │Practical guide to implementing semantic search in │ │ │
│ │☐ Code (2)     │  │ │your applications using embeddings                 │ │ │
│ │                │  │ │🏷️ Search, NLP  📅 Jan 13  ⏱️ 4 min read           │ │ │
│ │📈 Sort By      │  │ └─────────────────────────────────────────────────────┘ │ │
│ │• Relevance     │  │                                                        │ │
│ │○ Date (Newest) │  │                    [Previous] [1] [2] [3] [Next]      │ │
│ │○ Date (Oldest) │  │                                                        │ │
│ └────────────────┘  └────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Search Interface
```
┌─────────────────────────┐
│  ☰  Search        [⚙️] │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │🔍 RAG systems...   │ │
│ └─────────────────────┘ │
│                         │
│ 🎯 12 results (0.24s)   │
│                         │
│ [📊 Filters] [📈 Sort] │
│                         │
│ ┌─────────────────────┐ │
│ │📄 Understanding RAG│ │
│ │★★★★☆ 95%          │ │
│ │                    │ │
│ │An comprehensive    │ │
│ │overview of RAG...  │ │
│ │                    │ │
│ │🏷️ AI, RAG, ML      │ │
│ │📅 Jan 15 ⏱️ 2 min  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │🔧 Vector Databases │ │
│ │★★★★☆ 87%          │ │
│ │                    │ │
│ │Deep dive into      │ │
│ │vector databases... │ │
│ │                    │ │
│ │🏷️ Vector, DB       │ │
│ │📅 Jan 14 ⏱️ 3 min  │ │
│ └─────────────────────┘ │
│                         │
│ [‹ Prev] [1][2][3] [Next ›] │
└─────────────────────────┘
```

### Mobile Search Filters Modal
```
┌─────────────────────────┐
│  📊 Search Filters [✕] │
├─────────────────────────┤
│                         │
│ 📅 Date Range           │
│ [Last 30 days     ▼]    │
│                         │
│ 🏷️ Tags                 │
│ ☑️ AI (5)               │
│ ☑️ RAG (3)              │
│ ☐ ML (2)                │
│ ☐ Vector (4)            │
│ ☐ Search (6)            │
│                         │
│ 📂 Collections          │
│ ☐ Personal (8)          │
│ ☐ Work (3)              │
│ ☐ Research (4)          │
│                         │
│ 📊 Content Type         │
│ ☑️ Markdown (7)         │
│ ☐ Text (3)              │
│ ☐ Code (2)              │
│                         │
│ ┌─────────────────────┐ │
│ │    [Clear All]      │ │
│ │    [Apply Filters]  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## 📄 Memory Detail Page

### Desktop Memory Detail
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Knowledge RAG WebUI                          🔍 [Search box]      👤 Profile   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📚 Memories   🔍 Search   ⚙️ Settings                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ← Back to Memories                                [✏️ Edit] [📤 Share] [🗑️]  │
│                                                                                 │
│ ┌──────────────────────────────────────────────┐ ┌─── Memory Info ──────────┐ │
│ │                                              │ │                          │ │
│ │  # Understanding RAG Systems                 │ │ 📅 Created               │ │
│ │                                              │ │ January 15, 2024         │ │
│ │  Retrieval-Augmented Generation (RAG) is a  │ │                          │ │
│ │  powerful technique that combines the        │ │ 📝 Last Modified         │ │
│ │  strengths of pre-trained language models   │ │ January 20, 2024         │ │
│ │  with external knowledge retrieval.         │ │                          │ │
│ │                                              │ │ 📊 Reading Time          │ │
│ │  ## Key Components                           │ │ 2 minutes                │ │
│ │                                              │ │                          │ │
│ │  1. **Retriever**: Finds relevant documents │ │ 📝 Word Count            │ │
│ │  2. **Generator**: Creates responses based   │ │ 245 words                │ │
│ │     on retrieved context                     │ │                          │ │
│ │  3. **Knowledge Base**: External source of   │ │ 🏷️ Tags                  │ │
│ │     information                              │ │ [AI] [RAG] [ML] [LLM]    │ │
│ │                                              │ │                          │ │
│ │  ## Benefits                                 │ │ 🎯 Entities              │ │
│ │                                              │ │ • Language Models        │ │
│ │  - Reduces hallucination                     │ │ • Information Retrieval  │ │
│ │  - Incorporates up-to-date information      │ │ • Machine Learning       │ │
│ │  - Improves factual accuracy                │ │                          │ │
│ │                                              │ │ 📂 Collection            │ │
│ │  RAG systems are particularly effective for │ │ 🔵 AI Research           │ │
│ │  question-answering, content generation,    │ │                          │ │
│ │  and knowledge management applications.     │ │                          │ │
│ │                                              │ └──────────────────────────┘ │
│ └──────────────────────────────────────────────┘                            │ │
│                                                                                 │
│ ┌──────────────────── Related Memories ─────────────────────────────────────┐ │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │ │
│ │ │🔧 Vector DB  │  │📚 Semantic   │  │🎯 Knowledge  │  │🤖 LLM        │      │ │
│ │ │Explained    │  │Search Guide │  │Graphs       │  │Fine-tuning  │      │ │
│ │ │🏷️ Vector, DB│  │🏷️ Search, NLP│  │🏷️ Graph, AI │  │🏷️ LLM, Train│      │ │
│ │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Memory Detail
```
┌─────────────────────────┐
│  ← Understanding RAG [⋮]│
├─────────────────────────┤
│                         │
│ # Understanding RAG     │
│ Systems                 │
│                         │
│ Retrieval-Augmented     │
│ Generation (RAG) is a   │
│ powerful technique that │
│ combines the strengths  │
│ of pre-trained language │
│ models with external    │
│ knowledge retrieval.    │
│                         │
│ ## Key Components       │
│                         │
│ 1. **Retriever**: Finds │
│    relevant documents   │
│ 2. **Generator**: Creates│
│    responses based on   │
│    retrieved context    │
│ 3. **Knowledge Base**:  │
│    External source      │
│                         │
│ ## Benefits             │
│                         │
│ - Reduces hallucination │
│ - Incorporates up-to-   │
│   date information      │
│ - Improves factual      │
│   accuracy              │
│                         │
│ RAG systems are         │
│ particularly effective  │
│ for question-answering, │
│ content generation, and │
│ knowledge management.   │
│                         │
│ ┌─────────────────────┐ │
│ │ 📊 Memory Info      │ │
│ │ 📅 Jan 15, 2024     │ │
│ │ ⏱️ 2 min read       │ │
│ │ 📝 245 words        │ │
│ │                     │ │
│ │ 🏷️ [AI][RAG][ML]    │ │
│ │                     │ │
│ │ 🎯 Entities:        │ │
│ │ • Language Models   │ │
│ │ • Info Retrieval    │ │
│ │ • Machine Learning  │ │
│ └─────────────────────┘ │
│                         │
│ 📚 Related Memories     │
│ ┌─────────────────────┐ │
│ │🔧 Vector Databases  │ │
│ │🏷️ Vector, DB        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │📚 Semantic Search   │ │
│ │🏷️ Search, NLP       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## ⚙️ Settings Page

### Desktop Settings
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Knowledge RAG WebUI                          🔍 [Search box]      👤 Profile   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📚 Memories   🔍 Search   ⚙️ Settings                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ⚙️ Settings                                                                   │
│                                                                                 │
│ ┌─── Navigation ───┐ ┌─────────────── Profile Settings ──────────────────────┐ │
│ │                  │ │                                                        │ │
│ │👤 Profile        │ │ 👤 Profile Information                                 │ │
│ │                  │ │                                                        │ │
│ │🎨 Preferences    │ │ Full Name                                              │ │
│ │                  │ │ ┌────────────────────────────────────────────────────┐ │ │
│ │🔒 Privacy        │ │ │ John Doe                                           │ │ │
│ │                  │ │ └────────────────────────────────────────────────────┘ │ │
│ │🔔 Notifications  │ │                                                        │ │
│ │                  │ │ Email                                                  │ │
│ │🔑 API Keys       │ │ ┌────────────────────────────────────────────────────┐ │ │
│ │                  │ │ │ john.doe@example.com                               │ │ │
│ │📤 Data Export    │ │ └────────────────────────────────────────────────────┘ │ │
│ │                  │ │                                                        │ │
│ └──────────────────┘ │ Bio                                                    │ │
│                      │ ┌────────────────────────────────────────────────────┐ │ │
│                      │ │ AI researcher and knowledge management enthusiast │ │ │
│                      │ │                                                    │ │ │
│                      │ │                                                    │ │ │
│                      │ └────────────────────────────────────────────────────┘ │ │
│                      │                                                        │ │
│                      │ 🔗 Social Links                                        │ │
│                      │ GitHub   ┌──────────────────────────────────────────┐ │ │
│                      │          │ https://github.com/johndoe               │ │ │
│                      │          └──────────────────────────────────────────┘ │ │
│                      │                                                        │ │
│                      │ Twitter  ┌──────────────────────────────────────────┐ │ │
│                      │          │ @johndoe                                │ │ │
│                      │          └──────────────────────────────────────────┘ │ │
│                      │                                                        │ │
│                      │                     [Cancel] [Save Changes]           │ │
│                      └────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Settings
```
┌─────────────────────────┐
│  ☰  Settings       [✓] │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │👤 Profile           │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │🎨 Preferences       │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │🔒 Privacy           │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │🔔 Notifications     │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │🔑 API Keys          │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │📤 Data Export       │ │
│ │                   ▶ │ │
│ └─────────────────────┘ │
│                         │
│                         │
│ ──────────────────────  │
│                         │
│ App Version 1.0.0       │
│ Built with ❤️ by Team   │
└─────────────────────────┘
```

## 🎯 Modal Components

### Bulk Delete Confirmation Modal
```
┌─────────────────────────────────────────────┐
│                                             │
│  ⚠️  Delete Memories                        │
│                                             │
│  Are you sure you want to delete 3         │
│  memories? This action cannot be undone.   │
│                                             │
│  The following memories will be deleted:   │
│  • Understanding RAG Systems               │
│  • Vector Databases Explained              │
│  • Semantic Search Guide                   │
│                                             │
│              [Cancel] [🗑️ Delete]          │
│                                             │
└─────────────────────────────────────────────┘
```

### Export Options Modal
```
┌─────────────────────────────────────────────┐
│                                             │
│  📤 Export Memories                         │
│                                             │
│  Choose export format for 3 selected       │
│  memories:                                  │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ ○ JSON - Structured data format        │ │
│  │ ● Markdown - Human-readable format     │ │
│  │ ○ CSV - Spreadsheet compatible         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ☑️ Include metadata                       │
│  ☑️ Include tags                           │
│  ☐ Include related memories                │
│                                             │
│              [Cancel] [📤 Export]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Add to Collection Modal
```
┌─────────────────────────────────────────────┐
│                                             │
│  📂 Add to Collection                       │
│                                             │
│  Select a collection for 3 selected        │
│  memories:                                  │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ ○ 🔵 Personal         (8 memories)     │ │
│  │ ○ 🟢 Work            (3 memories)     │ │
│  │ ● 🟣 Research        (4 memories)     │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  Or create a new collection:               │
│  ┌─────────────────────────────────────────┐ │
│  │ Collection name...                      │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│              [Cancel] [📂 Add]              │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎨 Component States

### Loading States

#### Memory Card Loading (Skeleton)
```
┌─────────────────────┐
│████████████████    │  <- Title placeholder
│                     │
│████████████████████│  <- Content placeholder
│██████████████      │
│                     │
│████ ████ ████ ████ │  <- Tags placeholder
│████████ ████████   │  <- Meta placeholder
└─────────────────────┘
```

#### Search Results Loading
```
┌─────────────────────────────────────────────┐
│ 🔍 Searching...                            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │████████████████████████████████████    │ │
│ │████████████████████████████████        │ │
│ │████████████████████████                │ │
│ │████ ████ ████                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │████████████████████████████████████    │ │
│ │████████████████████████████████        │ │
│ │████████████████████████                │ │
│ │████ ████ ████                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Empty States

#### No Memories
```
┌─────────────────────────────────────────────┐
│                                             │
│                    📝                       │
│                                             │
│           No memories yet!                  │
│                                             │
│        Create your first memory to          │
│        start building your knowledge        │
│              base.                          │
│                                             │
│           [🆕 Create Memory]                │
│                                             │
└─────────────────────────────────────────────┘
```

#### No Search Results
```
┌─────────────────────────────────────────────┐
│                                             │
│                    🔍                       │
│                                             │
│         No results found for                │
│           "advanced techniques"             │
│                                             │
│        Try adjusting your search terms      │
│        or clearing some filters.           │
│                                             │
│      [🔄 Clear Filters] [🆕 Create Memory]  │
│                                             │
└─────────────────────────────────────────────┘
```

#### No Selection
```
┌─────────────────────────────────────────────┐
│                                             │
│                    ☑️                       │
│                                             │
│         Select memories to see              │
│           bulk actions                      │
│                                             │
│        Choose one or more memories to       │
│        delete, export, or organize.        │
│                                             │
│              [Select All]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Error States

#### Network Error
```
┌─────────────────────────────────────────────┐
│                                             │
│                    ⚠️                       │
│                                             │
│            Connection Error                 │
│                                             │
│        Unable to load memories.             │
│        Please check your connection         │
│        and try again.                       │
│                                             │
│               [🔄 Retry]                    │
│                                             │
└─────────────────────────────────────────────┘
```

#### Search Error
```
┌─────────────────────────────────────────────┐
│                                             │
│                    ❌                       │
│                                             │
│            Search Error                     │
│                                             │
│        Something went wrong while           │
│        searching. Please try again.        │
│                                             │
│         [🔄 Try Again] [📝 Report]          │
│                                             │
└─────────────────────────────────────────────┘
```

## 📐 Spacing and Layout Guidelines

### Grid Specifications
```
Desktop Grid (3-4 columns):
┌───┐ ┌───┐ ┌───┐ ┌───┐
│   │ │   │ │   │ │   │  <- 24px gaps
└───┘ └───┘ └───┘ └───┘
  ^     ^     ^     ^
  │     │     │     └─ 300px min width
  │     │     └─ Flexible growth
  │     └─ Auto-fit layout
  └─ Container: max-width 1280px

Tablet Grid (2-3 columns):
┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │  <- 16px gaps
└─────┘ └─────┘ └─────┘

Mobile Grid (1 column):
┌───────────────────────┐
│                       │  <- 16px margins
│                       │
└───────────────────────┘
```

### Component Spacing
```
Card Internal Padding:
┌─────────────────────────┐
│ 24px                    │ <- Desktop: 24px
│    ┌─────────────┐      │    Mobile: 16px
│    │   Content   │      │
│    └─────────────┘      │
│                    24px │
└─────────────────────────┘

Section Spacing:
Header         ← 32px gap
Filters        ← 24px gap  
Content        ← 16px gap between cards
Footer         ← 48px gap
```

## 🎨 Interactive Elements

### Button States
```
Primary Button:
[    Normal    ]  <- Blue background
[   Hover 🎯   ]  <- Darker blue + slight elevation
[   Focus ⭕   ]  <- Blue outline ring
[ Loading ... ]  <- Spinner + disabled state
[   Disabled   ]  <- Gray + reduced opacity
```

### Form Elements
```
Input Field:
┌─────────────────────────┐  <- Normal: Gray border
│ Search memories...      │
└─────────────────────────┘

┌─────────────────────────┐  <- Focus: Blue border + ring
│ RAG systems|            │  
└─────────────────────────┘

┌─────────────────────────┐  <- Error: Red border
│ Invalid input           │  
└─────────────────────────┘
    ↑ Error message
```

### Checkbox States
```
☐ Unchecked     ← Gray border
☑️ Checked       ← Blue background + white checkmark  
⊟ Indeterminate ← Blue background + white dash
```

This comprehensive mockup documentation provides visual guidance for implementing the Knowledge RAG WebUI interface across all devices and interaction states.