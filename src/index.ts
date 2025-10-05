/**
 * SoftAutoEvolve - Evolutionary Software Development Platform
 *
 * An abstraction layer that integrates:
 * - Claude Code: AI-powered coding CLI
 * - Spec-Kit: Spec-driven development workflow
 * - ShinkaEvolve: Evolutionary algorithm optimization
 *
 * Together they enable:
 * - User feedback-driven development
 * - Market trend analysis
 * - Evolutionary code optimization
 * - Structured task management
 */

export { config, loadConfig, validateConfig } from './config/config.js';

export {
  ClaudeCodeIntegration,
  claudeCodeIntegration,
} from './integrations/claude-code-integration.js';

export {
  SpecKitIntegration,
  specKitIntegration,
} from './integrations/spec-kit-integration.js';

export {
  ShinkaEvolveIntegration,
  shinkaEvolveIntegration,
  type EvolutionConfig,
} from './integrations/shinka-evolve-integration.js';

export {
  IntegrationManager,
  integrationManager,
  type IntegrationStatus,
} from './integrations/integration-manager.js';

/**
 * Main entry point for programmatic usage
 */
export async function initialize() {
  const { integrationManager } = await import(
    './integrations/integration-manager.js'
  );
  return integrationManager;
}

/**
 * Quick status check
 */
export async function checkStatus() {
  const { integrationManager } = await import(
    './integrations/integration-manager.js'
  );
  integrationManager.displayStatus();
}
