export { IntelligentDevelopmentAgent } from './intelligent-agent.js';

import { IntelligentDevelopmentAgent } from './intelligent-agent.js';

/**
 * Start the intelligent development agent
 */
export async function startIntelligentAgent(projectDir: string): Promise<void> {
  const agent = new IntelligentDevelopmentAgent();
  await agent.start(projectDir);
}
