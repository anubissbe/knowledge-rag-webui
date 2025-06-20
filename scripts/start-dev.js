#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Knowledge RAG Web UI Development Environment...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created\n');
  }
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  install.on('close', (code) => {
    if (code === 0) {
      startDev();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startDev();
}

function startDev() {
  console.log('🌟 Starting development server...\n');
  const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
  
  dev.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Development server exited with code', code);
      process.exit(code);
    }
  });
}