# Progressive Web App (PWA) Features

Knowledge RAG WebUI now includes comprehensive Progressive Web App features for enhanced user experience.

## 🚀 Features

### 1. Installation Support
- **Desktop**: Install prompt appears after 10 seconds of usage
- **Mobile**: Native install support for Android devices
- **iOS**: Instructions for "Add to Home Screen" functionality
- **Persistent dismissal**: Won't prompt again after dismissing

### 2. Offline Functionality
- **Service Worker**: Caches all static assets for offline access
- **Cache Strategies**:
  - Static assets: Cache-first for instant loading
  - API calls: Network-first with 5-minute cache fallback
  - Fonts: Long-term caching (1 year)
- **Offline Indicator**: Visual notification when connection is lost
- **Auto-recovery**: Notification when connection is restored

### 3. Update Management
- **Auto-detection**: Checks for app updates automatically
- **User notification**: Prompts to reload when new version available
- **Seamless updates**: Updates apply without data loss
- **Background sync**: Pending changes sync when online

## 📱 Platform-Specific Features

### Android
- Full PWA support with native install dialog
- App shortcuts for quick actions
- Standalone display mode
- Custom theme color

### iOS
- Add to Home Screen support
- Splash screen on launch
- Status bar customization
- Offline capability

### Desktop
- Native window controls
- Desktop shortcuts
- File system integration (future)
- Protocol handling (future)

## 🛠️ Technical Implementation

### Service Worker Configuration
```javascript
// Cache strategies
- CacheFirst: Fonts, images, static assets
- NetworkFirst: API calls with fallback
- StaleWhileRevalidate: Non-critical resources
```

### Manifest Configuration
- App name and icons
- Theme and background colors
- Display mode: standalone
- Orientation: portrait
- App shortcuts

### Offline Detection
- Real-time connection monitoring
- Visual indicators
- Graceful degradation
- Queue for offline actions

## 🧪 Testing PWA Features

### Installation
1. Open the app in Chrome/Edge
2. Wait 10 seconds for install prompt
3. Click "Install" button
4. App opens in standalone window

### Offline Mode
1. Install the app first
2. Turn off network connection
3. Navigate through the app
4. Notice offline indicator
5. Turn network back on
6. See "Back online" notification

### Updates
1. Make changes to the app
2. Build and deploy
3. Refresh installed app
4. See update notification
5. Click "Reload" to update

## 📊 Performance Benefits

- **Faster Loading**: Cached assets load instantly
- **Reduced Data**: Only new content downloaded
- **Reliability**: Works even with poor connectivity
- **Native Feel**: Launches like native app
- **Background Sync**: Actions complete when online

## 🔧 Configuration

### Customizing Install Prompt
```typescript
// Modify timing in PWAInstallPrompt.tsx
setTimeout(() => {
  setShowInstallPrompt(true);
}, 10000); // Change delay here
```

### Cache Duration
```typescript
// In vite.config.ts
maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
```

### Offline Pages
Future enhancement: Add custom offline pages for better UX.

## 🚦 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Install | ✅ | ✅ | ❌ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Updates | ✅ | ✅ | ✅ | ✅ |
| iOS PWA | ✅ | ❌ | ✅ | ✅ |

## 📈 Future Enhancements

1. **Background Sync**: Queue and sync data changes
2. **Push Notifications**: Real-time updates
3. **File System Access**: Direct file operations
4. **Share Target**: Receive shared content
5. **Periodic Sync**: Background data refresh
6. **Custom Offline Pages**: Better offline UX
7. **App Badging**: Notification badges
8. **Web Share**: Native sharing capabilities