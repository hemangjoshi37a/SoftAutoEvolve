/**
 * Compact UI
 * Provides clean, informative progress display without verbosity
 */
export class CompactUI {
  private startTime: number = Date.now();
  private currentTask: string = '';
  private taskStartTime: number = 0;

  /**
   * Show cycle header
   */
  public showCycleHeader(cycleNumber: number): void {
    console.log(`\n╔═══ Cycle ${cycleNumber} ${'═'.repeat(50)}`);
    console.log(`╚═══ ${new Date().toLocaleTimeString()}\n`);
  }

  /**
   * Show task start
   */
  public showTaskStart(task: string): void {
    this.currentTask = task;
    this.taskStartTime = Date.now();
    console.log(`📝 ${task}`);
  }

  /**
   * Show progress indicator
   */
  public showProgress(step: string, status: 'running' | 'done' | 'error' = 'running'): void {
    const icon = status === 'done' ? '✓' : status === 'error' ? '✗' : '⏳';
    const color = status === 'done' ? '\x1b[32m' : status === 'error' ? '\x1b[31m' : '\x1b[36m';
    console.log(`   ${color}${icon}\x1b[0m ${step}`);
  }

  /**
   * Show task completion
   */
  public showTaskComplete(success: boolean): void {
    const duration = Math.floor((Date.now() - this.taskStartTime) / 1000);
    const icon = success ? '✅' : '⚠️';
    console.log(`   ${icon} Completed in ${duration}s\n`);
  }

  /**
   * Show cycle summary
   */
  public showCycleSummary(stats: {
    tasksCompleted: number;
    tasksTotal: number;
    commits: number;
    duration: number;
  }): void {
    console.log(`\n╔═══ Summary ${'═'.repeat(50)}`);
    console.log(`║ Tasks: ${stats.tasksCompleted}/${stats.tasksTotal} | Commits: ${stats.commits} | Duration: ${stats.duration}s`);
    console.log(`╚${'═'.repeat(62)}\n`);
  }

  /**
   * Show error
   */
  public showError(error: string): void {
    console.log(`\n❌ Error: ${error}\n`);
  }

  /**
   * Show warning
   */
  public showWarning(warning: string): void {
    console.log(`⚠️  ${warning}`);
  }

  /**
   * Show info
   */
  public showInfo(info: string): void {
    console.log(`ℹ️  ${info}`);
  }

  /**
   * Show spinning progress (for long operations)
   */
  public async withSpinner<T>(
    operation: Promise<T>,
    message: string
  ): Promise<T> {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    const startTime = Date.now();

    process.stdout.write(`   ${message}: `);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r   ${spinner[spinnerIndex]} ${message}: ${elapsed}s`);
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
    }, 100);

    try {
      const result = await operation;
      clearInterval(interval);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r   ✓ ${message}: ${duration}s\n`);
      return result;
    } catch (error: any) {
      clearInterval(interval);
      process.stdout.write(`\r   ✗ ${message}: ${error.message}\n`);
      throw error;
    }
  }

  /**
   * Show file changes
   */
  public showFileChanges(files: string[]): void {
    if (files.length === 0) return;

    console.log(`   📄 Changes:`);
    for (const file of files.slice(0, 5)) {
      console.log(`      • ${file}`);
    }
    if (files.length > 5) {
      console.log(`      ... and ${files.length - 5} more files`);
    }
  }

  /**
   * Show test results
   */
  public showTestResults(results: {
    passed: number;
    failed: number;
    total: number;
  }): void {
    const icon = results.failed === 0 ? '✅' : '⚠️';
    const color = results.failed === 0 ? '\x1b[32m' : '\x1b[33m';
    console.log(`   ${icon} Tests: ${color}${results.passed}/${results.total} passed\x1b[0m`);
  }
}
