#!/usr/bin/env node

/**
 * SoftAutoEvolve Conversational CLI
 *
 * This is a natural language interface where users can simply describe
 * what they want to build, and the system automatically handles all
 * the workflow steps internally.
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the conversational CLI
import('../dist/cli-chat.js').catch((error) => {
  console.error('Failed to start conversational mode:', error.message);
  process.exit(1);
});
