#!/usr/bin/env node

/**
 * Manual UI Testing Script for Knowledge RAG Web UI
 * 
 * This script provides specific UI tests that require manual verification
 * in the browser, including responsive design, form validation, and component interactions.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ManualUITester {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.testResults = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levels = {
      info: '\x1b[36m',
      success: '\x1b[32m', 
      warning: '\x1b[33m',
      error: '\x1b[31m',
      bold: '\x1b[1m'
    };
    console.log(`${levels[level]}[${timestamp}] ${message}\x1b[0m`);
  }

  generateTestInstructions() {
    const instructions = `
# Manual UI Testing Instructions for Knowledge RAG Web UI

## Test Environment
- Application URL: ${this.baseUrl}
- Browser: Chrome/Firefox/Safari (test in multiple browsers)
- Screen Sizes: Desktop (1920x1080), Tablet (768x1024), Mobile (375x812)

## 🧪 Test Cases

### 1. Layout and Navigation Tests

#### Test 1.1: Header Component
✅ **Expected Behavior:**
- Search bar is visible and functional
- Theme toggle button (moon/sun icon) works
- User menu dropdown opens on click
- User menu contains profile info and sign-out option

**Steps:**
1. Navigate to ${this.baseUrl}
2. Verify search bar placeholder text: "Search memories..."
3. Click theme toggle - verify dark/light mode switch
4. Click user avatar - verify dropdown menu appears
5. Click outside dropdown - verify it closes

#### Test 1.2: Sidebar Navigation
✅ **Expected Behavior:**
- Logo "Knowledge RAG" is visible
- All navigation items are present and clickable
- Active navigation state is highlighted
- "New Memory" button is prominent
- Sidebar can be collapsed/expanded on desktop
- Mobile hamburger menu works

**Steps:**
1. Verify all menu items: Home, Memories, Search, Collections, Knowledge Graph, Analytics
2. Click each menu item - verify navigation works
3. Check active state highlighting
4. Test collapse/expand functionality (desktop)
5. Test mobile menu (resize to mobile view)

#### Test 1.3: Responsive Design
✅ **Expected Behavior:**
- Layout adapts to different screen sizes
- Sidebar becomes overlay on mobile
- Header adjusts appropriately
- Content remains readable at all sizes

**Steps:**
1. Test at 1920x1080 (desktop)
2. Test at 768x1024 (tablet)  
3. Test at 375x812 (mobile)
4. Verify touch interactions work on mobile

### 2. Memory Management Tests

#### Test 2.1: Memories List View
✅ **Expected Behavior:**
- Mock memories are displayed in grid/list layout
- Layout toggle (grid/list) works
- Filtering by collection works
- Sorting options work
- Memory cards show title, preview, tags, collection, date

**Steps:**
1. Navigate to ${this.baseUrl}/memories
2. Verify 3 mock memories are displayed
3. Test grid/list layout toggle
4. Test collection filter dropdown
5. Test sorting options
6. Verify memory card information display

#### Test 2.2: Memory Creation
✅ **Expected Behavior:**
- Memory editor loads with empty form
- All form fields are present and functional
- Markdown editor works
- Form validation prevents submission with empty required fields
- Tags can be added/removed
- Metadata can be added/removed

**Steps:**
1. Navigate to ${this.baseUrl}/memories/new
2. Verify form fields: Title, Collection, Content, Tags, Metadata
3. Test markdown editor functionality
4. Try submitting empty form - verify validation errors
5. Add/remove tags and metadata
6. Fill form and submit - verify success behavior

#### Test 2.3: Memory Detail View
✅ **Expected Behavior:**
- Memory content renders as markdown
- Metadata is displayed properly
- Action buttons (edit, share, delete) work
- Entities section shows extracted entities
- Navigation back to memories list works

**Steps:**
1. Navigate to ${this.baseUrl}/memories/1
2. Verify content renders with markdown formatting
3. Check metadata display
4. Test action buttons
5. Verify entities section
6. Test "Back to Memories" link

#### Test 2.4: Memory Editing
✅ **Expected Behavior:**
- Form pre-fills with existing memory data
- All editing functionality works
- Save/cancel buttons work appropriately

**Steps:**
1. Navigate to ${this.baseUrl}/memories/1/edit
2. Verify form is pre-filled with memory data
3. Make changes and save
4. Test cancel functionality

### 3. UI Components Tests

#### Test 3.1: Theme Switching
✅ **Expected Behavior:**
- Dark/light themes switch properly
- All components respect theme
- CSS variables update correctly
- Markdown editor adapts to theme

**Steps:**
1. Start in light mode
2. Toggle to dark mode - verify all components change
3. Toggle back to light mode
4. Test theme in different pages/components

#### Test 3.2: Form Validation
✅ **Expected Behavior:**
- Required field validation works
- Error messages are clear and helpful
- Form prevents submission when invalid
- Success states work properly

**Steps:**
1. Test memory creation form validation
2. Try various invalid inputs
3. Verify error message display
4. Test successful form submission

#### Test 3.3: Loading States
✅ **Expected Behavior:**
- Loading spinners show during async operations
- Skeleton loaders show for memory lists
- Buttons show loading states when appropriate

**Steps:**
1. Observe loading states during navigation
2. Check memory list skeleton loaders
3. Test form submission loading states

### 4. Interactive Features Tests

#### Test 4.1: Search Functionality
✅ **Expected Behavior:**
- Search bar accepts input
- Keyboard shortcut (Cmd/Ctrl+K) works
- Search placeholder shows

**Steps:**
1. Click in search bar
2. Type search query
3. Test keyboard shortcut

#### Test 4.2: Memory Actions
✅ **Expected Behavior:**
- Memory card hover effects work
- Action dropdowns function (though hidden in current implementation)
- Delete confirmation dialogs work
- Share functionality triggers

**Steps:**
1. Hover over memory cards
2. Test available actions
3. Verify confirmation dialogs

### 5. Performance and Accessibility

#### Test 5.1: Performance
✅ **Expected Behavior:**
- Page loads quickly
- Navigation is smooth
- No layout shifts
- Images/icons load properly

#### Test 5.2: Accessibility
✅ **Expected Behavior:**
- Keyboard navigation works
- Screen reader friendly
- Proper ARIA labels
- Color contrast is adequate

**Steps:**
1. Navigate using only keyboard
2. Test with screen reader
3. Check color contrast in both themes

## 🐛 Issues to Look For

### Critical Issues
- [ ] App crashes or fails to load
- [ ] TypeScript compilation errors in browser console
- [ ] Routing not working
- [ ] Forms not submitting
- [ ] Theme switching broken

### Minor Issues  
- [ ] Visual inconsistencies
- [ ] Responsive design problems
- [ ] Missing hover states
- [ ] Accessibility concerns
- [ ] Performance issues

## 📝 Test Results

After completing manual testing, document findings:

### ✅ Working Features
- List working features here

### ❌ Issues Found
- List any issues discovered

### ⚠️ Recommendations
- List improvement suggestions

## 🔧 Testing Tools

### Browser DevTools
- Use React DevTools extension
- Check Console for errors
- Use Network tab for performance
- Use Lighthouse for accessibility/performance audit

### Responsive Testing
- Use browser responsive mode
- Test on actual devices if possible
- Check touch interactions

---

**Note:** This application currently uses mock data. All memory operations (create, edit, delete) are simulated and don't persist data.
`;

    return instructions;
  }

  async checkComponentFeatures() {
    this.log('🔍 Analyzing Component Features...', 'info');

    // Check for specific UI features in the code
    const features = {
      themeToggle: false,
      responsiveDesign: false,
      formValidation: false,
      markdownEditor: false,
      gridListToggle: false,
      filterSort: false,
      loadingStates: false,
      errorHandling: false
    };

    try {
      // Check Header for theme toggle
      const headerContent = readFileSync(join(__dirname, 'src/components/layout/Header.tsx'), 'utf8');
      features.themeToggle = headerContent.includes('toggleTheme') && headerContent.includes('isDarkMode');

      // Check Layout for responsive design
      const layoutContent = readFileSync(join(__dirname, 'src/components/layout/Layout.tsx'), 'utf8');
      features.responsiveDesign = layoutContent.includes('lg:') && layoutContent.includes('hidden');

      // Check MemoryEditor for form validation
      const editorContent = readFileSync(join(__dirname, 'src/components/memory/MemoryEditor.tsx'), 'utf8');
      features.formValidation = editorContent.includes('yupResolver') && editorContent.includes('errors');
      features.markdownEditor = editorContent.includes('MDEditor');

      // Check MemoriesPage for grid/list toggle
      const memoriesContent = readFileSync(join(__dirname, 'src/pages/MemoriesPage.tsx'), 'utf8');
      features.gridListToggle = memoriesContent.includes('layout') && memoriesContent.includes('LayoutGrid');
      features.filterSort = memoriesContent.includes('selectedCollection') && memoriesContent.includes('sortBy');

      // Check for loading states
      features.loadingStates = memoriesContent.includes('isLoading') && memoriesContent.includes('animate-pulse');

      // Check for error handling
      features.errorHandling = editorContent.includes('errors.') && memoriesContent.includes('error');

      this.log('📊 Feature Analysis Complete:', 'success');
      Object.entries(features).forEach(([feature, implemented]) => {
        const status = implemented ? '✅' : '❌';
        this.log(`  ${status} ${feature}: ${implemented ? 'Implemented' : 'Not Found'}`, 
                 implemented ? 'success' : 'warning');
      });

      return features;
    } catch (error) {
      this.log(`❌ Error analyzing features: ${error.message}`, 'error');
      return features;
    }
  }

  async generateReport() {
    this.log('📋 Generating Manual UI Test Instructions...', 'bold');
    
    const instructions = this.generateTestInstructions();
    const features = await this.checkComponentFeatures();
    
    // Save instructions to file
    const fs = await import('fs');
    const instructionsPath = join(__dirname, 'MANUAL_UI_TESTING.md');
    fs.writeFileSync(instructionsPath, instructions);
    
    this.log(`📄 Test instructions saved to: ${instructionsPath}`, 'success');
    
    return {
      instructionsPath,
      features,
      testUrl: this.baseUrl
    };
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ManualUITester();
  tester.generateReport()
    .then(result => {
      console.log('\n🎯 Manual UI Testing Setup Complete!');
      console.log(`📖 Instructions: ${result.instructionsPath}`);
      console.log(`🌐 Test URL: ${result.testUrl}`);
      console.log('\n💡 Next steps:');
      console.log('1. Open the application in your browser');
      console.log('2. Follow the test instructions in MANUAL_UI_TESTING.md');  
      console.log('3. Document any issues found');
    })
    .catch(error => {
      console.error('❌ Failed to generate test instructions:', error);
    });
}

export default ManualUITester;