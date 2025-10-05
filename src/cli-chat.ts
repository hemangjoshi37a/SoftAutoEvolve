#!/usr/bin/env node

/**
 * SoftAutoEvolve Conversational CLI
 *
 * Natural language interface for evolutionary software development
 * Users simply describe what they want to build, and the system handles
 * all the complex workflow automation internally.
 */

import { startConversationalMode } from './conversation/index.js';
import { config } from './config/config.js';
import * as path from 'path';

const banner = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🧬 SoftAutoEvolve - Conversational Mode 🧬                 ║
║                                                                               ║
║              Natural Language Software Development Platform                  ║
║                                                                               ║
║         Just describe what you want to build in your own words!              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`;

async function main() {
  console.log(banner);

  // Get project directory (current directory by default)
  const projectDir = process.argv[2] || process.cwd();

  console.log(`\n📁 Project Directory: ${projectDir}\n`);

  if (config.verbose) {
    console.log('🔧 Verbose mode enabled\n');
  }

  try {
    await startConversationalMode(projectDir);
  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

main();
