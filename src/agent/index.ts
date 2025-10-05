export { IntelligentDevelopmentAgent } from './intelligent-agent.js';
export { TaskManager, Task } from './task-manager.js';
export { TaskExecutor } from './task-executor.js';
export { AutonomousAgent } from './autonomous-agent.js';
export { WorkflowOrchestrator } from './workflow-orchestrator.js';
export { GitAutomation } from './git-automation.js';
export { AutoTaskGenerator } from './auto-task-generator.js';

import { IntelligentDevelopmentAgent } from './intelligent-agent.js';
import { AutonomousAgent } from './autonomous-agent.js';

/**
 * Start the intelligent development agent (interactive)
 */
export async function startIntelligentAgent(projectDir: string): Promise<void> {
  const agent = new IntelligentDevelopmentAgent();
  await agent.start(projectDir);
}

/**
 * Start the autonomous agent (fully automatic, infinite loop)
 */
export async function startAutonomousAgent(projectDir: string): Promise<void> {
  const agent = new AutonomousAgent(projectDir);

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    agent.stop();
    process.exit(0);
  });

  await agent.start();
}
