# Memory Versioning System

The Memory Versioning system provides comprehensive version history tracking, comparison, and restoration capabilities for all memories in the Knowledge RAG WebUI.

## Overview

Every memory edit automatically creates a new version with complete audit trail, enabling users to:
- View complete version history with metadata
- Compare any two versions side-by-side with detailed diffs
- Restore to any previous version while maintaining history integrity
- Track all changes with user attribution and timestamps

## Architecture

### Backend Components

#### MemoryVersion Model (`backend/src/models/MemoryVersion.ts`)
```typescript
interface MemoryVersion {
  id: string;
  memoryId: string;
  version: number;
  title: string;
  content: string;
  contentType: 'text' | 'markdown' | 'code' | 'link';
  summary?: string;
  tags: string[];
  metadata: MemoryVersionMetadata;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  userId: string;
  createdAt: string;
  createdBy: string;
}
```

#### Database Service Methods (`backend/src/services/database.ts`)
- `createMemoryVersion()` - Create new version on memory updates
- `getMemoryVersions()` - Retrieve paginated version history
- `getMemoryVersion()` - Get specific version details
- `compareMemoryVersions()` - Generate detailed comparison between versions
- `restoreMemoryVersion()` - Restore memory to previous version

#### API Endpoints (`backend/src/routes/memoryVersions.ts`)
- `GET /api/v1/memories/:id/versions` - List version history
- `GET /api/v1/memories/:id/versions/:version` - Get specific version
- `GET /api/v1/memories/:id/versions/:from/compare/:to` - Compare versions
- `POST /api/v1/memories/:id/versions/:version/restore` - Restore version

### Frontend Components

#### MemoryVersionHistory (`src/components/memory/MemoryVersionHistory.tsx`)
Timeline component displaying all versions with:
- Version number and change type indicators
- Created date and user attribution
- Changed fields summary
- Quick actions (view, restore, compare)
- Pagination support for large histories

#### MemoryVersionViewer (`src/components/memory/MemoryVersionViewer.tsx`)
Modal component for viewing specific versions with:
- Complete version metadata display
- Full content rendering with syntax highlighting
- Version comparison selector
- Restore functionality with confirmation

#### MemoryVersionComparison (`src/components/memory/MemoryVersionComparison.tsx`)
Side-by-side comparison component featuring:
- Field-by-field diff visualization
- Added/removed/modified content highlighting
- Summary statistics of changes
- Export comparison functionality

### Integration

The versioning system is seamlessly integrated into the memory detail page (`src/pages/MemoryDetail.tsx`) with:
- Version history sidebar toggle
- Current version indicator
- Quick access to versioning operations
- Real-time updates via WebSocket

## Features

### Automatic Version Creation
- Every memory update automatically creates a new version
- Initial memory creation creates version 1
- Version numbers increment sequentially
- Complete change tracking with field-level granularity

### Version Comparison
```typescript
interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

interface MemoryVersionComparison {
  memoryId: string;
  fromVersion: number;
  toVersion: number;
  differences: VersionDiff[];
  summary: {
    totalChanges: number;
    fieldsChanged: string[];
    addedContent: number;
    removedContent: number;
  };
}
```

### Version Restoration
- Restore to any previous version
- Creates new version (doesn't overwrite history)
- Maintains complete audit trail
- User attribution for restoration action

### Change Tracking
Tracks changes across all memory fields:
- `title` - Memory title changes
- `content` - Content modifications
- `summary` - Summary updates
- `tags` - Tag additions/removals
- `contentType` - Content type changes
- `metadata` - Metadata modifications

## Usage Examples

### Backend API Usage

```bash
# Get version history
curl -H "Authorization: Bearer <token>" \
  http://localhost:5002/api/v1/memories/{id}/versions

# Get specific version
curl -H "Authorization: Bearer <token>" \
  http://localhost:5002/api/v1/memories/{id}/versions/2

# Compare versions
curl -H "Authorization: Bearer <token>" \
  http://localhost:5002/api/v1/memories/{id}/versions/1/compare/3

# Restore version
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"changeDescription": "Restored to fix formatting"}' \
  http://localhost:5002/api/v1/memories/{id}/versions/2/restore
```

### Frontend Integration

```typescript
// Import versioning components
import MemoryVersionHistory from '../components/memory/MemoryVersionHistory';
import MemoryVersionViewer from '../components/memory/MemoryVersionViewer';
import MemoryVersionComparison from '../components/memory/MemoryVersionComparison';

// Use in memory detail component
<MemoryVersionHistory
  memoryId={memory.id}
  currentVersion={memory.version}
  onVersionRestore={(version) => handleVersionRestore(version)}
  onVersionView={setViewingVersion}
/>
```

## UI/UX Design

### Version History Timeline
- Chronological list with newest versions first
- Color-coded change type indicators:
  - Green: Created (initial version)
  - Blue: Updated (content changes)
  - Orange: Restored (from previous version)
- Compact metadata display with expand options
- Quick action buttons for common operations

### Version Comparison
- Split-pane layout for side-by-side viewing
- Syntax highlighting for different content types
- Diff highlighting with semantic colors:
  - Green background: Added content
  - Red background: Removed content
  - Yellow background: Modified content
- Summary statistics at the top

### Responsive Design
- Mobile-optimized with collapsible sections
- Touch-friendly action buttons (44px minimum)
- Swipe gestures for version navigation
- Adaptive layout for different screen sizes

## Performance Considerations

### Database Optimization
- Efficient indexing on `memoryId` and `version` fields
- Pagination for large version histories
- Lazy loading of version content
- Cached comparison results

### Frontend Optimization
- Virtual scrolling for large version lists
- Code splitting for versioning components
- Memoized comparison calculations
- Debounced version loading

## Security

### Authentication
- All versioning endpoints require JWT authentication
- User can only access versions of their own memories
- Version restoration requires memory edit permissions

### Data Validation
- Input validation on all API endpoints
- Sanitization of version metadata
- Protection against version tampering

## Error Handling

### Backend Errors
- Graceful handling of missing versions
- Validation error responses
- Database constraint violations
- Authentication failures

### Frontend Error Recovery
- Loading states for all async operations
- Error boundaries for version components
- Fallback UI for failed operations
- User-friendly error messages

## Testing

### Backend Testing
```bash
# Run version-specific tests
npm test -- --grep "memory versioning"

# Test API endpoints
npm run test:api -- versioning
```

### Frontend Testing
```bash
# Test version components
npm test src/components/memory/MemoryVersion*

# E2E versioning tests
npm run test:e2e -- tests/e2e/memory-versioning.spec.ts
```

### Test Coverage
- Unit tests for all versioning functions
- Integration tests for API endpoints
- E2E tests for complete user workflows
- Performance tests for large version histories

## Future Enhancements

### Planned Features
- Branch versioning for collaborative editing
- Version labels and annotations
- Automated version cleanup policies
- Export version history as PDF/JSON
- Version merge conflict resolution

### Performance Improvements
- Delta storage for content changes
- Compressed version storage
- Background version cleanup
- Version history caching

## Troubleshooting

### Common Issues

**Version History Not Loading**
- Check authentication token validity
- Verify memory exists and user has access
- Check network connectivity
- Review browser console for errors

**Version Restoration Fails**
- Ensure user has edit permissions
- Check version exists and is accessible
- Verify API endpoints are responding
- Review server logs for detailed errors

**Comparison Not Working**
- Verify both versions exist
- Check version numbers are valid
- Ensure sufficient memory for diff calculation
- Review console for JavaScript errors

### Performance Issues
- Large version histories may load slowly
- Use pagination parameters to limit results
- Consider version cleanup for old memories
- Monitor memory usage during comparisons

## Configuration

### Environment Variables
```env
# Backend configuration
VERSION_RETENTION_DAYS=365  # Auto-cleanup old versions
MAX_VERSIONS_PER_MEMORY=100 # Limit version history size
ENABLE_VERSION_COMPRESSION=true # Compress stored versions
```

### Frontend Configuration
```typescript
// src/config/versioning.ts
export const versioningConfig = {
  maxVersionsToLoad: 50,
  enableRealTimeUpdates: true,
  showVersionPreview: true,
  autoSaveComparisons: false
};
```

This comprehensive versioning system ensures complete audit trails, user-friendly version management, and robust data integrity for all memory operations in the Knowledge RAG WebUI.