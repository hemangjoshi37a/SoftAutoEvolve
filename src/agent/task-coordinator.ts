import { Task } from './task-manager.js';

/**
 * Task Group
 * Groups related tasks that should be executed together
 */
export interface TaskGroup {
  id: string;
  tasks: string[];
  priority: number;
  dependencies: string[]; // IDs of task groups that must complete first
  estimatedDuration: number; // minutes
  category: string; // feature, bug_fix, optimization, test, docs
}

/**
 * Task Coordinator
 * Intelligently distributes tasks across parallel branches
 */
export class TaskCoordinator {
  private taskGroups: Map<string, TaskGroup> = new Map();
  private completedGroups: Set<string> = new Set();

  constructor() {}

  /**
   * Analyze and group tasks intelligently
   */
  public analyzeTasks(tasks: string[]): TaskGroup[] {
    console.log(`\n🎯 Analyzing ${tasks.length} tasks for parallel execution...`);

    // Clear previous state
    this.taskGroups.clear();
    this.completedGroups.clear();

    // Categorize tasks
    const categorized = this.categorizeTasks(tasks);

    // Create task groups
    const groups: TaskGroup[] = [];

    // Group 1: Critical setup tasks (high priority, must run first)
    const setupTasks = categorized.filter(
      (t) => t.category === 'setup' || t.task.toLowerCase().includes('create')
    );
    if (setupTasks.length > 0) {
      groups.push({
        id: 'group-setup',
        tasks: setupTasks.map((t) => t.task),
        priority: 10,
        dependencies: [],
        estimatedDuration: 15,
        category: 'setup',
      });
    }

    // Group 2: Feature development (medium priority, parallel)
    const featureTasks = categorized.filter((t) => t.category === 'feature');
    if (featureTasks.length > 0) {
      // Split features into smaller groups for parallel execution
      const featureChunks = this.chunkArray(
        featureTasks.map((t) => t.task),
        2
      );
      featureChunks.forEach((chunk, index) => {
        groups.push({
          id: `group-feature-${index}`,
          tasks: chunk,
          priority: 7,
          dependencies: setupTasks.length > 0 ? ['group-setup'] : [],
          estimatedDuration: 30,
          category: 'feature',
        });
      });
    }

    // Group 3: Bug fixes (high priority, can be parallel)
    const bugTasks = categorized.filter((t) => t.category === 'bug_fix');
    if (bugTasks.length > 0) {
      groups.push({
        id: 'group-bugfix',
        tasks: bugTasks.map((t) => t.task),
        priority: 9,
        dependencies: [],
        estimatedDuration: 20,
        category: 'bug_fix',
      });
    }

    // Group 4: Tests (medium priority, depends on features)
    const testTasks = categorized.filter((t) => t.category === 'test');
    if (testTasks.length > 0) {
      const featureDeps = groups
        .filter((g) => g.category === 'feature')
        .map((g) => g.id);
      groups.push({
        id: 'group-tests',
        tasks: testTasks.map((t) => t.task),
        priority: 6,
        dependencies: featureDeps,
        estimatedDuration: 25,
        category: 'test',
      });
    }

    // Group 5: Documentation (low priority, can run anytime)
    const docTasks = categorized.filter((t) => t.category === 'docs');
    if (docTasks.length > 0) {
      groups.push({
        id: 'group-docs',
        tasks: docTasks.map((t) => t.task),
        priority: 4,
        dependencies: [],
        estimatedDuration: 10,
        category: 'docs',
      });
    }

    // Group 6: Optimization (low priority, runs last)
    const optimizationTasks = categorized.filter((t) => t.category === 'optimization');
    if (optimizationTasks.length > 0) {
      const allDeps = groups.map((g) => g.id);
      groups.push({
        id: 'group-optimization',
        tasks: optimizationTasks.map((t) => t.task),
        priority: 3,
        dependencies: allDeps,
        estimatedDuration: 20,
        category: 'optimization',
      });
    }

    // Register all groups
    groups.forEach((g) => this.taskGroups.set(g.id, g));

    console.log(`✓ Created ${groups.length} task groups`);
    this.printGroupSummary(groups);

    return groups;
  }

  /**
   * Get next task groups that can run (dependencies satisfied)
   */
  public getReadyGroups(maxGroups: number): TaskGroup[] {
    const ready: TaskGroup[] = [];

    for (const group of this.taskGroups.values()) {
      // Skip if already completed
      if (this.completedGroups.has(group.id)) {
        continue;
      }

      // Check if all dependencies are satisfied
      const depsReady = group.dependencies.every((depId) =>
        this.completedGroups.has(depId)
      );

      if (depsReady) {
        ready.push(group);
      }
    }

    // Sort by priority (highest first)
    ready.sort((a, b) => b.priority - a.priority);

    // Return up to maxGroups
    return ready.slice(0, maxGroups);
  }

  /**
   * Mark a group as completed
   */
  public markGroupCompleted(groupId: string): void {
    this.completedGroups.add(groupId);
    console.log(`✓ Task group completed: ${groupId}`);
  }

  /**
   * Check if all groups are completed
   */
  public isAllCompleted(): boolean {
    return this.completedGroups.size === this.taskGroups.size;
  }

  /**
   * Get progress percentage
   */
  public getProgress(): number {
    if (this.taskGroups.size === 0) return 100;
    return Math.round((this.completedGroups.size / this.taskGroups.size) * 100);
  }

  /**
   * Categorize tasks by type
   */
  private categorizeTasks(tasks: string[]): Array<{ task: string; category: string }> {
    return tasks.map((task) => ({
      task,
      category: this.detectTaskCategory(task),
    }));
  }

  /**
   * Detect task category from description
   */
  private detectTaskCategory(task: string): string {
    const lower = task.toLowerCase();

    // Setup/Create tasks
    if (
      lower.includes('create') ||
      lower.includes('initialize') ||
      lower.includes('setup') ||
      lower.includes('scaffold')
    ) {
      return 'setup';
    }

    // Bug fixes
    if (
      lower.includes('fix') ||
      lower.includes('bug') ||
      lower.includes('resolve') ||
      lower.includes('repair')
    ) {
      return 'bug_fix';
    }

    // Tests
    if (
      lower.includes('test') ||
      lower.includes('coverage') ||
      lower.includes('spec')
    ) {
      return 'test';
    }

    // Documentation
    if (
      lower.includes('document') ||
      lower.includes('readme') ||
      lower.includes('docs') ||
      lower.includes('comment')
    ) {
      return 'docs';
    }

    // Optimization
    if (
      lower.includes('optimi') ||
      lower.includes('refactor') ||
      lower.includes('improve') ||
      lower.includes('enhance') ||
      lower.includes('performance')
    ) {
      return 'optimization';
    }

    // Default to feature
    return 'feature';
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Print group summary
   */
  private printGroupSummary(groups: TaskGroup[]): void {
    console.log('\n📋 Task Groups:');
    for (const group of groups.sort((a, b) => b.priority - a.priority)) {
      const depsStr = group.dependencies.length > 0 ? ` (depends on: ${group.dependencies.join(', ')})` : '';
      console.log(`   ${group.id}:`);
      console.log(`     Category: ${group.category}`);
      console.log(`     Priority: ${group.priority}`);
      console.log(`     Tasks: ${group.tasks.length}`);
      console.log(`     Est. Duration: ${group.estimatedDuration}m${depsStr}`);
    }
    console.log('');
  }

  /**
   * Get summary
   */
  public getSummary(): string {
    const total = this.taskGroups.size;
    const completed = this.completedGroups.size;
    const progress = this.getProgress();

    let summary = `Task Coordination: ${completed}/${total} groups completed (${progress}%)\n`;

    const pending = Array.from(this.taskGroups.values()).filter(
      (g) => !this.completedGroups.has(g.id)
    );

    if (pending.length > 0) {
      summary += `Pending: ${pending.map((g) => g.id).join(', ')}`;
    }

    return summary;
  }

  /**
   * Reset coordinator
   */
  public reset(): void {
    this.taskGroups.clear();
    this.completedGroups.clear();
  }
}
