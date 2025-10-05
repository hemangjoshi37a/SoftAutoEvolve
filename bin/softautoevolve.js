#!/usr/bin/env node

/**
 * SoftAutoEvolve CLI
 *
 * Evolutionary Software Development Platform
 * Integrating Claude Code + Spec-Kit + ShinkaEvolve
 */

import { Command } from 'commander';
import { integrationManager } from '../dist/integrations/integration-manager.js';
import { config } from '../dist/config/config.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII Art Banner
console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ███████╗ ██████╗ ███████╗████████╗ █████╗ ██╗   ██╗████████╗ ██████╗      ║
║   ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗     ║
║   ███████╗██║   ██║█████╗     ██║   ███████║██║   ██║   ██║   ██║   ██║     ║
║   ╚════██║██║   ██║██╔══╝     ██║   ██╔══██║██║   ██║   ██║   ██║   ██║     ║
║   ███████║╚██████╔╝██║        ██║   ██║  ██║╚██████╔╝   ██║   ╚██████╔╝     ║
║   ╚══════╝ ╚═════╝ ╚═╝        ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝      ║
║                                                                               ║
║               ███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗███████╗            ║
║               ██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║██╔════╝            ║
║               █████╗  ██║   ██║██║   ██║██║     ██║   ██║█████╗              ║
║               ██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ╚██╗ ██╔╝██╔══╝              ║
║               ███████╗ ╚████╔╝ ╚██████╔╝███████╗ ╚████╔╝ ███████╗            ║
║               ╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝            ║
║                                                                               ║
║                 🧬 Evolutionary Software Development Platform 🧬              ║
║                                                                               ║
║            Claude Code + Spec-Kit + ShinkaEvolve Integration                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const program = new Command();

program
  .name('softautoevolve')
  .description('Evolutionary Software Development Platform')
  .version(packageJson.version);

// Status command
program
  .command('status')
  .description('Display integration status and available capabilities')
  .action(() => {
    integrationManager.displayStatus();
  });

// Launch command
program
  .command('launch')
  .description('Launch Claude Code CLI')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (options) => {
    try {
      if (options.verbose) {
        process.env.VERBOSE = 'true';
      }
      await integrationManager.launchClaudeCode();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Init command
program
  .command('init [project-name]')
  .description('Initialize Spec-Kit in current or new directory')
  .option('-f, --force', 'Force initialization even if directory is not empty')
  .action(async (projectName, options) => {
    try {
      const { specKitIntegration } = await import(
        '../dist/integrations/spec-kit-integration.js'
      );

      if (!specKitIntegration.isSpecKitAvailable()) {
        console.error('❌ Error: Spec-Kit integration not available');
        console.log(specKitIntegration.getInstallationInstructions());
        process.exit(1);
      }

      console.log('🚀 Initializing Spec-Kit...\n');
      const result = await specKitIntegration.initializeSpecKit(projectName);
      console.log(result);
      console.log('\n✅ Spec-Kit initialized successfully!');
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Chat command - Conversational Mode
program
  .command('chat [project-dir]')
  .description('🗣️  Start conversational mode - just describe what you want to build!')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (projectDir, options) => {
    try {
      if (options.verbose) {
        process.env.VERBOSE = 'true';
      }

      const { startConversationalMode } = await import(
        '../dist/conversation/index.js'
      );

      const targetDir = projectDir || process.cwd();
      await startConversationalMode(targetDir);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Workflow command
program
  .command('workflow')
  .description('Run full evolutionary development workflow')
  .requiredOption('-d, --description <desc>', 'Project description')
  .requiredOption('-t, --tech <tech>', 'Technical requirements')
  .option('-g, --generations <num>', 'Number of evolution generations', '5')
  .option('-j, --jobs <num>', 'Maximum parallel jobs', '2')
  .option('-m, --models <models>', 'LLM models (comma-separated)')
  .action(async (options) => {
    try {
      const evolutionConfig = {
        num_generations: parseInt(options.generations, 10),
        max_parallel_jobs: parseInt(options.jobs, 10),
        llm_models: options.models
          ? options.models.split(',').map((m) => m.trim())
          : config.defaultLlmModels,
      };

      await integrationManager.runFullWorkflow(
        options.description,
        options.tech,
        evolutionConfig
      );
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Spec-workflow command
program
  .command('spec-workflow')
  .description('Run Spec-Kit workflow (without evolution)')
  .action(async () => {
    try {
      await integrationManager.runSpecKitWorkflow();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Evolve command
program
  .command('evolve')
  .description('Run evolutionary optimization on existing code')
  .requiredOption('-i, --initial <path>', 'Path to initial program')
  .requiredOption('-e, --eval <path>', 'Path to evaluation script')
  .option('-g, --generations <num>', 'Number of generations', '10')
  .option('-j, --jobs <num>', 'Maximum parallel jobs', '2')
  .option('-m, --models <models>', 'LLM models (comma-separated)')
  .option('-r, --results <dir>', 'Results directory', './shinka_results')
  .action(async (options) => {
    try {
      const evolutionConfig = {
        num_generations: parseInt(options.generations, 10),
        max_parallel_jobs: parseInt(options.jobs, 10),
        llm_models: options.models
          ? options.models.split(',').map((m) => m.trim())
          : config.defaultLlmModels,
        results_dir: options.results,
      };

      const result = await integrationManager.runEvolutionOnly(
        options.initial,
        options.eval,
        evolutionConfig
      );

      console.log(result);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Display current configuration')
  .action(() => {
    console.log('\n📋 Current Configuration:\n');
    console.log('Repository Paths:');
    console.log(`  Claude Code: ${config.claudeCodePath}`);
    console.log(`  Spec-Kit: ${config.specKitPath}`);
    console.log(`  ShinkaEvolve: ${config.shinkaEvolvePath}`);
    console.log('');
    console.log('Evolution Defaults:');
    console.log(`  Generations: ${config.defaultNumGenerations}`);
    console.log(`  Parallel Jobs: ${config.defaultMaxParallelJobs}`);
    console.log(`  LLM Models: ${config.defaultLlmModels.join(', ')}`);
    console.log('');
    console.log('Feature Flags:');
    console.log(`  Enhanced Mode: ${config.enhancedMode}`);
    console.log(`  Auto Install: ${config.autoInstallDeps}`);
    console.log(`  Verbose: ${config.verbose}`);
    console.log(`  Experimental: ${config.experimental}`);
    console.log('');
  });

// Setup command
program
  .command('setup')
  .description('Interactive setup wizard')
  .action(() => {
    console.log('\n🔧 SoftAutoEvolve Setup Wizard\n');
    console.log('This will help you configure SoftAutoEvolve.\n');
    console.log('1. Copy .env.example to .env');
    console.log('2. Edit .env with your repository paths');
    console.log('3. Run "softautoevolve status" to check installation\n');
    console.log('Example .env file location:');
    console.log(`  ${path.join(process.cwd(), '.env')}\n`);
  });

// Parse arguments
program.parse();
