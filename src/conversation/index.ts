export { ConversationManager } from './conversation-manager.js';
export { WorkflowOrchestrator } from './workflow-orchestrator.js';

import { ConversationManager } from './conversation-manager.js';
import { WorkflowOrchestrator } from './workflow-orchestrator.js';
import { integrationManager } from '../integrations/integration-manager.js';

/**
 * Start conversational mode CLI
 */
export async function startConversationalMode(projectDir: string): Promise<void> {
  // Check if integrations are available
  const status = integrationManager.getStatus();

  if (!status.claudeCode.available || !status.claudeCode.installed) {
    console.error('❌ Claude Code is required for conversational mode.');
    console.log('\nPlease install Claude Code first:');
    console.log('  npm install -g @anthropic-ai/claude-code');
    console.log('\nOr set CLAUDE_CLI_PATH in your .env file.');
    process.exit(1);
  }

  if (!status.specKit.available) {
    console.error('❌ Spec-Kit integration is required for conversational mode.');
    console.log('\nPlease install uv:');
    console.log('  curl -LsSf https://astral.sh/uv/install.sh | sh');
    process.exit(1);
  }

  // Create conversation manager
  const conversation = new ConversationManager();

  // Welcome and start gathering requirements
  await conversation.start();

  // Create workflow orchestrator
  const orchestrator = new WorkflowOrchestrator(conversation, projectDir);

  // Execute the full workflow
  await orchestrator.executeFullWorkflow();

  // Close conversation
  conversation.close();
}
