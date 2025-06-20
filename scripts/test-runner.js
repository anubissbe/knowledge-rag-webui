#!/usr/bin/env node

/**
 * Comprehensive test runner for the Knowledge RAG Web UI
 * Runs unit tests, integration tests, E2E tests, and generates reports
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      coverage: null,
    };
    this.startTime = Date.now();
  }

  async run() {
    console.log(chalk.blue.bold('\n🧪 Knowledge RAG WebUI Test Suite\n'));

    try {
      // Check if dev server is running for E2E tests
      const serverRunning = await this.checkDevServer();
      
      if (process.argv.includes('--unit-only')) {
        await this.runUnitTests();
      } else if (process.argv.includes('--e2e-only')) {
        if (!serverRunning) {
          console.log(chalk.yellow('⚠️  Starting dev server for E2E tests...'));
          await this.startDevServer();
        }
        await this.runE2ETests();
      } else if (process.argv.includes('--integration-only')) {
        await this.runIntegrationTests();
      } else {
        // Run all tests
        await this.runUnitTests();
        await this.runIntegrationTests();
        
        if (!serverRunning) {
          console.log(chalk.yellow('⚠️  Starting dev server for E2E tests...'));
          await this.startDevServer();
        }
        await this.runE2ETests();
      }

      await this.generateReport();
      
    } catch (error) {
      console.error(chalk.red('❌ Test suite failed:'), error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log(chalk.blue('📋 Running Unit Tests...\n'));
    
    const args = [
      'test',
      '--passWithNoTests',
      '--testPathIgnorePatterns=e2e,integration',
    ];

    if (process.argv.includes('--coverage')) {
      args.push('--coverage');
    }

    if (process.argv.includes('--watch')) {
      args.push('--watch');
    }

    this.results.unit = await this.runCommand('npm', args);
  }

  async runIntegrationTests() {
    console.log(chalk.blue('🔗 Running Integration Tests...\n'));
    
    const args = [
      'test',
      '--testPathPattern=integration',
      '--passWithNoTests',
    ];

    this.results.integration = await this.runCommand('npm', args);
  }

  async runE2ETests() {
    console.log(chalk.blue('🌐 Running E2E Tests...\n'));
    
    const args = ['run', 'test:e2e'];
    
    if (process.argv.includes('--headed')) {
      args.push('--', '--headed');
    }

    if (process.argv.includes('--debug')) {
      args.push('--', '--debug');
    }

    this.results.e2e = await this.runCommand('npm', args);
  }

  async checkDevServer() {
    try {
      const response = await fetch('http://localhost:5173/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: true,
      });

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Dev server failed to start within timeout'));
        }
      }, 30000);

      server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log(chalk.green('✅ Dev server started'));
          // Give it a moment to fully initialize
          setTimeout(resolve, 2000);
        }
      });

      server.stderr.on('data', (data) => {
        console.error(chalk.red('Dev server error:'), data.toString());
      });

      process.on('exit', () => {
        if (server.pid) {
          process.kill(-server.pid);
        }
      });
    });
  }

  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code });
        } else {
          resolve({ success: false, code });
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    
    console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));
    console.log('='.repeat(50));
    
    if (this.results.unit) {
      const status = this.results.unit.success ? '✅' : '❌';
      console.log(`${status} Unit Tests: ${this.results.unit.success ? 'PASSED' : 'FAILED'}`);
    }
    
    if (this.results.integration) {
      const status = this.results.integration.success ? '✅' : '❌';
      console.log(`${status} Integration Tests: ${this.results.integration.success ? 'PASSED' : 'FAILED'}`);
    }
    
    if (this.results.e2e) {
      const status = this.results.e2e.success ? '✅' : '❌';
      console.log(`${status} E2E Tests: ${this.results.e2e.success ? 'PASSED' : 'FAILED'}`);
    }
    
    console.log('='.repeat(50));
    console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
    
    const allPassed = Object.values(this.results)
      .filter(result => result !== null)
      .every(result => result.success);
    
    if (allPassed) {
      console.log(chalk.green.bold('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.red.bold('\n💥 Some tests failed!'));
      process.exit(1);
    }

    // Generate JSON report
    await this.generateJSONReport();
  }

  async generateJSONReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: Object.values(this.results).filter(r => r !== null).length,
        passed: Object.values(this.results).filter(r => r?.success).length,
        failed: Object.values(this.results).filter(r => r && !r.success).length,
      },
    };

    const reportPath = path.join(PROJECT_ROOT, 'test-results.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Test report saved to: ${reportPath}`));
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${chalk.blue.bold('Knowledge RAG WebUI Test Runner')}

Usage: node scripts/test-runner.js [options]

Options:
  --unit-only     Run only unit tests
  --integration-only  Run only integration tests  
  --e2e-only      Run only E2E tests
  --coverage      Generate coverage report (unit tests)
  --watch         Watch mode for unit tests
  --headed        Run E2E tests in headed mode
  --debug         Run E2E tests in debug mode
  --help, -h      Show this help message

Examples:
  node scripts/test-runner.js                    # Run all tests
  node scripts/test-runner.js --unit-only       # Unit tests only
  node scripts/test-runner.js --e2e-only --headed  # E2E tests with browser
  node scripts/test-runner.js --coverage        # Unit tests with coverage
`);
  process.exit(0);
}

// Run the test suite
const runner = new TestRunner();
runner.run().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});