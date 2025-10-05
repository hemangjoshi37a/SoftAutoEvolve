import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Load .env file if it exists
loadEnv();

export interface Config {
  // Repository paths
  claudeCodePath: string;
  specKitPath: string;
  specKitRepoUrl: string;
  shinkaEvolvePath: string;

  // Python configuration
  pythonPath: string;
  uvPath: string;

  // Evolution configuration
  defaultNumGenerations: number;
  defaultMaxParallelJobs: number;
  defaultLlmModels: string[];

  // Claude Code configuration
  claudeCliPath?: string;
  enhancedMode: boolean;

  // Feature flags
  autoInstallDeps: boolean;
  verbose: boolean;
  experimental: boolean;
}

/**
 * Default paths relative to user's home directory or common locations
 */
function getDefaultPaths() {
  const home = homedir();
  const gitHubBase = join(home, 'Documents', 'GitHub');

  return {
    claudeCodePath: join(gitHubBase, 'claude-code'),
    specKitPath: join(gitHubBase, 'hjLabs.in-spec-kit'),
    shinkaEvolvePath: join(gitHubBase, 'hjLabs.in-ShinkaEvolve'),
  };
}

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  const defaults = getDefaultPaths();

  const config: Config = {
    // Repository paths
    claudeCodePath: process.env.CLAUDE_CODE_PATH || defaults.claudeCodePath,
    specKitPath: process.env.SPEC_KIT_PATH || defaults.specKitPath,
    specKitRepoUrl:
      process.env.SPEC_KIT_REPO_URL ||
      'git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit',
    shinkaEvolvePath:
      process.env.SHINKA_EVOLVE_PATH || defaults.shinkaEvolvePath,

    // Python configuration
    pythonPath: process.env.PYTHON_PATH || 'python3',
    uvPath: process.env.UV_PATH || 'uv',

    // Evolution configuration
    defaultNumGenerations: parseInt(
      process.env.DEFAULT_NUM_GENERATIONS || '10',
      10
    ),
    defaultMaxParallelJobs: parseInt(
      process.env.DEFAULT_MAX_PARALLEL_JOBS || '2',
      10
    ),
    defaultLlmModels: process.env.DEFAULT_LLM_MODELS
      ? process.env.DEFAULT_LLM_MODELS.split(',').map((m) => m.trim())
      : ['azure-gpt-4.1-mini'],

    // Claude Code configuration
    claudeCliPath: process.env.CLAUDE_CLI_PATH,
    enhancedMode: process.env.ENHANCED_MODE !== 'false',

    // Feature flags
    autoInstallDeps: process.env.AUTO_INSTALL_DEPS === 'true',
    verbose: process.env.VERBOSE === 'true',
    experimental: process.env.EXPERIMENTAL === 'true',
  };

  return config;
}

/**
 * Validate that required paths exist
 */
export function validateConfig(config: Config): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Claude Code path
  if (!existsSync(config.claudeCodePath)) {
    warnings.push(
      `Claude Code path not found: ${config.claudeCodePath}. Will attempt to use system-wide installation.`
    );
  }

  // Check Spec-Kit path
  if (!existsSync(config.specKitPath)) {
    warnings.push(
      `Spec-Kit path not found: ${config.specKitPath}. Will attempt to use uvx installation.`
    );
  }

  // Check ShinkaEvolve path
  if (!existsSync(config.shinkaEvolvePath)) {
    warnings.push(
      `ShinkaEvolve path not found: ${config.shinkaEvolvePath}. Evolution features will be unavailable.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the current configuration
 */
export const config = loadConfig();
