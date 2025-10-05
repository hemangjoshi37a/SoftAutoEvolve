import { GitAutomation } from './git-automation.js';
import { WorkflowOrchestrator } from './workflow-orchestrator.js';
import { NotificationSystem, NotificationType } from './notification-system.js';
import { Task } from './task-manager.js';
import * as path from 'path';

/**
 * Branch Status
 */
export enum BranchStatus {
  IDLE = 'idle',
  PLANNING = 'planning',
  IMPLEMENTING = 'implementing',
  EVOLVING = 'evolving',
  TESTING = 'testing',
  MERGING = 'merging',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Parallel Branch Info
 */
export interface ParallelBranch {
  id: string;
  name: string;
  status: BranchStatus;
  tasks: string[];
  startTime: Date;
  lastUpdate: Date;
  tasksCompleted: number;
  tasksFailed: number;
  orchestrator: WorkflowOrchestrator;
  priority: number;
}

/**
 * Parallel Branch Manager
 * Manages multiple git branches working simultaneously on different features
 */
export class ParallelBranchManager {
  private workingDir: string;
  private gitAutomation: GitAutomation;
  private notifications: NotificationSystem;
  private branches: Map<string, ParallelBranch> = new Map();
  private maxParallelBranches: number = 3;
  private mainBranch: string = 'main';

  constructor(
    workingDir: string,
    maxParallelBranches: number = 3
  ) {
    this.workingDir = workingDir;
    this.gitAutomation = new GitAutomation(workingDir);
    this.notifications = new NotificationSystem();
    this.maxParallelBranches = maxParallelBranches;
  }

  /**
   * Initialize parallel branch system
   */
  public async initialize(): Promise<void> {
    console.log('🌳 Initializing parallel branch system...');
    console.log(`   Max parallel branches: ${this.maxParallelBranches}`);

    // Initialize Git repo
    await this.gitAutomation.initRepo();

    // Get current branch
    this.mainBranch = await this.gitAutomation.getCurrentBranch() || 'main';
    console.log(`   Main branch: ${this.mainBranch}`);
  }

  /**
   * Create a new parallel branch for tasks
   */
  public async createParallelBranch(
    tasks: string[],
    priority: number = 1
  ): Promise<string | null> {
    // Check if we have capacity
    const activeBranches = this.getActiveBranches();
    if (activeBranches.length >= this.maxParallelBranches) {
      console.log(`⚠️  Max parallel branches (${this.maxParallelBranches}) reached`);
      return null;
    }

    // Generate branch ID and name
    const branchId = `parallel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const branchName = `feature/parallel-${Date.now()}`;

    try {
      // Create Git branch
      await this.gitAutomation.createBranch(branchName);

      // Create orchestrator for this branch
      const orchestrator = new WorkflowOrchestrator(this.workingDir);
      await orchestrator.initialize();

      // Create branch info
      const branch: ParallelBranch = {
        id: branchId,
        name: branchName,
        status: BranchStatus.IDLE,
        tasks,
        startTime: new Date(),
        lastUpdate: new Date(),
        tasksCompleted: 0,
        tasksFailed: 0,
        orchestrator,
        priority,
      };

      // Register branch
      this.branches.set(branchId, branch);

      console.log(`✓ Created parallel branch: ${branchName} (${tasks.length} tasks)`);

      return branchId;
    } catch (error: any) {
      console.error(`❌ Failed to create parallel branch: ${error.message}`);
      return null;
    }
  }

  /**
   * Execute tasks on a specific branch
   */
  public async executeBranch(branchId: string): Promise<boolean> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      console.error(`❌ Branch ${branchId} not found`);
      return false;
    }

    try {
      // Update status
      branch.status = BranchStatus.IMPLEMENTING;
      branch.lastUpdate = new Date();

      console.log(`\n🔨 Executing branch: ${branch.name}`);
      console.log(`   Tasks: ${branch.tasks.length}`);

      // Execute workflow on this branch
      await branch.orchestrator.executeWorkflowCycle(branch.tasks);

      // Update completion stats
      branch.tasksCompleted = branch.tasks.length;
      branch.status = BranchStatus.COMPLETED;
      branch.lastUpdate = new Date();

      console.log(`✓ Branch ${branch.name} completed`);

      return true;
    } catch (error: any) {
      console.error(`❌ Branch ${branch.name} failed: ${error.message}`);
      branch.status = BranchStatus.FAILED;
      branch.lastUpdate = new Date();
      return false;
    }
  }

  /**
   * Execute all parallel branches simultaneously
   */
  public async executeAllParallel(): Promise<void> {
    const activeBranches = this.getActiveBranches();

    if (activeBranches.length === 0) {
      console.log('No active branches to execute');
      return;
    }

    console.log(`\n🚀 Executing ${activeBranches.length} branches in parallel...\n`);

    // Execute all branches simultaneously
    const promises = activeBranches.map((branch) =>
      this.executeBranch(branch.id)
    );

    // Wait for all to complete
    const results = await Promise.allSettled(promises);

    // Report results
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - successful;

    console.log(`\n📊 Parallel execution complete:`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);

    // Notify completion
    await this.notifications.notify(
      '🌳 Parallel Branches Complete',
      `${successful}/${results.length} branches completed successfully`,
      successful === results.length ? NotificationType.SUCCESS : NotificationType.WARNING
    );
  }

  /**
   * Merge a branch back to main
   */
  public async mergeBranch(branchId: string): Promise<boolean> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      console.error(`❌ Branch ${branchId} not found`);
      return false;
    }

    if (branch.status !== BranchStatus.COMPLETED) {
      console.error(`❌ Branch ${branch.name} is not completed (status: ${branch.status})`);
      return false;
    }

    try {
      branch.status = BranchStatus.MERGING;
      console.log(`\n🔀 Merging ${branch.name} → ${this.mainBranch}...`);

      // Merge to main
      await this.gitAutomation.mergeBranch(branch.name);

      // Remove from active branches
      this.branches.delete(branchId);

      console.log(`✓ Branch merged and cleaned up`);

      return true;
    } catch (error: any) {
      console.error(`❌ Merge failed: ${error.message}`);
      branch.status = BranchStatus.FAILED;
      return false;
    }
  }

  /**
   * Merge all completed branches
   */
  public async mergeAllCompleted(): Promise<void> {
    const completedBranches = this.getCompletedBranches();

    if (completedBranches.length === 0) {
      console.log('No completed branches to merge');
      return;
    }

    console.log(`\n🔀 Merging ${completedBranches.length} completed branches...\n`);

    // Sort by priority (higher priority first)
    completedBranches.sort((a, b) => b.priority - a.priority);

    // Merge one by one to avoid conflicts
    for (const branch of completedBranches) {
      await this.mergeBranch(branch.id);

      // Small delay to ensure Git operations complete
      await this.delay(1000);
    }

    console.log(`✓ All completed branches merged`);
  }

  /**
   * Get all active branches
   */
  public getActiveBranches(): ParallelBranch[] {
    return Array.from(this.branches.values()).filter(
      (b) => b.status !== BranchStatus.COMPLETED && b.status !== BranchStatus.FAILED
    );
  }

  /**
   * Get completed branches
   */
  public getCompletedBranches(): ParallelBranch[] {
    return Array.from(this.branches.values()).filter(
      (b) => b.status === BranchStatus.COMPLETED
    );
  }

  /**
   * Get all branches
   */
  public getAllBranches(): ParallelBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Get branch by ID
   */
  public getBranch(branchId: string): ParallelBranch | undefined {
    return this.branches.get(branchId);
  }

  /**
   * Check if system can accept more branches
   */
  public canAcceptNewBranch(): boolean {
    const activeBranches = this.getActiveBranches();
    return activeBranches.length < this.maxParallelBranches;
  }

  /**
   * Get capacity info
   */
  public getCapacity(): { current: number; max: number; available: number } {
    const current = this.getActiveBranches().length;
    return {
      current,
      max: this.maxParallelBranches,
      available: this.maxParallelBranches - current,
    };
  }

  /**
   * Get summary of all branches
   */
  public getSummary(): string {
    const all = this.getAllBranches();
    const active = this.getActiveBranches();
    const completed = this.getCompletedBranches();
    const failed = all.filter((b) => b.status === BranchStatus.FAILED);

    let summary = '\n🌳 Parallel Branches Summary\n';
    summary += '═'.repeat(50) + '\n\n';
    summary += `Total Branches: ${all.length}\n`;
    summary += `Active: ${active.length}\n`;
    summary += `Completed: ${completed.length}\n`;
    summary += `Failed: ${failed.length}\n`;
    summary += `Capacity: ${active.length}/${this.maxParallelBranches}\n\n`;

    if (active.length > 0) {
      summary += 'Active Branches:\n';
      for (const branch of active) {
        const elapsed = Date.now() - branch.startTime.getTime();
        const minutes = Math.floor(elapsed / 60000);
        summary += `  • ${branch.name}\n`;
        summary += `    Status: ${branch.status}\n`;
        summary += `    Tasks: ${branch.tasksCompleted}/${branch.tasks.length}\n`;
        summary += `    Running: ${minutes}m\n`;
      }
      summary += '\n';
    }

    summary += '═'.repeat(50) + '\n';

    return summary;
  }

  /**
   * Clean up failed branches
   */
  public async cleanupFailedBranches(): Promise<void> {
    const failed = Array.from(this.branches.values()).filter(
      (b) => b.status === BranchStatus.FAILED
    );

    if (failed.length === 0) {
      return;
    }

    console.log(`\n🧹 Cleaning up ${failed.length} failed branches...`);

    for (const branch of failed) {
      try {
        // Switch back to main before deleting
        await this.gitAutomation.getCurrentBranch();

        // Remove from tracking
        this.branches.delete(branch.id);

        console.log(`✓ Cleaned up ${branch.name}`);
      } catch (error: any) {
        console.warn(`⚠️  Failed to cleanup ${branch.name}: ${error.message}`);
      }
    }
  }

  /**
   * Stop all active branches
   */
  public async stopAll(): Promise<void> {
    const active = this.getActiveBranches();

    console.log(`\n🛑 Stopping ${active.length} active branches...`);

    for (const branch of active) {
      branch.status = BranchStatus.FAILED;
    }

    // Switch back to main
    try {
      await this.gitAutomation.getCurrentBranch();
    } catch (error) {
      // Ignore
    }

    console.log('✓ All branches stopped');
  }

  /**
   * Set max parallel branches
   */
  public setMaxParallelBranches(max: number): void {
    this.maxParallelBranches = Math.max(1, Math.min(max, 10)); // Limit between 1-10
    console.log(`✓ Max parallel branches set to: ${this.maxParallelBranches}`);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
