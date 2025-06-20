#!/usr/bin/env node

/**
 * Detailed Code Analysis for Knowledge RAG Web UI
 * 
 * This script performs deep analysis of the codebase to identify potential issues,
 * verify implementation patterns, and check for best practices.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DetailedAnalyzer {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.successes = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m', 
      error: '\x1b[31m',
      bold: '\x1b[1m'
    };
    console.log(`${colors[type]}${message}\x1b[0m`);
  }

  addIssue(component, issue, severity = 'medium') {
    this.issues.push({ component, issue, severity });
  }

  addRecommendation(component, recommendation) {
    this.recommendations.push({ component, recommendation });
  }

  addSuccess(component, success) {
    this.successes.push({ component, success });
  }

  analyzeComponent(filePath, componentName) {
    try {
      const content = readFileSync(join(__dirname, filePath), 'utf8');
      this.log(`🔍 Analyzing ${componentName}...`, 'info');
      
      // Check for React best practices
      this.checkReactBestPractices(content, componentName);
      
      // Check for TypeScript usage
      this.checkTypeScriptUsage(content, componentName);
      
      // Check for accessibility
      this.checkAccessibility(content, componentName);
      
      // Check for performance considerations
      this.checkPerformance(content, componentName);
      
      // Component-specific checks
      if (componentName.includes('Header')) {
        this.analyzeHeader(content, componentName);
      } else if (componentName.includes('Sidebar')) {
        this.analyzeSidebar(content, componentName);
      } else if (componentName.includes('MemoryEditor')) {
        this.analyzeMemoryEditor(content, componentName);
      } else if (componentName.includes('MemoryList')) {
        this.analyzeMemoryList(content, componentName);
      }
      
    } catch (error) {
      this.addIssue(componentName, `Failed to read file: ${error.message}`, 'high');
    }
  }

  checkReactBestPractices(content, componentName) {
    // Check for proper imports
    if (!content.includes("import { type FC")) {
      this.addIssue(componentName, "Missing proper React FC import", 'low');
    } else {
      this.addSuccess(componentName, "Uses proper React FC typing");
    }

    // Check for useState usage
    if (content.includes('useState') && content.includes('const [')) {
      this.addSuccess(componentName, "Proper useState destructuring");
    }

    // Check for useEffect cleanup
    if (content.includes('useEffect') && !content.includes('return')) {
      this.addRecommendation(componentName, "Consider cleanup in useEffect if needed");
    }

    // Check for key props in lists
    if (content.includes('.map(') && content.includes('key=')) {
      this.addSuccess(componentName, "Proper key props in mapped lists");
    } else if (content.includes('.map(') && !content.includes('key=')) {
      this.addIssue(componentName, "Missing key props in mapped elements", 'medium');
    }
  }

  checkTypeScriptUsage(content, componentName) {
    // Check for interface definitions
    if (content.includes('interface ') && content.includes('Props')) {
      this.addSuccess(componentName, "Proper TypeScript interface definitions");
    }

    // Check for proper typing
    if (content.includes(': FC<') || content.includes(': React.FC<')) {
      this.addSuccess(componentName, "Proper component typing");
    }

    // Check for any types
    if (content.includes(': any')) {
      this.addIssue(componentName, "Uses 'any' type - consider more specific typing", 'low');
    }

    // Check for proper event typing
    if (content.includes('onClick') && content.includes('React.MouseEvent')) {
      this.addSuccess(componentName, "Proper event typing");
    }
  }

  checkAccessibility(content, componentName) {
    // Check for aria-label usage
    if (content.includes('aria-label')) {
      this.addSuccess(componentName, "Uses aria-label for accessibility");
    }

    // Check for semantic HTML
    if (content.includes('<button') || content.includes('<nav') || content.includes('<main')) {
      this.addSuccess(componentName, "Uses semantic HTML elements");
    }

    // Check for alt text on images
    if (content.includes('<img') && !content.includes('alt=')) {
      this.addIssue(componentName, "Missing alt text on images", 'medium');
    }

    // Check for proper heading hierarchy
    if (content.includes('<h1') || content.includes('<h2') || content.includes('<h3')) {
      this.addSuccess(componentName, "Uses proper heading elements");
    }
  }

  checkPerformance(content, componentName) {
    // Check for React.memo usage where appropriate
    if (content.includes('export const') && !content.includes('React.memo') && 
        (content.includes('props') || content.includes('Props'))) {
      this.addRecommendation(componentName, "Consider React.memo for performance if component re-renders frequently");
    }

    // Check for callback memoization
    if (content.includes('onClick') && !content.includes('useCallback')) {
      this.addRecommendation(componentName, "Consider useCallback for event handlers if passed to child components");
    }

    // Check for expensive operations in render
    if (content.includes('.filter(') || content.includes('.sort(') || content.includes('.map(')) {
      this.addRecommendation(componentName, "Consider useMemo for expensive computations");
    }
  }

  analyzeHeader(content, componentName) {
    // Check theme toggle implementation
    if (content.includes('toggleTheme') && content.includes('classList.add')) {
      this.addSuccess(componentName, "Theme toggle properly manipulates DOM classes");
    }

    // Check for search functionality
    if (content.includes('Search') && content.includes('input')) {
      this.addSuccess(componentName, "Search input is implemented");
    }

    // Check user menu implementation
    if (content.includes('isUserMenuOpen') && content.includes('setIsUserMenuOpen')) {
      this.addSuccess(componentName, "User menu state properly managed");
    }

    // Check for click outside functionality
    if (content.includes('fixed inset-0') && content.includes('onClick')) {
      this.addSuccess(componentName, "Click outside to close dropdown implemented");
    }
  }

  analyzeSidebar(content, componentName) {
    // Check navigation items
    if (content.includes('navItems') && content.includes('href')) {
      this.addSuccess(componentName, "Navigation items properly configured");
    }

    // Check active state
    if (content.includes('isActive') && content.includes('location.pathname')) {
      this.addSuccess(componentName, "Active navigation state implemented");
    }

    // Check mobile responsiveness
    if (content.includes('lg:') && content.includes('fixed') && content.includes('left-0')) {
      this.addSuccess(componentName, "Mobile responsive sidebar implemented");
    }

    // Check collapse functionality
    if (content.includes('isCollapsed') && content.includes('setIsCollapsed')) {
      this.addSuccess(componentName, "Sidebar collapse functionality implemented");
    }
  }

  analyzeMemoryEditor(content, componentName) {
    // Check form validation
    if (content.includes('yupResolver') && content.includes('schema')) {
      this.addSuccess(componentName, "Form validation with Yup implemented");
    }

    // Check markdown editor
    if (content.includes('MDEditor') && content.includes('Controller')) {
      this.addSuccess(componentName, "Markdown editor properly integrated with react-hook-form");
    }

    // Check tag management
    if (content.includes('addTag') && content.includes('removeTag')) {
      this.addSuccess(componentName, "Tag management functionality implemented");
    }

    // Check metadata management
    if (content.includes('addMetadata') && content.includes('removeMetadata')) {
      this.addSuccess(componentName, "Metadata management functionality implemented");
    }

    // Check form submission
    if (content.includes('handleSubmit') && content.includes('onSubmit')) {
      this.addSuccess(componentName, "Form submission properly handled");
    }

    // Check loading states
    if (content.includes('isLoading') && content.includes('disabled')) {
      this.addSuccess(componentName, "Loading states implemented");
    }
  }

  analyzeMemoryList(content, componentName) {
    // Check loading skeleton
    if (content.includes('animate-pulse') && content.includes('isLoading')) {
      this.addSuccess(componentName, "Loading skeleton implemented");
    }

    // Check layout switching
    if (content.includes('layout === \'grid\'') && content.includes('grid-cols')) {
      this.addSuccess(componentName, "Grid/list layout switching implemented");
    }

    // Check empty state
    if (content.includes('memories.length === 0')) {
      this.addSuccess(componentName, "Empty state handling implemented");
    }
  }

  analyzeRouting() {
    this.log('🛣️  Analyzing Routing Configuration...', 'info');
    
    try {
      const appContent = readFileSync(join(__dirname, 'src/App.tsx'), 'utf8');
      
      // Check for React Router setup
      if (appContent.includes('BrowserRouter') && appContent.includes('Routes')) {
        this.addSuccess('App', 'React Router properly configured');
      }

      // Check for route definitions
      const routes = [
        '/',
        '/memories',
        '/memories/new',
        '/memories/:id',
        '/memories/:id/edit',
        '/search',
        '/collections',
        '/graph',
        '/analytics',
        '/settings'
      ];

      routes.forEach(route => {
        if (appContent.includes(`path="${route}"`)) {
          this.addSuccess('App', `Route ${route} properly defined`);
        }
      });

      // Check for nested layout
      if (appContent.includes('<Layout>') && appContent.includes('<Routes>')) {
        this.addSuccess('App', 'Layout wrapper properly implemented');
      }

    } catch (error) {
      this.addIssue('App', `Failed to analyze routing: ${error.message}`, 'high');
    }
  }

  analyzeStateManagement() {
    this.log('🗄️  Analyzing State Management...', 'info');
    
    try {
      // Check React Query setup
      const appContent = readFileSync(join(__dirname, 'src/App.tsx'), 'utf8');
      if (appContent.includes('QueryClient') && appContent.includes('QueryClientProvider')) {
        this.addSuccess('App', 'React Query properly configured');
      }

      // Check for proper query configurations
      if (appContent.includes('staleTime') && appContent.includes('retry')) {
        this.addSuccess('App', 'React Query default options configured');
      }

      // Check pages for query usage
      const pagesWithQueries = [
        'src/pages/MemoriesPage.tsx',
        'src/pages/MemoryDetailPage.tsx',
        'src/pages/MemoryEditorPage.tsx'
      ];

      pagesWithQueries.forEach(pagePath => {
        try {
          const content = readFileSync(join(__dirname, pagePath), 'utf8');
          if (content.includes('useQuery') || content.includes('useMutation')) {
            this.addSuccess(pagePath, 'Uses React Query for data fetching');
          }
        } catch (error) {
          this.addIssue(pagePath, `Failed to analyze: ${error.message}`, 'medium');
        }
      });

    } catch (error) {
      this.addIssue('App', `Failed to analyze state management: ${error.message}`, 'high');
    }
  }

  analyzeStyling() {
    this.log('🎨 Analyzing Styling Implementation...', 'info');
    
    try {
      // Check Tailwind config
      const tailwindConfig = readFileSync(join(__dirname, 'tailwind.config.js'), 'utf8');
      if (tailwindConfig.includes('darkMode: \'class\'')) {
        this.addSuccess('Styling', 'Dark mode properly configured in Tailwind');
      }

      // Check CSS variables
      const cssContent = readFileSync(join(__dirname, 'src/index.css'), 'utf8');
      if (cssContent.includes('--primary:') && cssContent.includes('.dark')) {
        this.addSuccess('Styling', 'CSS custom properties for theming implemented');
      }

      // Check markdown editor styling
      if (cssContent.includes('.w-md-editor') && cssContent.includes('[data-color-mode="dark"]')) {
        this.addSuccess('Styling', 'Markdown editor theming implemented');
      }

      // Check for responsive utilities
      if (cssContent.includes('scrollbar-thin') && cssContent.includes('@layer utilities')) {
        this.addSuccess('Styling', 'Custom utility classes implemented');
      }

    } catch (error) {
      this.addIssue('Styling', `Failed to analyze styling: ${error.message}`, 'high');
    }
  }

  analyzeDataFlow() {
    this.log('📊 Analyzing Data Flow...', 'info');
    
    try {
      // Check types definition
      const typesContent = readFileSync(join(__dirname, 'src/types/index.ts'), 'utf8');
      
      const requiredTypes = [
        'Memory',
        'CreateMemoryDto',
        'UpdateMemoryDto',
        'SearchResult',
        'Entity',
        'Collection',
        'User'
      ];

      requiredTypes.forEach(type => {
        if (typesContent.includes(`interface ${type}`) || typesContent.includes(`type ${type}`)) {
          this.addSuccess('Types', `${type} interface properly defined`);
        }
      });

      // Check for proper DTO usage
      if (typesContent.includes('CreateMemoryDto') && typesContent.includes('UpdateMemoryDto')) {
        this.addSuccess('Types', 'Proper DTO pattern for API operations');
      }

    } catch (error) {
      this.addIssue('Types', `Failed to analyze data flow: ${error.message}`, 'high');
    }
  }

  checkForCommonAntiPatterns() {
    this.log('⚠️  Checking for Common Anti-patterns...', 'info');
    
    const filesToCheck = [
      'src/components/layout/Header.tsx',
      'src/components/layout/Sidebar.tsx',
      'src/components/memory/MemoryEditor.tsx',
      'src/pages/MemoriesPage.tsx'
    ];

    filesToCheck.forEach(filePath => {
      try {
        const content = readFileSync(join(__dirname, filePath), 'utf8');
        const fileName = filePath.split('/').pop();

        // Check for inline styles (should use Tailwind classes)
        if (content.includes('style={{') && !content.includes('backgroundColor: \'transparent\'')) {
          this.addIssue(fileName, 'Uses inline styles instead of Tailwind classes', 'low');
        }

        // Check for hardcoded values that should be configurable
        if (content.includes('localhost') || content.includes('http://')) {
          this.addRecommendation(fileName, 'Consider making URLs configurable');
        }

        // Check for missing error boundaries
        if (content.includes('throw') && !content.includes('try')) {
          this.addRecommendation(fileName, 'Consider error boundary or try-catch blocks');
        }

        // Check for proper event handler naming
        if (content.includes('onClick') && !content.includes('handle')) {
          this.addRecommendation(fileName, 'Consider consistent event handler naming (handle*)');
        }

      } catch (error) {
        this.addIssue(filePath, `Failed to check anti-patterns: ${error.message}`, 'medium');
      }
    });
  }

  generateReport() {
    this.log('\n📊 Generating Detailed Analysis Report...', 'bold');
    
    const components = [
      { path: 'src/components/layout/Header.tsx', name: 'Header' },
      { path: 'src/components/layout/Sidebar.tsx', name: 'Sidebar' },
      { path: 'src/components/layout/Layout.tsx', name: 'Layout' },
      { path: 'src/components/memory/MemoryEditor.tsx', name: 'MemoryEditor' },
      { path: 'src/components/memory/MemoryList.tsx', name: 'MemoryList' },
      { path: 'src/components/memory/MemoryCard.tsx', name: 'MemoryCard' },
      { path: 'src/pages/HomePage.tsx', name: 'HomePage' },
      { path: 'src/pages/MemoriesPage.tsx', name: 'MemoriesPage' }
    ];

    // Analyze each component
    components.forEach(({ path, name }) => {
      this.analyzeComponent(path, name);
    });

    // Analyze architecture
    this.analyzeRouting();
    this.analyzeStateManagement();
    this.analyzeStyling();
    this.analyzeDataFlow();
    this.checkForCommonAntiPatterns();

    // Generate summary
    this.log('\n📋 Analysis Summary', 'bold');
    this.log('═'.repeat(50), 'info');
    
    this.log(`\n✅ Successes: ${this.successes.length}`, 'success');
    this.log(`⚠️  Recommendations: ${this.recommendations.length}`, 'warning');
    this.log(`❌ Issues: ${this.issues.length}`, 'error');

    const highSeverityIssues = this.issues.filter(issue => issue.severity === 'high');
    if (highSeverityIssues.length > 0) {
      this.log(`🚨 High Severity Issues: ${highSeverityIssues.length}`, 'error');
    }

    // Detailed breakdown
    if (this.successes.length > 0) {
      this.log('\n✅ Successes:', 'success');
      this.successes.forEach(success => {
        this.log(`  • ${success.component}: ${success.success}`, 'success');
      });
    }

    if (this.recommendations.length > 0) {
      this.log('\n⚠️  Recommendations:', 'warning');
      this.recommendations.forEach(rec => {
        this.log(`  • ${rec.component}: ${rec.recommendation}`, 'warning');
      });
    }

    if (this.issues.length > 0) {
      this.log('\n❌ Issues:', 'error');
      this.issues.forEach(issue => {
        const severity = issue.severity === 'high' ? '🚨' : issue.severity === 'medium' ? '⚠️' : 'ℹ️';
        this.log(`  ${severity} ${issue.component}: ${issue.issue}`, 'error');
      });
    }

    return {
      successes: this.successes,
      recommendations: this.recommendations,
      issues: this.issues,
      summary: {
        successCount: this.successes.length,
        recommendationCount: this.recommendations.length,
        issueCount: this.issues.length,
        highSeverityIssues: highSeverityIssues.length
      }
    };
  }
}

// Run analysis if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new DetailedAnalyzer();
  const report = analyzer.generateReport();
  
  // Exit with error code if high severity issues found
  process.exit(report.summary.highSeverityIssues > 0 ? 1 : 0);
}

export default DetailedAnalyzer;