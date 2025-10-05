#!/usr/bin/env node

/**
 * SoftAutoEvolve Intelligent Agent CLI
 *
 * A continuous, intelligent development agent that:
 * - Runs like Claude Code (never stops until you exit)
 * - Automatically orchestrates Claude Code, Spec-Kit, and ShinkaEvolve
 * - Makes intelligent decisions about development direction
 * - Prioritizes features and resolves bugs automatically
 * - Continuously improves code quality
 */

import { startIntelligentAgent } from './agent/index.js';
import { config } from './config/config.js';

const banner = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║              🧠 SoftAutoEvolve - Intelligent Development Agent 🧠             ║
║                                                                               ║
║                    Continuous AI-Powered Development                         ║
║                                                                               ║
║    I automatically orchestrate Claude Code, Spec-Kit, and ShinkaEvolve      ║
║              to build, optimize, and maintain your software                  ║
║                                                                               ║
║                     Just tell me what you need! 🚀                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`;

async function main() {
  console.log(banner);

  // Get project directory (current directory by default)
  const projectDir = process.argv[2] || process.cwd();

  console.log(`📁 Project Directory: ${projectDir}`);

  if (config.verbose) {
    console.log('🔧 Verbose mode enabled');
  }

  console.log('\n💡 Quick Tips:');
  console.log('   • Just describe what you want in natural language');
  console.log('   • I\'ll automatically decide which tools to use');
  console.log('   • Type "status" to see project health');
  console.log('   • Type "help" for more commands');
  console.log('   • Type "exit" to quit');
  console.log('');

  try {
    await startIntelligentAgent(projectDir);
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
  console.log('   Your progress has been saved.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

main();
