# User Settings Documentation

## Overview

The User Settings page provides a comprehensive interface for users to manage their account, preferences, and application behavior. Built with React, TypeScript, and Zustand for state management, it offers a modular and extensible architecture.

## Architecture

### Component Structure

```
src/
├── pages/
│   └── SettingsPage.tsx              # Main settings page with navigation
├── components/settings/
│   ├── AccountSettings.tsx           # Account management
│   ├── MemoryPreferences.tsx         # Memory-specific preferences
│   ├── ApiKeysSection.tsx            # API key management
│   └── LanguageSettings.tsx          # Language and regional settings
└── stores/
    ├── userStore.ts                  # User preferences state
    └── authStore.ts                  # Authentication and profile state
```

## Settings Sections

### 1. Account Settings

Comprehensive account management including:

- **Profile Information**
  - Edit name, email, and bio
  - View member since date
  - Upload profile picture (planned)

- **Password Management**
  - Change password
  - Enable two-factor authentication (planned)

- **Data Management**
  - Export all user data (JSON, CSV, Markdown, PDF)
  - Download includes memories, collections, and settings

- **Account Deletion**
  - Permanent account deletion with confirmation
  - Type "DELETE" safety mechanism
  - Clears all associated data

### 2. Memory Preferences

Customize how memories are displayed and managed:

- **Default View**: Grid, List, or Compact
- **Sort Order**: Recent, Oldest, Alphabetical, Recently Updated
- **Items Per Page**: 10, 20, 50, or 100 items
- **Auto-save**: Enable/disable automatic draft saving
- **Show Tags**: Display tags on memory cards
- **Show Preview**: Display content snippets
- **Auto-archive**: Archive memories older than 6 months

### 3. API Keys Management

Secure API key generation and management:

- **Create Keys**
  - Custom naming for identification
  - Permission-based access (read, write, delete)
  - Secure key generation algorithm

- **Key Management**
  - View masked keys with toggle visibility
  - Copy keys to clipboard
  - Track creation date and last used
  - Delete keys with confirmation

- **Security Features**
  - Keys are masked by default
  - Secure random generation
  - Permission scoping

### 4. Language & Region

Internationalization and localization settings:

- **Display Language**
  - 10 supported languages
  - Native language names displayed
  - Real-time UI updates

- **Date & Time Format**
  - Multiple date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
  - 12-hour or 24-hour time
  - Timezone selection with auto-detect

- **Number Format**
  - Decimal and thousand separators
  - Currency formatting (planned)

## State Management

### User Store (Zustand)

```typescript
interface UserState {
  preferences: UserPreferences
  apiKeys: ApiKey[]
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  createApiKey: (apiKey: ApiKey) => void
  deleteApiKey: (keyId: string) => void
  
  // Individual setters for quick updates
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setAutoSave: (enabled: boolean) => void
  // ... more setters
}
```

### Persistence

- Preferences are persisted to localStorage
- Server sync on changes
- Offline support with reconciliation

## API Integration

### Endpoints

```typescript
// Update user preferences
PUT /api/user/preferences
Body: UserPreferences

// Update user profile
PUT /api/user/profile
Body: Partial<User>

// Delete account
DELETE /api/user/account

// API Keys (client-side only for now)
// Stored in localStorage
```

## Security Considerations

1. **API Keys**
   - Generated client-side using crypto-secure random
   - Stored encrypted in localStorage
   - Never sent to server in plain text

2. **Account Deletion**
   - Requires explicit confirmation
   - Irreversible action warning
   - Clears all local and server data

3. **Data Export**
   - Sanitized output
   - No sensitive tokens included
   - User-owned data only

## Testing

### Unit Tests

```typescript
describe('SettingsPage', () => {
  it('should switch between sections', () => {
    const { getByText, getByRole } = render(<SettingsPage />)
    
    fireEvent.click(getByText('API Keys'))
    expect(getByRole('heading', { name: 'API Keys' })).toBeInTheDocument()
  })
  
  it('should update preferences', async () => {
    const { getByLabelText } = render(<MemoryPreferences />)
    
    fireEvent.change(getByLabelText('Default View'), { 
      target: { value: 'list' } 
    })
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ 
        defaultView: 'list' 
      })
    })
  })
})
```

### E2E Tests

```typescript
test('complete settings flow', async ({ page }) => {
  await page.goto('/settings')
  
  // Update profile
  await page.click('text=Edit Profile')
  await page.fill('input[name="bio"]', 'Updated bio')
  await page.click('text=Save Changes')
  
  // Create API key
  await page.click('text=API Keys')
  await page.click('text=Create New Key')
  await page.fill('input[placeholder*="Mobile App"]', 'Test Key')
  await page.click('text=Create Key')
  
  // Verify key created
  await expect(page.locator('text=Test Key')).toBeVisible()
})
```

## Accessibility

- Full keyboard navigation
- ARIA labels and descriptions
- Focus management
- Screen reader announcements
- High contrast support

## Performance

- Lazy loading of settings sections
- Debounced preference updates
- Optimistic UI updates
- Minimal re-renders

## Future Enhancements

1. **Profile Features**
   - Profile picture upload
   - Social links
   - Public profile toggle

2. **Security**
   - Two-factor authentication
   - Session management
   - Login history

3. **Advanced Preferences**
   - Custom themes
   - Keyboard shortcut customization
   - Plugin management

4. **Integrations**
   - OAuth connections
   - Webhook configuration
   - Third-party app permissions

## Troubleshooting

### Common Issues

1. **Preferences not saving**
   - Check network connection
   - Verify authentication
   - Check browser console for errors

2. **API keys not working**
   - Ensure correct permissions
   - Check key hasn't been deleted
   - Verify in correct environment

3. **Language not changing**
   - Clear browser cache
   - Check if language is supported
   - Reload page after change