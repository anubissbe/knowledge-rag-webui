# Bulk Operations Feature

## Overview

The Bulk Operations feature allows users to perform actions on multiple memory items simultaneously, significantly improving productivity when managing large collections of memories.

## Features

### 1. Selection Mode
- Toggle selection mode with the "Select Items" button
- Visual checkboxes appear on each memory card
- Selected items are highlighted with a primary color ring
- Navigation is disabled while in selection mode to prevent accidental navigation

### 2. Bulk Actions

#### Delete Multiple Items
- Select items and click "Delete" 
- Confirmation dialog prevents accidental deletions
- All selected items are removed at once

#### Add Tags to Multiple Items
- Select items and click "Tag"
- Enter comma-separated tags in the popup
- Tags are added to all selected items simultaneously

#### Move to Collection
- Select items and click "Move"
- Choose target collection from dropdown
- All selected items are moved to the chosen collection

#### Export Selected Items
- Select items and click "Export"
- Choose format: JSON, CSV, or Markdown
- Downloads a file containing only the selected memories

### 3. Selection Controls
- "Select all" link to quickly select all visible items
- Selection counter shows "X of Y selected"
- Clear selection with X button or by disabling selection mode

## Implementation Details

### State Management
The bulk operations state is managed by `bulkOperationsStore`:
- `selectedItems`: Set of selected memory IDs
- `isSelectionMode`: Boolean flag for selection mode
- Actions for toggling selection, selecting all, clearing, etc.

### Components

#### BulkOperationsToolbar
Main toolbar component that:
- Shows selection count
- Provides bulk action buttons
- Handles action execution with proper notifications

#### Enhanced MemoryCard
- Shows selection checkbox when in selection mode
- Prevents navigation clicks when selecting
- Visual feedback for selected state

### Integration
The feature integrates with:
- Memory store for data operations
- Collection store for move operations
- UI store for notifications
- React Query for cache invalidation

## Usage Example

```typescript
// Enable bulk operations
const { toggleSelectionMode } = useBulkOperationsStore();
toggleSelectionMode();

// Select items
const { toggleItemSelection } = useBulkOperationsStore();
toggleItemSelection('memory-id-1');
toggleItemSelection('memory-id-2');

// Perform bulk action
handleBulkDelete(['memory-id-1', 'memory-id-2']);
```

## Export Formats

### JSON Export
```json
[
  {
    "id": "1",
    "title": "Memory Title",
    "content": "Memory content...",
    "tags": ["tag1", "tag2"],
    "collection": "Collection Name",
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

### CSV Export
```csv
"Title","Content","Tags","Collection","Created","Updated"
"Memory Title","Memory content...","tag1;tag2","Collection Name","2024-01-15T00:00:00Z","2024-01-15T00:00:00Z"
```

### Markdown Export
```markdown
# Memory Title

Memory content...

**Tags:** tag1, tag2
**Collection:** Collection Name
**Created:** 2024-01-15T00:00:00Z

---
```

## Keyboard Shortcuts

When bulk operations are enabled:
- `Space` - Toggle selection of focused item
- `Ctrl/Cmd + A` - Select all items (when implemented)
- `Delete` - Delete selected items
- `Escape` - Exit selection mode

## Best Practices

1. **Confirmation Dialogs**: Always confirm destructive actions
2. **Visual Feedback**: Clear indication of selected items
3. **Notifications**: Inform users of action results
4. **Performance**: Handle large selections efficiently
5. **Accessibility**: Keyboard navigation and screen reader support

## Future Enhancements

1. **Select All Functionality**: Implement proper select all with pagination support
2. **Bulk Edit**: Edit properties of multiple items at once
3. **Smart Selection**: Select by criteria (date range, tags, etc.)
4. **Undo/Redo**: Ability to undo bulk operations
5. **Batch Processing**: Progress indicators for large operations
6. **Saved Selections**: Save and reuse selection criteria