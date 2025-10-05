import { ParallelBranchManager, ParallelBranch, BranchStatus } from './parallel-branch-manager.js';
import { TaskCoordinator } from './task-coordinator.js';
import * as readline from 'readline';

/**
 * Interactive CLI Dashboard
 * Provides real-time visualization of parallel branch execution
 */
export class InteractiveCLI {
  private branchManager: ParallelBranchManager;
  private coordinator: TaskCoordinator;
  private updateInterval: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private logs: string[] = [];
  private maxLogs: number = 10;

  constructor(branchManager: ParallelBranchManager, coordinator: TaskCoordinator) {
    this.branchManager = branchManager;
    this.coordinator = coordinator;
  }

  /**
   * Start the interactive dashboard
   */
  public start(): void {
    this.running = true;

    // Clear screen
    this.clearScreen();

    // Show initial dashboard
    this.render();

    // Setup periodic updates
    this.updateInterval = setInterval(() => {
      if (this.running) {
        this.render();
      }
    }, 2000); // Update every 2 seconds

    // Setup keyboard input (optional - for stopping)
    this.setupKeyboardInput();
  }

  /**
   * Stop the dashboard
   */
  public stop(): void {
    this.running = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Add a log entry
   */
  public log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Render the dashboard
   */
  private render(): void {
    // Clear screen and move cursor to top
    this.clearScreen();

    const width = process.stdout.columns || 80;
    const separator = '═'.repeat(width);

    // Header
    console.log(this.color('╔' + separator + '╗', 'cyan'));
    console.log(
      this.color('║', 'cyan') +
        this.centerText('🤖 SoftAutoEvolve - Parallel Development Dashboard', width) +
        this.color('║', 'cyan')
    );
    console.log(this.color('╚' + separator + '╝', 'cyan'));
    console.log('');

    // Capacity Info
    const capacity = this.branchManager.getCapacity();
    console.log(this.color('📊 Capacity:', 'blue', true));
    console.log(
      `   Active: ${capacity.current}/${capacity.max}  ` +
        `Available: ${capacity.available}  ` +
        `Progress: ${this.coordinator.getProgress()}%`
    );
    console.log('');

    // Branch Status
    const branches = this.branchManager.getAllBranches();
    if (branches.length === 0) {
      console.log(this.color('No active branches', 'yellow'));
    } else {
      console.log(this.color('🌳 Active Branches:', 'blue', true));
      console.log('');

      for (const branch of branches) {
        this.renderBranch(branch);
      }
    }

    // Coordinator Status
    console.log('');
    console.log(this.color('🎯 Task Coordination:', 'blue', true));
    console.log(`   ${this.coordinator.getSummary()}`);
    console.log('');

    // Recent Logs
    if (this.logs.length > 0) {
      console.log(this.color('📝 Recent Activity:', 'blue', true));
      for (const log of this.logs.slice(-5)) {
        console.log(`   ${log}`);
      }
      console.log('');
    }

    // Footer
    console.log(separator);
    console.log(this.color('Press Ctrl+C to stop', 'gray'));
  }

  /**
   * Render a single branch
   */
  private renderBranch(branch: ParallelBranch): void {
    const statusIcon = this.getStatusIcon(branch.status);
    const statusColor = this.getStatusColor(branch.status);
    const elapsed = this.getElapsedTime(branch.startTime);
    const progress = branch.tasks.length > 0
      ? Math.round((branch.tasksCompleted / branch.tasks.length) * 100)
      : 0;

    // Branch name and status
    console.log(
      `  ${statusIcon} ${this.color(branch.name, statusColor)} ` +
        `(${this.color(branch.status, statusColor)})`
    );

    // Progress bar
    const progressBar = this.createProgressBar(progress, 30);
    console.log(`     ${progressBar} ${progress}%`);

    // Details
    console.log(
      `     Tasks: ${branch.tasksCompleted}/${branch.tasks.length} | ` +
        `Failed: ${branch.tasksFailed} | ` +
        `Runtime: ${elapsed} | ` +
        `Priority: ${branch.priority}`
    );
    console.log('');
  }

  /**
   * Create a progress bar
   */
  private createProgressBar(percentage: number, width: number): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const filledBar = this.color('█'.repeat(filled), 'green');
    const emptyBar = this.color('░'.repeat(empty), 'gray');

    return `[${filledBar}${emptyBar}]`;
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: BranchStatus): string {
    switch (status) {
      case BranchStatus.IDLE:
        return '⏸️ ';
      case BranchStatus.PLANNING:
        return '📋';
      case BranchStatus.IMPLEMENTING:
        return '🔨';
      case BranchStatus.EVOLVING:
        return '🧬';
      case BranchStatus.TESTING:
        return '🧪';
      case BranchStatus.MERGING:
        return '🔀';
      case BranchStatus.COMPLETED:
        return '✅';
      case BranchStatus.FAILED:
        return '❌';
      default:
        return '❓';
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: BranchStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' {
    switch (status) {
      case BranchStatus.COMPLETED:
        return 'green';
      case BranchStatus.FAILED:
        return 'red';
      case BranchStatus.IMPLEMENTING:
      case BranchStatus.EVOLVING:
      case BranchStatus.TESTING:
        return 'yellow';
      case BranchStatus.MERGING:
        return 'blue';
      default:
        return 'gray';
    }
  }

  /**
   * Get elapsed time
   */
  private getElapsedTime(startTime: Date): string {
    const elapsed = Date.now() - startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Clear screen
   */
  private clearScreen(): void {
    console.clear();
    // Alternative: process.stdout.write('\x1Bc');
  }

  /**
   * Center text
   */
  private centerText(text: string, width: number): string {
    // Remove ANSI codes for length calculation
    const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, Math.floor((width - cleanText.length) / 2));
    return ' '.repeat(padding) + text + ' '.repeat(padding);
  }

  /**
   * Add color to text
   */
  private color(
    text: string,
    color: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'gray',
    bold: boolean = false
  ): string {
    const colors: Record<string, string> = {
      red: '31',
      green: '32',
      yellow: '33',
      blue: '34',
      cyan: '36',
      gray: '90',
    };

    const colorCode = colors[color] || '37';
    const boldCode = bold ? '1;' : '';

    return `\x1b[${boldCode}${colorCode}m${text}\x1b[0m`;
  }

  /**
   * Setup keyboard input for interactive control
   */
  private setupKeyboardInput(): void {
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
      }

      process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
          this.stop();
          process.exit(0);
        }

        // Additional controls can be added here
        // For example:
        // - 'p' to pause
        // - 'r' to resume
        // - 's' to show summary
      });
    }
  }

  /**
   * Create a simple table
   */
  public static createTable(headers: string[], rows: string[][]): string {
    const colWidths = headers.map((h, i) => {
      const maxRowWidth = Math.max(...rows.map((r) => (r[i] || '').length));
      return Math.max(h.length, maxRowWidth);
    });

    let table = '';

    // Header
    const headerRow = headers
      .map((h, i) => h.padEnd(colWidths[i]))
      .join(' | ');
    table += headerRow + '\n';
    table += colWidths.map((w) => '-'.repeat(w)).join('-+-') + '\n';

    // Rows
    for (const row of rows) {
      table += row
        .map((cell, i) => (cell || '').padEnd(colWidths[i]))
        .join(' | ') + '\n';
    }

    return table;
  }

  /**
   * Show a simple spinner
   */
  public static spinner(message: string): { stop: () => void } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    let running = true;

    const interval = setInterval(() => {
      if (running) {
        process.stdout.write(`\r${frames[i]} ${message}`);
        i = (i + 1) % frames.length;
      }
    }, 80);

    return {
      stop: () => {
        running = false;
        clearInterval(interval);
        process.stdout.write('\r\x1b[K'); // Clear line
      },
    };
  }
}
