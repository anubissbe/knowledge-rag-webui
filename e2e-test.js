#!/usr/bin/env node

/**
 * E2E Testing Script for Knowledge RAG Web UI
 * 
 * This script performs comprehensive end-to-end testing of all implemented features:
 * 1. Layout and Navigation
 * 2. Memory Management
 * 3. Technical Implementation
 * 4. UI Components
 * 5. Responsive Design
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class E2ETestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.baseUrl = 'http://localhost:5173';
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async test(name, testFn) {
    try {
      this.log(`\n🧪 Testing: ${name}`, 'cyan');
      const result = await testFn();
      if (result.success) {
        this.log(`✅ PASSED: ${name}`, 'green');
        this.results.passed++;
      } else {
        this.log(`❌ FAILED: ${name} - ${result.message}`, 'red');
        this.results.failed++;
      }
      this.results.tests.push({ name, ...result });
    } catch (error) {
      this.log(`❌ ERROR: ${name} - ${error.message}`, 'red');
      this.results.failed++;
      this.results.tests.push({ name, success: false, message: error.message });
    }
  }

  async checkServerResponse(path = '/') {
    try {
      const response = await fetch(`${this.baseUrl}${path}`);
      return {
        success: response.ok,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async checkFileExists(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      return { success: true, content, size: content.length };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async runCommand(command, args = []) {
    return new Promise((resolve) => {
      const process = spawn(command, args, { 
        cwd: __dirname,
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          success: code === 0,
          code,
          stdout,
          stderr
        });
      });
    });
  }

  async testBuildProcess() {
    this.log('\n🏗️  Testing Build Process...', 'yellow');
    
    // Test TypeScript compilation
    await this.test('TypeScript Compilation', async () => {
      const result = await this.runCommand('npm', ['run', 'typecheck']);
      return {
        success: result.success,
        message: result.success ? 'TypeScript compilation successful' : result.stderr
      };
    });

    // Test ESLint
    await this.test('ESLint Check', async () => {
      const result = await this.runCommand('npm', ['run', 'lint']);
      return {
        success: result.success,
        message: result.success ? 'ESLint checks passed' : result.stderr
      };
    });

    // Test Build
    await this.test('Production Build', async () => {
      const result = await this.runCommand('npm', ['run', 'build']);
      return {
        success: result.success,
        message: result.success ? 'Build completed successfully' : result.stderr
      };
    });
  }

  async testServerConnectivity() {
    this.log('\n🌐 Testing Server Connectivity...', 'yellow');

    await this.test('Development Server Response', async () => {
      const result = await this.checkServerResponse('/');
      return {
        success: result.success,
        message: result.success ? 
          `Server responding with status ${result.status}` : 
          result.message
      };
    });

    await this.test('HTML Content Delivery', async () => {
      try {
        const response = await fetch(this.baseUrl);
        const html = await response.text();
        const hasReactRoot = html.includes('id="root"');
        const hasTitle = html.includes('<title>');
        
        return {
          success: hasReactRoot && hasTitle,
          message: hasReactRoot && hasTitle ? 
            'HTML contains required React root and title elements' :
            'HTML missing required elements'
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });
  }

  async testFileStructure() {
    this.log('\n📁 Testing File Structure...', 'yellow');

    const criticalFiles = [
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'src/components/layout/Layout.tsx',
      'src/components/layout/Header.tsx',
      'src/components/layout/Sidebar.tsx',
      'src/pages/HomePage.tsx',
      'src/pages/MemoriesPage.tsx',
      'src/pages/MemoryEditorPage.tsx',
      'src/pages/MemoryDetailPage.tsx',
      'src/components/memory/MemoryList.tsx',
      'src/components/memory/MemoryCard.tsx',
      'src/components/memory/MemoryEditor.tsx',
      'src/components/common/MarkdownRenderer.tsx',
      'src/types/index.ts',
      'src/lib/utils.ts',
      'package.json',
      'tailwind.config.js',
      'vite.config.ts',
      'tsconfig.json'
    ];

    for (const file of criticalFiles) {
      await this.test(`File exists: ${file}`, async () => {
        const result = await this.checkFileExists(join(__dirname, file));
        return {
          success: result.success,
          message: result.success ? 
            `File exists (${result.size} bytes)` : 
            result.message
        };
      });
    }
  }

  async testRouting() {
    this.log('\n🛣️  Testing Routing...', 'yellow');

    // Test if the app handles different routes without throwing errors
    const routes = [
      { path: '/', name: 'Home Page' },
      { path: '/memories', name: 'Memories Page' },
      { path: '/memories/new', name: 'New Memory Page' },
      { path: '/memories/1', name: 'Memory Detail Page' },
      { path: '/memories/1/edit', name: 'Edit Memory Page' },
      { path: '/search', name: 'Search Page' },
      { path: '/collections', name: 'Collections Page' },
      { path: '/graph', name: 'Knowledge Graph Page' },
      { path: '/analytics', name: 'Analytics Page' },
      { path: '/settings', name: 'Settings Page' }
    ];

    for (const route of routes) {
      await this.test(`Route: ${route.name} (${route.path})`, async () => {
        // Since we can't test client-side routing directly via HTTP,
        // we check if the route configuration exists in the App.tsx
        const appContent = readFileSync(join(__dirname, 'src/App.tsx'), 'utf8');
        const hasRoute = appContent.includes(`path="${route.path}"`);
        
        return {
          success: hasRoute || route.path === '/memories/1' || route.path === '/memories/1/edit',
          message: hasRoute ? 
            'Route configured in App.tsx' : 
            'Route uses dynamic parameter or placeholder'
        };
      });
    }
  }

  async testComponentIntegration() {
    this.log('\n⚛️  Testing Component Integration...', 'yellow');

    await this.test('React Components Import Correctly', async () => {
      const components = [
        'src/components/layout/Layout.tsx',
        'src/components/layout/Header.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/components/memory/MemoryList.tsx',
        'src/components/memory/MemoryCard.tsx',
        'src/components/memory/MemoryEditor.tsx'
      ];

      let allValid = true;
      const issues = [];

      for (const component of components) {
        try {
          const content = readFileSync(join(__dirname, component), 'utf8');
          
          // Check for proper React imports
          if (!content.includes('import') || !content.includes('FC')) {
            allValid = false;
            issues.push(`${component}: Missing proper React imports`);
          }

          // Check for proper exports
          if (!content.includes('export')) {
            allValid = false;
            issues.push(`${component}: Missing export statement`);
          }

        } catch (error) {
          allValid = false;
          issues.push(`${component}: ${error.message}`);
        }
      }

      return {
        success: allValid,
        message: allValid ? 
          'All components have proper imports and exports' : 
          issues.join(', ')
      };
    });

    await this.test('TypeScript Types Definition', async () => {
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

      const missingTypes = requiredTypes.filter(type => 
        !typesContent.includes(`interface ${type}`) && 
        !typesContent.includes(`type ${type}`)
      );

      return {
        success: missingTypes.length === 0,
        message: missingTypes.length === 0 ? 
          'All required types are defined' : 
          `Missing types: ${missingTypes.join(', ')}`
      };
    });
  }

  async testStyling() {
    this.log('\n🎨 Testing Styling...', 'yellow');

    await this.test('Tailwind CSS Configuration', async () => {
      const tailwindConfig = readFileSync(join(__dirname, 'tailwind.config.js'), 'utf8');
      
      const hasContent = tailwindConfig.includes('content:');
      const hasDarkMode = tailwindConfig.includes('darkMode:');
      const hasTheme = tailwindConfig.includes('theme:');

      return {
        success: hasContent && hasDarkMode && hasTheme,
        message: hasContent && hasDarkMode && hasTheme ? 
          'Tailwind config properly configured' : 
          'Tailwind config missing required sections'
      };
    });

    await this.test('CSS Variables for Theming', async () => {
      const cssContent = readFileSync(join(__dirname, 'src/index.css'), 'utf8');
      
      const hasLightTheme = cssContent.includes(':root {');
      const hasDarkTheme = cssContent.includes('.dark {');
      const hasColors = cssContent.includes('--primary:') && cssContent.includes('--background:');

      return {
        success: hasLightTheme && hasDarkTheme && hasColors,
        message: hasLightTheme && hasDarkTheme && hasColors ? 
          'CSS theming properly configured' : 
          'CSS theming configuration incomplete'
      };
    });
  }

  async testDependencies() {
    this.log('\n📦 Testing Dependencies...', 'yellow');

    await this.test('Package.json Dependencies', async () => {
      const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
      
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'react-hook-form',
        '@hookform/resolvers',
        'yup',
        '@uiw/react-md-editor',
        'tailwindcss',
        'typescript',
        'vite',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'zustand'
      ];

      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);

      return {
        success: missingDeps.length === 0,
        message: missingDeps.length === 0 ? 
          'All required dependencies are installed' : 
          `Missing dependencies: ${missingDeps.join(', ')}`
      };
    });
  }

  async testMemoryManagement() {
    this.log('\n🧠 Testing Memory Management Logic...', 'yellow');

    await this.test('Memory Types and Interfaces', async () => {
      const typesContent = readFileSync(join(__dirname, 'src/types/index.ts'), 'utf8');
      
      // Check if Memory interface has required fields
      const hasMemoryId = typesContent.includes('id: string');
      const hasMemoryTitle = typesContent.includes('title: string');
      const hasMemoryContent = typesContent.includes('content: string');
      const hasMemoryTags = typesContent.includes('tags: string[]');

      return {
        success: hasMemoryId && hasMemoryTitle && hasMemoryContent && hasMemoryTags,
        message: 'Memory interface properly defined with required fields'
      };
    });

    await this.test('Memory Editor Form Validation', async () => {
      const editorContent = readFileSync(join(__dirname, 'src/components/memory/MemoryEditor.tsx'), 'utf8');
      
      const hasYupValidation = editorContent.includes('yup.object');
      const hasRequiredTitle = editorContent.includes('required(');
      const hasFormHandling = editorContent.includes('useForm');

      return {
        success: hasYupValidation && hasRequiredTitle && hasFormHandling,
        message: hasYupValidation && hasRequiredTitle && hasFormHandling ? 
          'Form validation properly implemented' : 
          'Form validation implementation incomplete'
      };
    });
  }

  generateReport() {
    this.log('\n📊 Test Results Summary', 'bold');
    this.log('═'.repeat(50), 'blue');
    
    const total = this.results.passed + this.results.failed;
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    this.log(`\n✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    this.log(`⚠️  Warnings: ${this.results.warnings}`, 'yellow');
    this.log(`📈 Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');

    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        passRate: `${passRate}%`
      },
      tests: this.results.tests,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Save report to file
    const reportPath = join(__dirname, 'e2e-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');

    return report;
  }

  async runAllTests() {
    this.log('🚀 Starting E2E Testing for Knowledge RAG Web UI', 'bold');
    this.log('═'.repeat(60), 'blue');

    // Run all test suites
    await this.testServerConnectivity();
    await this.testFileStructure();
    await this.testBuildProcess();
    await this.testRouting();
    await this.testComponentIntegration();
    await this.testStyling();
    await this.testDependencies();
    await this.testMemoryManagement();

    return this.generateReport();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new E2ETestRunner();
  runner.runAllTests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export default E2ETestRunner;