import { WorkflowOrchestrator } from './workflow-orchestrator.js';
import { AutoTaskGenerator } from './auto-task-generator.js';
import { GitAutomation } from './git-automation.js';

/**
 * Autonomous Development Agent
 * Runs infinitely, automatically generating and executing tasks
 */
export class AutonomousAgent {
  private orchestrator: WorkflowOrchestrator;
  private taskGenerator: AutoTaskGenerator;
  private gitAutomation: GitAutomation;
  private workingDir: string;
  private cycleCount: number = 0;
  private running: boolean = false;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.orchestrator = new WorkflowOrchestrator(workingDir);
    this.taskGenerator = new AutoTaskGenerator(workingDir);
    this.gitAutomation = new GitAutomation(workingDir);
  }

  /**
   * Start autonomous development
   */
  public async start(): Promise<void> {
    this.running = true;

    console.log('╔════════════════════════════════════════╗');
    console.log('║   🤖 Autonomous Agent Started         ║');
    console.log('║   Infinite Development Mode            ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`📁 ${this.workingDir}\n`);

    // Initialize
    await this.orchestrator.initialize();

    console.log('🔄 Running autonomous development cycles...\n');
    console.log('Press Ctrl+C to stop\n');

    // Run infinite loop
    while (this.running) {
      try {
        await this.runCycle();
        await this.delay(2000); // 2 second pause between cycles
      } catch (error: any) {
        console.error(`❌ Cycle error: ${error.message}`);
        await this.delay(5000); // Longer delay on error
      }
    }
  }

  /**
   * Run a single development cycle
   */
  private async runCycle(): Promise<void> {
    this.cycleCount++;

    console.log(`┌─ Cycle ${this.cycleCount} ─────────────────────────────┐`);

    // Generate tasks
    console.log('│ 🎯 Generating tasks...');
    const tasks = await this.taskGenerator.generateTasks();

    if (tasks.length === 0) {
      console.log('│ ✓ No new tasks, project complete');
      console.log('└─────────────────────────────────────────┘\n');
      this.running = false;
      return;
    }

    console.log(`│ ✓ ${tasks.length} tasks generated`);

    // Execute workflow
    await this.orchestrator.executeWorkflowCycle(tasks);

    // Display stats
    await this.displayStats();

    console.log('└─────────────────────────────────────────┘\n');
  }

  /**
   * Display cycle statistics
   */
  private async displayStats(): Promise<void> {
    const gitStats = await this.gitAutomation.getStats();
    const taskStats = this.taskGenerator.getStats();
    const evolutionCount = this.orchestrator.getEvolutionCount();

    console.log('│ 📊 Stats:');
    console.log(`│   Cycles: ${this.cycleCount} | Evolution: ${evolutionCount}`);
    console.log(`│   Commits: ${gitStats.totalCommits} | Tasks: ${taskStats.totalGenerated}`);
  }

  /**
   * Stop the agent
   */
  public stop(): void {
    this.running = false;
    console.log('\n👋 Autonomous agent stopped\n');
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
