#!/usr/bin/env node

/**
 * SoftAutoEvolve Intelligent Agent
 *
 * A continuous, intelligent development agent that runs like Claude Code
 * but automatically orchestrates all three tools intelligently.
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the intelligent agent
import('../dist/cli-agent.js').catch((error) => {
  console.error('Failed to start intelligent agent:', error.message);
  process.exit(1);
});
