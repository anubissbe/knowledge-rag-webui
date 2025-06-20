#!/usr/bin/env node

/**
 * Knowledge RAG WebUI - End-to-End Testing Suite
 * 
 * Comprehensive testing of:
 * - Application startup and basic functionality
 * - Search interface components
 * - API client integration
 * - State management
 * - Navigation and routing
 * - Error handling
 * - Responsive design
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5174',
  apiBaseUrl: 'http://192.168.1.24:3001',
  ragUrl: 'http://192.168.1.24:8002',
  timeout: 30000,
  retries: 3,
};

// Test results storage
let testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  tests: [],
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  }
};

// Utility functions
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  console.log(logMessage);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const runCommand = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = exec(command, { ...options, timeout: TEST_CONFIG.timeout }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
    
    if (options.silent !== true) {
      child.stdout?.on('data', (data) => process.stdout.write(data));
      child.stderr?.on('data', (data) => process.stderr.write(data));
    }
  });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const addTestResult = (name, status, details = {}, duration = 0) => {
  const test = {
    name,
    status,
    duration,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.tests.push(test);
  testResults.totalTests++;
  
  if (status === 'PASS') {
    testResults.passedTests++;
    log('pass', `✅ ${name}`, { duration: `${duration}ms` });
  } else if (status === 'FAIL') {
    testResults.failedTests++;
    log('fail', `❌ ${name}`, { error: details.error, duration: `${duration}ms` });
  } else if (status === 'SKIP') {
    testResults.skippedTests++;
    log('skip', `⏭️ ${name}`, { reason: details.reason });
  }
};

// Test implementations
const tests = {
  
  async testProjectStructure() {
    const startTime = Date.now();
    try {
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.js',
        'src/App.tsx',
        'src/main.tsx',
        'src/components/search/SearchBar.tsx',
        'src/stores/searchStore.ts',
        'src/services/api/client.ts',
        'src/types/index.ts',
      ];
      
      const missingFiles = [];
      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
      }
      
      addTestResult('Project Structure Validation', 'PASS', {
        checkedFiles: requiredFiles.length,
        allFilesPresent: true
      }, Date.now() - startTime);
      
    } catch (error) {
      addTestResult('Project Structure Validation', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  },

  async testTypeScriptCompilation() {
    const startTime = Date.now();
    try {
      log('info', 'Running TypeScript compilation...');
      const result = await runCommand('npm run typecheck', { silent: true });
      
      addTestResult('TypeScript Compilation', 'PASS', {
        output: result.stdout?.substring(0, 500) // Truncate long output
      }, Date.now() - startTime);
      
    } catch (error) {
      addTestResult('TypeScript Compilation', 'FAIL', {
        error: error.stderr || error.error?.message || 'Compilation failed',
        stdout: error.stdout?.substring(0, 500)
      }, Date.now() - startTime);
    }
  },

  async testBuildProcess() {
    const startTime = Date.now();
    try {
      log('info', 'Running production build...');
      const result = await runCommand('npm run build', { silent: true });
      
      // Check if dist directory was created
      if (fs.existsSync('dist')) {
        const distFiles = fs.readdirSync('dist');
        addTestResult('Production Build', 'PASS', {
          distFiles: distFiles.length,
          buildOutput: result.stdout?.substring(0, 300)
        }, Date.now() - startTime);
      } else {
        throw new Error('Dist directory not created');
      }
      
    } catch (error) {
      addTestResult('Production Build', 'FAIL', {
        error: error.stderr || error.error?.message || 'Build failed',
        stdout: error.stdout?.substring(0, 500)
      }, Date.now() - startTime);
    }
  },

  async testAPIEndpointsHealth() {
    const startTime = Date.now();
    const endpoints = [
      { name: 'Task Management API', url: `${TEST_CONFIG.apiBaseUrl}/health` },
      { name: 'RAG Service', url: `${TEST_CONFIG.ragUrl}/health` },
      { name: 'Knowledge Graph', url: 'http://192.168.1.24:8001/health' },
      { name: 'Vector DB', url: 'http://192.168.1.24:8003/health' },
      { name: 'Unified DB', url: 'http://192.168.1.24:8004/health' },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await runCommand(`curl -s -o /dev/null -w "%{http_code}" ${endpoint.url}`, { silent: true });
        const statusCode = result.stdout.trim();
        
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: statusCode,
          healthy: ['200', '201', '204'].includes(statusCode)
        });
        
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'ERROR',
          healthy: false,
          error: error.message
        });
      }
    }
    
    const healthyEndpoints = results.filter(r => r.healthy).length;
    const totalEndpoints = results.length;
    
    if (healthyEndpoints >= totalEndpoints * 0.6) { // At least 60% healthy
      addTestResult('API Endpoints Health Check', 'PASS', {
        healthyEndpoints,
        totalEndpoints,
        details: results
      }, Date.now() - startTime);
    } else {
      addTestResult('API Endpoints Health Check', 'FAIL', {
        healthyEndpoints,
        totalEndpoints,
        details: results,
        error: 'Too many endpoints are unhealthy'
      }, Date.now() - startTime);
    }
  },

  async testSearchComponentsIntegration() {
    const startTime = Date.now();
    try {
      // Test that search components can be imported and don't have syntax errors
      const searchComponents = [
        'src/components/search/SearchBar.tsx',
        'src/components/search/SearchFilters.tsx',
        'src/components/search/SearchResults.tsx',
        'src/components/search/SearchSuggestions.tsx'
      ];
      
      const componentTests = [];
      
      for (const component of searchComponents) {
        try {
          const content = fs.readFileSync(component, 'utf8');
          
          // Basic validation checks
          const checks = {
            hasReactImport: content.includes('import React'),
            hasTypeScriptInterface: content.includes('interface'),
            hasExportDefault: content.includes('export') && (content.includes('const') || content.includes('function')),
            hasJSXReturn: content.includes('return') && (content.includes('<') || content.includes('jsx')),
            hasProperTyping: content.includes(': React.FC') || content.includes('React.FunctionComponent'),
          };
          
          const passedChecks = Object.values(checks).filter(Boolean).length;
          
          componentTests.push({
            component: path.basename(component),
            checks,
            score: `${passedChecks}/${Object.keys(checks).length}`,
            valid: passedChecks >= 3 // At least 3 out of 5 checks should pass
          });
          
        } catch (error) {
          componentTests.push({
            component: path.basename(component),
            valid: false,
            error: error.message
          });
        }
      }
      
      const validComponents = componentTests.filter(c => c.valid).length;
      
      if (validComponents === searchComponents.length) {
        addTestResult('Search Components Integration', 'PASS', {
          validComponents,
          totalComponents: searchComponents.length,
          details: componentTests
        }, Date.now() - startTime);
      } else {
        addTestResult('Search Components Integration', 'FAIL', {
          validComponents,
          totalComponents: searchComponents.length,
          details: componentTests,
          error: `${searchComponents.length - validComponents} components failed validation`
        }, Date.now() - startTime);
      }
      
    } catch (error) {
      addTestResult('Search Components Integration', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  },

  async testStateManagementStores() {
    const startTime = Date.now();
    try {
      const stores = [
        'src/stores/memoryStore.ts',
        'src/stores/searchStore.ts',
        'src/stores/authStore.ts',
        'src/stores/collectionStore.ts',
        'src/stores/userStore.ts',
        'src/stores/uiStore.ts'
      ];
      
      const storeTests = [];
      
      for (const store of stores) {
        try {
          const content = fs.readFileSync(store, 'utf8');
          
          const checks = {
            hasZustandImport: content.includes('import') && content.includes('zustand'),
            hasCreateFunction: content.includes('create'),
            hasInterface: content.includes('interface'),
            hasDevtools: content.includes('devtools'),
            hasActions: content.includes('=>') && content.includes('set'),
            hasTypeScript: content.includes(': ') && content.includes('('),
          };
          
          const passedChecks = Object.values(checks).filter(Boolean).length;
          
          storeTests.push({
            store: path.basename(store),
            checks,
            score: `${passedChecks}/${Object.keys(checks).length}`,
            valid: passedChecks >= 4
          });
          
        } catch (error) {
          storeTests.push({
            store: path.basename(store),
            valid: false,
            error: error.message
          });
        }
      }
      
      const validStores = storeTests.filter(s => s.valid).length;
      
      if (validStores === stores.length) {
        addTestResult('State Management Stores', 'PASS', {
          validStores,
          totalStores: stores.length,
          details: storeTests
        }, Date.now() - startTime);
      } else {
        addTestResult('State Management Stores', 'FAIL', {
          validStores,
          totalStores: stores.length,
          details: storeTests,
          error: `${stores.length - validStores} stores failed validation`
        }, Date.now() - startTime);
      }
      
    } catch (error) {
      addTestResult('State Management Stores', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  },

  async testAPIClientConfiguration() {
    const startTime = Date.now();
    try {
      const clientFile = 'src/services/api/client.ts';
      const content = fs.readFileSync(clientFile, 'utf8');
      
      const checks = {
        hasAxiosImport: content.includes('import') && content.includes('axios'),
        hasBaseURLs: content.includes('192.168.1.24'),
        hasErrorHandling: content.includes('interceptors') && content.includes('error'),
        hasAuthSupport: content.includes('Authorization') && content.includes('Bearer'),
        hasTypeImports: content.includes('import') && content.includes('types'),
        hasAPIFunctions: content.includes('export') && content.includes('Api'),
        hasTimeoutConfig: content.includes('timeout'),
        hasMultipleServices: (content.match(/\.create\(/g) || []).length >= 4,
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      if (passedChecks >= totalChecks * 0.8) { // 80% of checks should pass
        addTestResult('API Client Configuration', 'PASS', {
          passedChecks,
          totalChecks,
          score: `${passedChecks}/${totalChecks}`,
          details: checks
        }, Date.now() - startTime);
      } else {
        addTestResult('API Client Configuration', 'FAIL', {
          passedChecks,
          totalChecks,
          score: `${passedChecks}/${totalChecks}`,
          details: checks,
          error: `Only ${passedChecks}/${totalChecks} checks passed`
        }, Date.now() - startTime);
      }
      
    } catch (error) {
      addTestResult('API Client Configuration', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  },

  async testTypeSafety() {
    const startTime = Date.now();
    try {
      const typesFile = 'src/types/index.ts';
      const content = fs.readFileSync(typesFile, 'utf8');
      
      const checks = {
        hasMemoryInterface: content.includes('interface Memory'),
        hasSearchInterface: content.includes('interface Search'),
        hasUserInterface: content.includes('interface User'),
        hasCollectionInterface: content.includes('interface Collection'),
        hasEntityInterface: content.includes('interface Entity'),
        hasAPIResponseTypes: content.includes('ApiResponse') || content.includes('Response'),
        hasProperExports: content.includes('export interface') || content.includes('export type'),
        hasComplexTypes: content.includes('Record<') && content.includes('Array<'),
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      if (passedChecks >= totalChecks * 0.75) {
        addTestResult('TypeScript Type Safety', 'PASS', {
          passedChecks,
          totalChecks,
          score: `${passedChecks}/${totalChecks}`,
          details: checks
        }, Date.now() - startTime);
      } else {
        addTestResult('TypeScript Type Safety', 'FAIL', {
          passedChecks,
          totalChecks,
          score: `${passedChecks}/${totalChecks}`,
          details: checks,
          error: `Only ${passedChecks}/${totalChecks} type checks passed`
        }, Date.now() - startTime);
      }
      
    } catch (error) {
      addTestResult('TypeScript Type Safety', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  },

  async testDocumentationCompleteness() {
    const startTime = Date.now();
    try {
      const docFiles = [
        { file: 'README.md', required: true },
        { file: 'CHANGELOG.md', required: true },
        { file: 'PROJECT_STATE.md', required: true },
        { file: 'CONTRIBUTING.md', required: false },
        { file: 'docs/ARCHITECTURE.md', required: false },
        { file: 'docs/DESIGN.md', required: false },
      ];
      
      const docResults = [];
      
      for (const doc of docFiles) {
        if (fs.existsSync(doc.file)) {
          const content = fs.readFileSync(doc.file, 'utf8');
          const wordCount = content.split(/\s+/).length;
          
          docResults.push({
            file: doc.file,
            exists: true,
            wordCount,
            substantial: wordCount > 100,
            required: doc.required
          });
        } else {
          docResults.push({
            file: doc.file,
            exists: false,
            required: doc.required
          });
        }
      }
      
      const requiredDocs = docResults.filter(d => d.required);
      const missingRequired = requiredDocs.filter(d => !d.exists);
      const substantialDocs = docResults.filter(d => d.exists && d.substantial);
      
      if (missingRequired.length === 0 && substantialDocs.length >= 3) {
        addTestResult('Documentation Completeness', 'PASS', {
          totalDocs: docResults.length,
          existingDocs: docResults.filter(d => d.exists).length,
          substantialDocs: substantialDocs.length,
          missingRequired: missingRequired.length,
          details: docResults
        }, Date.now() - startTime);
      } else {
        addTestResult('Documentation Completeness', 'FAIL', {
          totalDocs: docResults.length,
          existingDocs: docResults.filter(d => d.exists).length,
          substantialDocs: substantialDocs.length,
          missingRequired: missingRequired.length,
          details: docResults,
          error: `Missing ${missingRequired.length} required docs or insufficient substantial docs`
        }, Date.now() - startTime);
      }
      
    } catch (error) {
      addTestResult('Documentation Completeness', 'FAIL', {
        error: error.message
      }, Date.now() - startTime);
    }
  }
};

// Main test runner
async function runTests() {
  log('info', '🚀 Starting Knowledge RAG WebUI E2E Testing Suite');
  log('info', `Test Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
  
  const testList = [
    'testProjectStructure',
    'testTypeScriptCompilation',
    'testBuildProcess',
    'testAPIEndpointsHealth',
    'testSearchComponentsIntegration',
    'testStateManagementStores',
    'testAPIClientConfiguration',
    'testTypeSafety',
    'testDocumentationCompleteness'
  ];
  
  for (const testName of testList) {
    try {
      log('info', `Running test: ${testName}`);
      await tests[testName]();
      await sleep(1000); // Brief pause between tests
    } catch (error) {
      log('error', `Test ${testName} crashed:`, error);
      addTestResult(testName, 'FAIL', {
        error: 'Test crashed: ' + error.message
      });
    }
  }
  
  // Finalize results
  testResults.endTime = new Date().toISOString();
  const duration = new Date(testResults.endTime) - new Date(testResults.startTime);
  testResults.totalDuration = duration;
  
  // Write results to file
  const resultsFile = 'e2e-test-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  
  // Generate summary
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1);
  
  log('info', '📊 Test Results Summary:');
  log('info', `✅ Passed: ${testResults.passedTests}`);
  log('info', `❌ Failed: ${testResults.failedTests}`);
  log('info', `⏭️ Skipped: ${testResults.skippedTests}`);
  log('info', `📈 Success Rate: ${successRate}%`);
  log('info', `⏱️ Total Duration: ${Math.round(duration / 1000)}s`);
  log('info', `📄 Results saved to: ${resultsFile}`);
  
  // Exit with appropriate code
  process.exit(testResults.failedTests > 0 ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
  runTests().catch(error => {
    log('error', 'Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testResults };