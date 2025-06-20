#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate changelog from git commits
 */
class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.packageJson = require('../package.json');
  }

  // Get git commits since last tag
  getCommitsSinceLastTag() {
    try {
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline --pretty=format:"%h %s"`, { encoding: 'utf8' });
      return commits.split('\n').filter(line => line.trim());
    } catch (error) {
      // No tags yet, get all commits
      const commits = execSync('git log --oneline --pretty=format:"%h %s"', { encoding: 'utf8' });
      return commits.split('\n').filter(line => line.trim());
    }
  }

  // Parse commit message and categorize
  categorizeCommit(commit) {
    const [hash, ...messageParts] = commit.split(' ');
    const message = messageParts.join(' ');
    
    if (message.startsWith('feat:') || message.startsWith('✨')) {
      return { type: 'features', hash, message: message.replace(/^(feat:|✨)\s*/, '') };
    }
    
    if (message.startsWith('fix:') || message.startsWith('🐛')) {
      return { type: 'fixes', hash, message: message.replace(/^(fix:|🐛)\s*/, '') };
    }
    
    if (message.startsWith('docs:') || message.startsWith('📝')) {
      return { type: 'documentation', hash, message: message.replace(/^(docs:|📝)\s*/, '') };
    }
    
    if (message.startsWith('style:') || message.startsWith('🎨')) {
      return { type: 'styles', hash, message: message.replace(/^(style:|🎨)\s*/, '') };
    }
    
    if (message.startsWith('refactor:') || message.startsWith('♻️')) {
      return { type: 'refactoring', hash, message: message.replace(/^(refactor:|♻️)\s*/, '') };
    }
    
    if (message.startsWith('perf:') || message.startsWith('⚡')) {
      return { type: 'performance', hash, message: message.replace(/^(perf:|⚡)\s*/, '') };
    }
    
    if (message.startsWith('test:') || message.startsWith('✅')) {
      return { type: 'tests', hash, message: message.replace(/^(test:|✅)\s*/, '') };
    }
    
    if (message.startsWith('chore:') || message.startsWith('🔧')) {
      return { type: 'chores', hash, message: message.replace(/^(chore:|🔧)\s*/, '') };
    }
    
    return { type: 'other', hash, message };
  }

  // Generate changelog content
  generateChangelog() {
    const commits = this.getCommitsSinceLastTag();
    const categorized = {
      features: [],
      fixes: [],
      documentation: [],
      performance: [],
      styles: [],
      refactoring: [],
      tests: [],
      chores: [],
      other: []
    };

    commits.forEach(commit => {
      const categorizedCommit = this.categorizeCommit(commit);
      categorized[categorizedCommit.type].push(categorizedCommit);
    });

    let changelog = `# Changelog\n\n`;
    changelog += `All notable changes to this project will be documented in this file.\n\n`;
    changelog += `## [${this.packageJson.version}] - ${new Date().toISOString().split('T')[0]}\n\n`;

    const sections = [
      { key: 'features', title: '### ✨ Features', emoji: '✨' },
      { key: 'fixes', title: '### 🐛 Bug Fixes', emoji: '🐛' },
      { key: 'performance', title: '### ⚡ Performance', emoji: '⚡' },
      { key: 'documentation', title: '### 📝 Documentation', emoji: '📝' },
      { key: 'styles', title: '### 🎨 Styles', emoji: '🎨' },
      { key: 'refactoring', title: '### ♻️ Refactoring', emoji: '♻️' },
      { key: 'tests', title: '### ✅ Tests', emoji: '✅' },
      { key: 'chores', title: '### 🔧 Chores', emoji: '🔧' }
    ];

    sections.forEach(section => {
      if (categorized[section.key].length > 0) {
        changelog += `${section.title}\n\n`;
        categorized[section.key].forEach(commit => {
          changelog += `- ${commit.message} ([${commit.hash}](https://github.com/anubissbe/knowledge-rag-webui/commit/${commit.hash}))\n`;
        });
        changelog += '\n';
      }
    });

    if (categorized.other.length > 0) {
      changelog += `### 📦 Other Changes\n\n`;
      categorized.other.forEach(commit => {
        changelog += `- ${commit.message} ([${commit.hash}](https://github.com/anubissbe/knowledge-rag-webui/commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }

    return changelog;
  }

  // Update existing changelog or create new one
  updateChangelog() {
    const newChangelog = this.generateChangelog();
    
    if (fs.existsSync(this.changelogPath)) {
      const existingChangelog = fs.readFileSync(this.changelogPath, 'utf8');
      
      // Extract existing content after the first version
      const existingContent = existingChangelog.split('\n').slice(4).join('\n');
      
      // Combine new and existing
      const updatedChangelog = newChangelog + existingContent;
      fs.writeFileSync(this.changelogPath, updatedChangelog);
    } else {
      fs.writeFileSync(this.changelogPath, newChangelog);
    }
    
    console.log('✅ Changelog updated successfully!');
    console.log(`📄 View at: ${this.changelogPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new ChangelogGenerator();
  generator.updateChangelog();
}

module.exports = ChangelogGenerator;