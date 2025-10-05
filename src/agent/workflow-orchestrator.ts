import { TaskManager, Task } from './task-manager.js';
import { TaskExecutor } from './task-executor.js';
import { GitAutomation } from './git-automation.js';
import { EventEmitter } from 'events';

/**
 * Workflow Orchestrator
 * Automatically orchestrates the complete development workflow
 */
export class WorkflowOrchestrator extends EventEmitter {
  private taskManager: TaskManager;
  private taskExecutor: TaskExecutor;
  private gitAutomation: GitAutomation;
  private workingDir: string;
  private currentPhase: 'idle' | 'planning' | 'implementing' | 'evolving' | 'merging' = 'idle';
  private evolutionCount: number = 0;

  constructor(workingDir: string) {
    super();
    this.workingDir = workingDir;
    this.taskManager = new TaskManager();
    this.taskExecutor = new TaskExecutor(workingDir);
    this.gitAutomation = new GitAutomation(workingDir);
  }

  /**
   * Initialize orchestrator
   */
  public async initialize(): Promise<void> {
    await this.gitAutomation.initRepo();
    console.log('✓ Orchestrator initialized');
  }

  /**
   * Execute complete workflow cycle
   */
  public async executeWorkflowCycle(initialTasks: string[]): Promise<void> {
    console.log(`\n🔄 Starting workflow cycle with ${initialTasks.length} tasks\n`);

    // Phase 1: Planning & Task Creation
    this.currentPhase = 'planning';
    await this.planningPhase(initialTasks);

    // Phase 2: Implementation
    this.currentPhase = 'implementing';
    const implementationSuccess = await this.implementationPhase();

    if (!implementationSuccess) {
      console.log('⚠ Implementation phase incomplete, skipping evolution');
      return;
    }

    // Phase 3: Evolution
    this.currentPhase = 'evolving';
    await this.evolutionPhase();

    // Phase 4: Merge & Cleanup
    this.currentPhase = 'merging';
    await this.mergingPhase();

    this.currentPhase = 'idle';
    console.log('\n✅ Workflow cycle complete\n');
    this.emit('cycle:complete');
  }

  /**
   * Planning phase
   */
  private async planningPhase(tasks: string[]): Promise<void> {
    console.log('📋 Phase 1: Planning');

    // Create feature branch
    const branchName = await this.gitAutomation.createBranch(
      `auto-${Date.now()}`
    );

    // Add all tasks
    for (const taskDesc of tasks) {
      const type = this.inferTaskType(taskDesc);
      const priority = type === 'bug_fix' ? 'high' : 'medium';
      this.taskManager.addTask(taskDesc, { type, priority });
    }

    console.log(`✓ Created ${tasks.length} tasks on ${branchName}\n`);
  }

  /**
   * Implementation phase
   */
  private async implementationPhase(): Promise<boolean> {
    console.log('🔨 Phase 2: Implementation');

    const executableTasks = this.taskManager.getParallelExecutableTasks();

    if (executableTasks.length === 0) {
      return false;
    }

    // Execute high priority first
    const highPriority = executableTasks.filter((t) => t.priority === 'high');
    for (const task of highPriority) {
      await this.executeTaskWithCommit(task);
    }

    // Execute medium/low in parallel
    const others = executableTasks.filter((t) => t.priority !== 'high');
    await this.executeTasksBatch(others, 2);

    // Check if all tasks completed
    const completed = this.taskManager.getTasksByStatus('completed');
    const failed = this.taskManager.getTasksByStatus('failed');

    console.log(`✓ Completed: ${completed.length}, Failed: ${failed.length}\n`);

    return completed.length > 0;
  }

  /**
   * Evolution phase
   */
  private async evolutionPhase(): Promise<void> {
    console.log('🧬 Phase 3: Evolution');

    this.evolutionCount++;

    // Create evolution branch
    const evolutionBranch = await this.gitAutomation.createEvolutionBranch(
      this.evolutionCount
    );

    // Add evolution task
    const evolutionTask = this.taskManager.addTask(
      'Optimize and evolve code quality',
      {
        type: 'optimization',
        priority: 'medium',
        tool: 'shinka-evolve',
      }
    );

    try {
      this.taskManager.startTask(evolutionTask.id);
      const result = await this.taskExecutor.executeTask(evolutionTask);
      this.taskManager.completeTask(evolutionTask.id, result);

      // Commit evolution results
      await this.gitAutomation.commit(
        `🧬 Evolution gen-${this.evolutionCount}: Code optimization`
      );

      console.log(`✓ Evolution generation ${this.evolutionCount} complete\n`);
    } catch (error: any) {
      console.warn(`⚠ Evolution failed: ${error.message}\n`);
      this.taskManager.failTask(evolutionTask.id, error.message);
    }
  }

  /**
   * Merging phase
   */
  private async mergingPhase(): Promise<void> {
    console.log('🔀 Phase 4: Merge & Cleanup');

    const currentBranch = await this.gitAutomation.getCurrentBranch();

    if (currentBranch !== 'main' && currentBranch !== 'master') {
      await this.gitAutomation.mergeBranch(currentBranch);
      console.log('✓ Changes merged to main\n');
    }
  }

  /**
   * Execute task and commit results
   */
  private async executeTaskWithCommit(task: Task): Promise<void> {
    try {
      this.taskManager.startTask(task.id);
      console.log(`  → ${task.description}`);

      const result = await this.taskExecutor.executeTask(task);
      this.taskManager.completeTask(task.id, result);

      // Commit the changes
      await this.gitAutomation.commit(`${this.getTaskEmoji(task.type)} ${task.description}`);
    } catch (error: any) {
      this.taskManager.failTask(task.id, error.message);
      console.warn(`  ✗ ${task.description}: ${error.message}`);
    }
  }

  /**
   * Execute tasks in batch
   */
  private async executeTasksBatch(tasks: Task[], batchSize: number): Promise<void> {
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const promises = batch.map((task) => this.executeTaskWithCommit(task));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Infer task type from description
   */
  private inferTaskType(description: string): Task['type'] {
    const lower = description.toLowerCase();

    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
      return 'bug_fix';
    } else if (lower.includes('test')) {
      return 'test';
    } else if (lower.includes('optimize') || lower.includes('performance')) {
      return 'optimization';
    } else if (lower.includes('refactor')) {
      return 'refactor';
    } else {
      return 'feature';
    }
  }

  /**
   * Get emoji for task type
   */
  private getTaskEmoji(type: Task['type']): string {
    switch (type) {
      case 'feature': return '✨';
      case 'bug_fix': return '🐛';
      case 'optimization': return '⚡';
      case 'test': return '🧪';
      case 'refactor': return '♻️';
      default: return '📝';
    }
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): string {
    return this.currentPhase;
  }

  /**
   * Get task manager
   */
  public getTaskManager(): TaskManager {
    return this.taskManager;
  }

  /**
   * Get evolution count
   */
  public getEvolutionCount(): number {
    return this.evolutionCount;
  }
}
