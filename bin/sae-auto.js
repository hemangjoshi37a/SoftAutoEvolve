#!/usr/bin/env node

/**
 * SoftAutoEvolve Autonomous Agent
 *
 * Fully automatic, infinite development loop
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the autonomous agent
import('../dist/agent/index.js').then(({ startAutonomousAgent }) => {
  const projectDir = process.argv[2] || process.cwd();
  startAutonomousAgent(projectDir);
}).catch((error) => {
  console.error('Failed to start autonomous agent:', error.message);
  process.exit(1);
});
