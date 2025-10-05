import { EventEmitter } from 'events';

/**
 * Task Manager for tracking and executing development tasks
 * Allows parallel and sequential task execution
 */

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  type: 'feature' | 'bug_fix' | 'optimization' | 'test' | 'refactor' | 'general';
  dependencies?: string[]; // Task IDs that must complete first
  tool?: 'claude' | 'spec-kit' | 'shinka-evolve' | 'all';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export class TaskManager extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private taskCounter: number = 0;

  /**
   * Add a new task to the task list
   */
  public addTask(
    description: string,
    options: {
      priority?: 'low' | 'medium' | 'high';
      type?: Task['type'];
      dependencies?: string[];
      tool?: Task['tool'];
    } = {}
  ): Task {
    const taskId = `task-${++this.taskCounter}`;
    const task: Task = {
      id: taskId,
      description,
      status: 'pending',
      priority: options.priority || 'medium',
      type: options.type || 'general',
      dependencies: options.dependencies || [],
      tool: options.tool,
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);
    this.emit('task:added', task);
    return task;
  }

  /**
   * Add multiple tasks at once
   */
  public addTasks(
    tasks: Array<{
      description: string;
      priority?: 'low' | 'medium' | 'high';
      type?: Task['type'];
      dependencies?: string[];
      tool?: Task['tool'];
    }>
  ): Task[] {
    return tasks.map((t) => this.addTask(t.description, t));
  }

  /**
   * Mark task as in progress
   */
  public startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'in_progress';
      task.startedAt = new Date();
      this.emit('task:started', task);
    }
  }

  /**
   * Mark task as completed
   */
  public completeTask(taskId: string, result?: any): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      this.emit('task:completed', task);
    }
  }

  /**
   * Mark task as failed
   */
  public failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error;
      this.emit('task:failed', task);
    }
  }

  /**
   * Get all tasks
   */
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  public getTasksByStatus(status: Task['status']): Task[] {
    return this.getAllTasks().filter((t) => t.status === status);
  }

  /**
   * Get task by ID
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get executable tasks (no pending dependencies)
   */
  public getExecutableTasks(): Task[] {
    return this.getAllTasks().filter((task) => {
      if (task.status !== 'pending') return false;

      // Check if all dependencies are completed
      if (task.dependencies && task.dependencies.length > 0) {
        return task.dependencies.every((depId) => {
          const depTask = this.tasks.get(depId);
          return depTask && depTask.status === 'completed';
        });
      }

      return true;
    });
  }

  /**
   * Get tasks that can be executed in parallel
   */
  public getParallelExecutableTasks(): Task[] {
    const executable = this.getExecutableTasks();

    // Group by priority
    const highPriority = executable.filter((t) => t.priority === 'high');
    const mediumPriority = executable.filter((t) => t.priority === 'medium');
    const lowPriority = executable.filter((t) => t.priority === 'low');

    // Return high priority first, then medium, then low
    return [...highPriority, ...mediumPriority, ...lowPriority];
  }

  /**
   * Remove a task
   */
  public removeTask(taskId: string): boolean {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      this.emit('task:removed', taskId);
    }
    return deleted;
  }

  /**
   * Clear all tasks
   */
  public clearTasks(): void {
    this.tasks.clear();
    this.emit('tasks:cleared');
  }

  /**
   * Get task statistics
   */
  public getStatistics(): {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
    completion_rate: number;
  } {
    const total = this.tasks.size;
    const pending = this.getTasksByStatus('pending').length;
    const in_progress = this.getTasksByStatus('in_progress').length;
    const completed = this.getTasksByStatus('completed').length;
    const failed = this.getTasksByStatus('failed').length;

    const completion_rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      in_progress,
      completed,
      failed,
      completion_rate,
    };
  }

  /**
   * Display task list in a nice format
   */
  public displayTasks(): void {
    const tasks = this.getAllTasks();

    if (tasks.length === 0) {
      console.log('\n📋 No tasks in the list.\n');
      return;
    }

    console.log('\n📋 Task List:\n');

    for (const task of tasks) {
      const statusIcon = this.getStatusIcon(task.status);
      const priorityBadge = this.getPriorityBadge(task.priority);
      const toolBadge = task.tool ? ` [${task.tool}]` : '';

      console.log(`${statusIcon} ${task.id}: ${task.description}`);
      console.log(`   ${priorityBadge}${toolBadge} | Type: ${task.type}`);

      if (task.dependencies && task.dependencies.length > 0) {
        console.log(`   Dependencies: ${task.dependencies.join(', ')}`);
      }

      if (task.error) {
        console.log(`   ❌ Error: ${task.error}`);
      }

      console.log('');
    }

    // Display statistics
    const stats = this.getStatistics();
    console.log(`📊 Progress: ${stats.completed}/${stats.total} completed (${stats.completion_rate.toFixed(1)}%)`);
    if (stats.in_progress > 0) console.log(`⏳ In Progress: ${stats.in_progress}`);
    if (stats.failed > 0) console.log(`❌ Failed: ${stats.failed}`);
    console.log('');
  }

  private getStatusIcon(status: Task['status']): string {
    switch (status) {
      case 'pending': return '⏸️';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  private getPriorityBadge(priority: Task['priority']): string {
    switch (priority) {
      case 'high': return '🔴 HIGH';
      case 'medium': return '🟡 MEDIUM';
      case 'low': return '🟢 LOW';
      default: return '';
    }
  }
}
