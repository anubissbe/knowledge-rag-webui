#!/usr/bin/env node

/**
 * MCP Integration Test Script
 * Tests all MCP server endpoints and operations
 */

import axios from 'axios';
import chalk from 'chalk';

const MCP_SERVERS = {
  RAG: { url: 'http://192.168.1.24:8002', name: 'RAG Server' },
  KNOWLEDGE_GRAPH: { url: 'http://192.168.1.24:8001', name: 'Knowledge Graph' },
  VECTOR_DB: { url: 'http://192.168.1.24:8003', name: 'Vector DB' },
  UNIFIED_DB: { url: 'http://192.168.1.24:8004', name: 'Unified DB' },
};

// Helper to make JSON-RPC requests
async function jsonRpcRequest(url, method, params = {}) {
  try {
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
}

// Test server connectivity
async function testServerConnectivity() {
  console.log(chalk.blue('\n🔌 Testing MCP Server Connectivity...\n'));
  
  const results = {};
  
  for (const [key, server] of Object.entries(MCP_SERVERS)) {
    process.stdout.write(`Testing ${server.name}... `);
    
    try {
      // Try health check first
      const healthResponse = await axios.get(`${server.url}/health`, {
        timeout: 3000,
      }).catch(() => null);
      
      if (healthResponse?.status === 200) {
        console.log(chalk.green('✓ Connected'));
        results[key] = { connected: true, healthCheck: true };
      } else {
        // Try JSON-RPC ping
        const pingResult = await jsonRpcRequest(server.url, 'ping');
        if (pingResult.success) {
          console.log(chalk.green('✓ Connected (JSON-RPC)'));
          results[key] = { connected: true, healthCheck: false };
        } else {
          console.log(chalk.red('✗ Not reachable'));
          results[key] = { connected: false, error: pingResult.error };
        }
      }
    } catch (error) {
      console.log(chalk.red('✗ Connection failed'));
      results[key] = { connected: false, error: error.message };
    }
  }
  
  return results;
}

// Test RAG operations
async function testRAGOperations() {
  console.log(chalk.blue('\n📚 Testing RAG Operations...\n'));
  
  const ragUrl = MCP_SERVERS.RAG.url;
  const tests = [];
  
  // Test 1: Create memory
  process.stdout.write('Creating test memory... ');
  const createResult = await jsonRpcRequest(ragUrl, 'memories/create', {
    title: 'MCP Integration Test Memory',
    content: 'This is a test memory created for MCP integration testing.',
    tags: ['test', 'mcp', 'integration'],
    metadata: { test: true, timestamp: new Date().toISOString() },
  });
  
  if (createResult.success) {
    console.log(chalk.green('✓ Success'));
    tests.push({ name: 'Create Memory', passed: true });
    
    const memoryId = createResult.data.result?.id;
    
    // Test 2: Get memory
    process.stdout.write('Retrieving test memory... ');
    const getResult = await jsonRpcRequest(ragUrl, 'memories/get', { id: memoryId });
    if (getResult.success) {
      console.log(chalk.green('✓ Success'));
      tests.push({ name: 'Get Memory', passed: true });
    } else {
      console.log(chalk.red('✗ Failed'));
      tests.push({ name: 'Get Memory', passed: false, error: getResult.error });
    }
    
    // Test 3: Search memories
    process.stdout.write('Searching memories... ');
    const searchResult = await jsonRpcRequest(ragUrl, 'memories/search', {
      query: 'MCP integration test',
      limit: 10,
    });
    if (searchResult.success) {
      console.log(chalk.green('✓ Success'));
      tests.push({ name: 'Search Memories', passed: true });
    } else {
      console.log(chalk.red('✗ Failed'));
      tests.push({ name: 'Search Memories', passed: false, error: searchResult.error });
    }
    
    // Test 4: Delete memory
    process.stdout.write('Deleting test memory... ');
    const deleteResult = await jsonRpcRequest(ragUrl, 'memories/delete', { id: memoryId });
    if (deleteResult.success) {
      console.log(chalk.green('✓ Success'));
      tests.push({ name: 'Delete Memory', passed: true });
    } else {
      console.log(chalk.red('✗ Failed'));
      tests.push({ name: 'Delete Memory', passed: false, error: deleteResult.error });
    }
  } else {
    console.log(chalk.red('✗ Failed'));
    tests.push({ name: 'Create Memory', passed: false, error: createResult.error });
  }
  
  return tests;
}

// Test Knowledge Graph operations
async function testKnowledgeGraphOperations() {
  console.log(chalk.blue('\n🕸️ Testing Knowledge Graph Operations...\n'));
  
  const kgUrl = MCP_SERVERS.KNOWLEDGE_GRAPH.url;
  const tests = [];
  
  // Test 1: Extract entities
  process.stdout.write('Extracting entities... ');
  const extractResult = await jsonRpcRequest(kgUrl, 'entities/extract', {
    text: 'John Smith works at OpenAI in San Francisco. He collaborates with Jane Doe on the GPT-4 project.',
  });
  
  if (extractResult.success) {
    console.log(chalk.green('✓ Success'));
    tests.push({ name: 'Extract Entities', passed: true });
    
    // Test 2: Build graph
    process.stdout.write('Building knowledge graph... ');
    const graphResult = await jsonRpcRequest(kgUrl, 'graph/build', {
      max_depth: 2,
    });
    if (graphResult.success) {
      console.log(chalk.green('✓ Success'));
      tests.push({ name: 'Build Graph', passed: true });
    } else {
      console.log(chalk.red('✗ Failed'));
      tests.push({ name: 'Build Graph', passed: false, error: graphResult.error });
    }
  } else {
    console.log(chalk.red('✗ Failed'));
    tests.push({ name: 'Extract Entities', passed: false, error: extractResult.error });
  }
  
  return tests;
}

// Test Vector DB operations
async function testVectorDBOperations() {
  console.log(chalk.blue('\n🔍 Testing Vector DB Operations...\n'));
  
  const vectorUrl = MCP_SERVERS.VECTOR_DB.url;
  const tests = [];
  
  // Test 1: Create embedding
  process.stdout.write('Creating embedding... ');
  const embedResult = await jsonRpcRequest(vectorUrl, 'embeddings/create', {
    text: 'This is a test text for vector embedding',
    metadata: { source: 'test' },
  });
  
  if (embedResult.success) {
    console.log(chalk.green('✓ Success'));
    tests.push({ name: 'Create Embedding', passed: true });
    
    // Test 2: Search similar
    process.stdout.write('Searching similar vectors... ');
    const searchResult = await jsonRpcRequest(vectorUrl, 'search/similar', {
      query: 'test text for embedding',
      limit: 5,
    });
    if (searchResult.success) {
      console.log(chalk.green('✓ Success'));
      tests.push({ name: 'Search Similar', passed: true });
    } else {
      console.log(chalk.red('✗ Failed'));
      tests.push({ name: 'Search Similar', passed: false, error: searchResult.error });
    }
  } else {
    console.log(chalk.red('✗ Failed'));
    tests.push({ name: 'Create Embedding', passed: false, error: embedResult.error });
  }
  
  return tests;
}

// Generate test report
function generateReport(connectivity, ragTests, kgTests, vectorTests) {
  console.log(chalk.blue('\n📊 Test Report\n'));
  
  // Connectivity summary
  console.log(chalk.yellow('Server Connectivity:'));
  let connectedCount = 0;
  for (const [key, result] of Object.entries(connectivity)) {
    const server = MCP_SERVERS[key];
    if (result.connected) {
      console.log(`  ${chalk.green('✓')} ${server.name}`);
      connectedCount++;
    } else {
      console.log(`  ${chalk.red('✗')} ${server.name}: ${result.error}`);
    }
  }
  
  // Test results summary
  const allTests = [...ragTests, ...kgTests, ...vectorTests];
  const passedTests = allTests.filter(t => t.passed).length;
  const totalTests = allTests.length;
  
  console.log(`\n${chalk.yellow('Operation Tests:')}`);
  console.log(`  Total: ${totalTests}`);
  console.log(`  Passed: ${chalk.green(passedTests)}`);
  console.log(`  Failed: ${chalk.red(totalTests - passedTests)}`);
  
  // Failed tests details
  const failedTests = allTests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    console.log(`\n${chalk.red('Failed Tests:')}`);
    failedTests.forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
  }
  
  // Overall status
  console.log(`\n${chalk.yellow('Overall Status:')}`);
  if (connectedCount === Object.keys(MCP_SERVERS).length && passedTests === totalTests) {
    console.log(chalk.green('  ✓ All MCP integrations working correctly!'));
    return 0;
  } else {
    console.log(chalk.red('  ✗ Some MCP integrations need attention'));
    return 1;
  }
}

// Main test runner
async function main() {
  console.log(chalk.bold.blue('🧪 MCP Integration Test Suite\n'));
  console.log('Testing MCP server connectivity and operations...');
  
  // Test connectivity
  const connectivity = await testServerConnectivity();
  
  // Run operation tests only for connected servers
  let ragTests = [];
  let kgTests = [];
  let vectorTests = [];
  
  if (connectivity.RAG?.connected) {
    ragTests = await testRAGOperations();
  } else {
    console.log(chalk.yellow('\n⚠️  Skipping RAG tests (server not connected)'));
  }
  
  if (connectivity.KNOWLEDGE_GRAPH?.connected) {
    kgTests = await testKnowledgeGraphOperations();
  } else {
    console.log(chalk.yellow('\n⚠️  Skipping Knowledge Graph tests (server not connected)'));
  }
  
  if (connectivity.VECTOR_DB?.connected) {
    vectorTests = await testVectorDBOperations();
  } else {
    console.log(chalk.yellow('\n⚠️  Skipping Vector DB tests (server not connected)'));
  }
  
  // Generate report
  const exitCode = generateReport(connectivity, ragTests, kgTests, vectorTests);
  process.exit(exitCode);
}

// Run tests
main().catch(error => {
  console.error(chalk.red('\n❌ Test suite failed:'), error);
  process.exit(1);
});