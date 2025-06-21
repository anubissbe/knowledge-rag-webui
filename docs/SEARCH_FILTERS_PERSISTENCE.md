# Search Filters Persistence

## Overview

The Search Filters Persistence feature allows authenticated users to automatically save and restore their search filter preferences across sessions. This improves user experience by maintaining personalized search configurations.

## Features

- **Automatic Persistence**: Search filters are automatically saved 1 second after changes
- **User-Specific**: Each user's preferences are stored separately and securely
- **Session Restoration**: Filters are restored when user returns to search page
- **Authentication Required**: Feature only works for logged-in users
- **Smart Loading**: URL parameters take precedence over saved preferences

## Architecture

### Backend Implementation

#### API Endpoints

**GET /api/v1/preferences/search**
- Retrieves user's saved search preferences
- Requires: Bearer token authentication
- Returns: `{ preferences: SearchPreferences | null }`

**PUT /api/v1/preferences/search**
- Saves user's search filter preferences
- Requires: Bearer token authentication
- Body: `{ filters: SearchFilters }`
- Returns: `{ message: string, preferences: SearchPreferences }`

#### Data Schema

```typescript
interface SearchFilters {
  tags: string[];
  entities: string[];
  collections: string[];
  dateRange: string;
  contentType: string;
  sortBy: 'relevance' | 'date' | 'title';
}

interface SearchPreferences {
  filters: SearchFilters;
  savedAt: string;
}
```

#### Database Integration

- Extended `User.preferences` schema to include optional `search` field
- Added `updateUser` method to database service
- Preferences stored in in-memory database with user isolation

### Frontend Implementation

#### State Management

- Extended `AuthContext` User interface to include search preferences
- Created `preferencesApi` service for backend communication
- Added debounced saving logic to prevent excessive API calls

#### User Experience

- Filters load automatically on Search page mount
- Changes save silently in background after 1-second delay
- URL parameters override saved preferences for sharing
- Graceful fallback for unauthenticated users

## Security

- All API endpoints require JWT authentication
- User preferences are isolated and cannot access other users' data
- Input validation prevents malicious filter data
- No sensitive information stored in preferences

## File Organization

```
backend/src/
├── routes/preferences.ts        # API endpoints
├── models/User.ts              # Extended user schema
└── services/database.ts        # Database operations

src/
├── services/api/preferencesApi.ts  # Frontend API client
├── contexts/AuthContext.tsx       # Extended user interface
├── pages/Search.tsx               # Implementation integration
└── components/search/SearchFilters.tsx  # UI components

docs/
└── SEARCH_FILTERS_PERSISTENCE.md  # This documentation

tests/e2e/
└── search-filters-persistence.spec.ts  # E2E test coverage
```

## Testing

### Manual Testing ✅

- API endpoints tested with curl commands
- Login/logout flow verified
- Filter persistence across page refreshes confirmed
- Authentication-only access verified

### E2E Testing ✅

- Created comprehensive test suite
- Tests filter saving and loading
- Validates API endpoint security
- Verifies user-specific data isolation

### Test Coverage

- ✅ Save filter preferences
- ✅ Load saved preferences on page mount
- ✅ Authentication required for all operations
- ✅ Invalid data rejection
- ✅ User-specific preference isolation
- ✅ Debounced saving behavior

## Usage

### For Users

1. Login to your account
2. Navigate to Search page
3. Apply desired filters (tags, date range, content type, sort order)
4. Filters automatically save after 1 second
5. Return to Search page later - filters are restored

### For Developers

```typescript
// Save preferences
await preferencesApi.saveSearchPreferences(filters);

// Load preferences
const preferences = await preferencesApi.getSearchPreferences();
```

## Performance

- **Debounced Saving**: 1-second delay prevents excessive API calls
- **Efficient Loading**: Single API call on component mount
- **Minimal Overhead**: Only saves when filters actually change
- **Memory Efficient**: No persistent local storage, relies on backend

## Limitations

- Requires user authentication
- Preferences not shared between devices (user-specific, not device-specific)
- No versioning of preference changes
- Limited to current search filter schema

## Future Enhancements

- Multiple saved filter sets with names
- Preference sharing between users
- Export/import of preferences
- Advanced preference analytics
- Preference version history

## Troubleshooting

### Filters Not Saving
- Verify user is logged in
- Check browser console for authentication errors
- Ensure backend server is running

### Filters Not Loading
- Check if user has previously saved preferences
- Verify API connectivity
- Clear browser cache if issues persist

### Performance Issues
- Debouncing prevents excessive API calls
- Check network tab for request frequency
- Monitor server logs for database performance

## Version History

- **v1.0.0** (2025-06-21): Initial implementation with basic filter persistence
  - Backend API endpoints
  - Frontend integration
  - E2E test coverage
  - Documentation