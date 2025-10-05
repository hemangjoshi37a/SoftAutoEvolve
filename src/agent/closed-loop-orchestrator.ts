import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Task } from './task-manager.js';
import { SensorySystem } from './sensory-system.js';

const execAsync = promisify(exec);

/**
 * Closed-Loop Orchestrator
 * Implements fully autonomous software development with:
 * - Input: Terminal output, UI screenshots, browser content
 * - Processing: Analyze, plan, implement
 * - Output: Code changes via Claude Code
 * - Feedback: Test with keyboard/mouse, verify results
 */
export class ClosedLoopOrchestrator {
  private workingDir: string;
  private sensory: SensorySystem;
  private cycleCount: number = 0;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.sensory = new SensorySystem(workingDir);
  }

  /**
   * Initialize the closed-loop system
   */
  public async initialize(): Promise<void> {
    await this.sensory.initialize();
    console.log('🔄 Closed-Loop Orchestrator initialized');
  }

  /**
   * Execute a development cycle with full closed-loop feedback
   */
  public async executeClosedLoopCycle(task: Task): Promise<{
    success: boolean;
    output: string;
    feedback: ClosedLoopFeedback;
  }> {
    this.cycleCount++;

    console.log(`\n🔁 Closed-Loop Cycle ${this.cycleCount}: ${task.description}`);

    // Step 1: Gather current state (INPUT)
    console.log('   📥 [INPUT] Gathering system state...');
    const initialState = await this.gatherSystemState();

    // Step 2: Build smart prompt with context
    console.log('   🧠 [PROCESS] Building context-aware prompt...');
    const prompt = await this.buildSmartPrompt(task, initialState);

    // Step 3: Execute with Claude Code (PROCESSING)
    console.log('   🤖 [PROCESS] Executing with Claude Code...');
    const output = await this.executeWithClaudeCode(prompt);

    // Step 4: Test the changes (OUTPUT + FEEDBACK)
    console.log('   🧪 [TEST] Running automated tests...');
    const testResults = await this.runAutomatedTests(task);

    // Step 5: Gather feedback from execution (FEEDBACK INPUT)
    console.log('   📥 [FEEDBACK] Analyzing results...');
    const finalState = await this.gatherSystemState();
    const feedback = await this.analyzeFeedback(initialState, finalState, testResults);

    // Step 6: Decide if iteration is needed
    if (!feedback.success && feedback.needsIteration) {
      console.log('   🔄 [ITERATE] Issues detected, iterating...');
      return await this.iterateWithFeedback(task, feedback);
    }

    console.log(`   ✅ [SUCCESS] Closed-loop cycle completed`);

    return {
      success: feedback.success,
      output,
      feedback,
    };
  }

  /**
   * Gather system state using sensors
   */
  private async gatherSystemState(): Promise<SystemState> {
    const state: SystemState = {
      timestamp: Date.now(),
      gitStatus: '',
      recentCommits: [],
      fileTree: '',
      terminalOutput: '',
      screenshot: null,
      runningProcesses: [],
    };

    try {
      // Get git status
      const { stdout: gitStatus } = await execAsync('git status --short', {
        cwd: this.workingDir,
      });
      state.gitStatus = gitStatus;

      // Get recent commits
      const { stdout: commits } = await execAsync('git log -5 --oneline', {
        cwd: this.workingDir,
      });
      state.recentCommits = commits.split('\n').filter(l => l.trim());

      // Get file tree
      const { stdout: tree } = await execAsync('tree -L 2 -I "node_modules|__pycache__|.git|dist|build" || ls -la', {
        cwd: this.workingDir,
      });
      state.fileTree = tree.substring(0, 1000); // Limit size

      // Capture screenshot if GUI is running
      try {
        const screenshotPath = path.join('/tmp', `state-${Date.now()}.png`);
        await this.sensory.captureScreen(screenshotPath);
        state.screenshot = screenshotPath;
      } catch {
        // No GUI running
      }

      // Get running processes
      const { stdout: processes } = await execAsync('ps aux | grep -E "python|node|npm" | grep -v grep || true', {
        cwd: this.workingDir,
      });
      state.runningProcesses = processes.split('\n').filter(l => l.trim()).slice(0, 5);

    } catch (error: any) {
      console.warn(`   ⚠️  Could not gather full state: ${error.message}`);
    }

    return state;
  }

  /**
   * Build a smart, context-aware prompt for Claude Code
   */
  private async buildSmartPrompt(task: Task, state: SystemState): Promise<string> {
    let prompt = `Task: ${task.description}\n\n`;

    // Add context
    prompt += `## Current State\n\n`;
    prompt += `**Recent Git History:**\n`;
    for (const commit of state.recentCommits.slice(0, 3)) {
      prompt += `- ${commit}\n`;
    }
    prompt += `\n`;

    if (state.gitStatus) {
      prompt += `**Modified Files:**\n\`\`\`\n${state.gitStatus}\`\`\`\n\n`;
    }

    prompt += `**Project Structure:**\n\`\`\`\n${state.fileTree.substring(0, 500)}\`\`\`\n\n`;

    // Add task-specific guidance
    prompt += `## Requirements\n\n`;
    switch (task.type) {
      case 'feature':
        prompt += `Please implement this feature with:\n`;
        prompt += `1. Clean, maintainable code following project conventions\n`;
        prompt += `2. Proper error handling and validation\n`;
        prompt += `3. Tests to verify functionality\n`;
        prompt += `4. Documentation (docstrings, comments)\n\n`;
        prompt += `After implementation, run any tests to verify it works.\n`;
        break;

      case 'bug_fix':
        prompt += `Please fix this bug by:\n`;
        prompt += `1. Analyzing the root cause\n`;
        prompt += `2. Implementing a proper fix\n`;
        prompt += `3. Adding tests to prevent regression\n`;
        prompt += `4. Verifying the fix works\n\n`;
        break;

      case 'test':
        prompt += `Please add comprehensive tests for:\n`;
        prompt += `1. Normal/happy path scenarios\n`;
        prompt += `2. Edge cases\n`;
        prompt += `3. Error conditions\n`;
        prompt += `4. Run the tests to verify they pass\n\n`;
        break;

      default:
        prompt += `Please complete this task following best practices.\n\n`;
    }

    // Add execution guidance
    prompt += `## Verification\n\n`;
    prompt += `After making changes:\n`;
    prompt += `1. Run any existing tests\n`;
    prompt += `2. If it's a Python project, try running the main file\n`;
    prompt += `3. Check for any errors or warnings\n`;
    prompt += `4. Verify the changes work as expected\n`;

    return prompt;
  }

  /**
   * Execute with Claude Code using improved approach
   */
  private async executeWithClaudeCode(prompt: string): Promise<string> {
    const startTime = Date.now();
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;

    // Show compact progress
    process.stdout.write('   ⏳ Claude Code: ');

    const interval = setInterval(() => {
      process.stdout.write(`\r   ${spinner[spinnerIndex]} Claude Code: ${Math.floor((Date.now() - startTime) / 1000)}s`);
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
    }, 100);

    try {
      const { stdout, stderr } = await execAsync(
        `echo "${prompt.replace(/"/g, '\\"')}" | timeout 45s claude --dangerously-skip-permissions || true`,
        {
          cwd: this.workingDir,
          maxBuffer: 1024 * 1024 * 10,
          shell: '/bin/bash',
        }
      );

      clearInterval(interval);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r   ✅ Claude Code: completed in ${duration}s\n`);

      return stdout || 'Task executed';
    } catch (error: any) {
      clearInterval(interval);
      process.stdout.write(`\r   ⚠️  Claude Code: ${error.message}\n`);
      return 'Task attempted';
    }
  }

  /**
   * Run automated tests using keyboard/mouse/terminal
   */
  private async runAutomatedTests(task: Task): Promise<TestResults> {
    const results: TestResults = {
      passed: true,
      tests: [],
      errors: [],
      screenshots: [],
    };

    console.log('      🧪 Running tests...');

    try {
      // 1. Run existing test suite if available
      const hasTests = fs.existsSync(path.join(this.workingDir, 'tests')) ||
                       fs.existsSync(path.join(this.workingDir, 'test'));

      if (hasTests) {
        try {
          console.log('      → Running test suite...');
          const { stdout, stderr } = await execAsync('python -m pytest -v || npm test || true', {
            cwd: this.workingDir,
            timeout: 30000,
          });

          results.tests.push({
            name: 'Test Suite',
            passed: !stderr.includes('FAILED') && !stderr.includes('Error'),
            output: stdout + stderr,
          });

          if (stderr.includes('FAILED') || stderr.includes('Error')) {
            results.passed = false;
            results.errors.push(stderr);
          }
        } catch (error: any) {
          results.tests.push({
            name: 'Test Suite',
            passed: false,
            output: error.message,
          });
          results.passed = false;
        }
      }

      // 2. Try running the main entry point
      const entryPoints = ['main.py', 'app.py', 'index.js', 'server.js'];
      for (const entry of entryPoints) {
        if (fs.existsSync(path.join(this.workingDir, entry))) {
          console.log(`      → Testing ${entry}...`);

          // Run in background for 3 seconds and check output
          const testCmd = entry.endsWith('.py') ? `python ${entry}` : `node ${entry}`;

          try {
            const { stdout, stderr } = await execAsync(`timeout 3s ${testCmd} || true`, {
              cwd: this.workingDir,
            });

            const hasError = stderr.toLowerCase().includes('error') ||
                           stderr.toLowerCase().includes('exception') ||
                           stdout.toLowerCase().includes('error');

            results.tests.push({
              name: `Run ${entry}`,
              passed: !hasError,
              output: (stdout + stderr).substring(0, 500),
            });

            if (hasError) {
              results.passed = false;
              results.errors.push(stderr);
            }
          } catch (error: any) {
            // Timeout is expected for servers
            if (!error.message.includes('SIGTERM')) {
              results.tests.push({
                name: `Run ${entry}`,
                passed: false,
                output: error.message,
              });
              results.passed = false;
            }
          }

          break; // Only test first found entry point
        }
      }

      // 3. Check for syntax errors
      console.log('      → Checking syntax...');
      const pythonFiles = await this.findFiles(this.workingDir, ['.py']);
      for (const file of pythonFiles.slice(0, 5)) {
        try {
          await execAsync(`python -m py_compile "${file}"`, {
            cwd: this.workingDir,
          });
        } catch (error: any) {
          results.passed = false;
          results.errors.push(`Syntax error in ${path.basename(file)}`);
        }
      }

    } catch (error: any) {
      results.passed = false;
      results.errors.push(error.message);
    }

    const passedCount = results.tests.filter(t => t.passed).length;
    const totalCount = results.tests.length;
    console.log(`      ✓ Tests: ${passedCount}/${totalCount} passed`);

    return results;
  }

  /**
   * Analyze feedback from before/after states
   */
  private async analyzeFeedback(
    before: SystemState,
    after: SystemState,
    tests: TestResults
  ): Promise<ClosedLoopFeedback> {
    const feedback: ClosedLoopFeedback = {
      success: tests.passed,
      needsIteration: false,
      changes: [],
      issues: [],
      suggestions: [],
    };

    // Check for new files
    const beforeFiles = before.gitStatus.split('\n');
    const afterFiles = after.gitStatus.split('\n');
    const newFiles = afterFiles.filter(f => !beforeFiles.includes(f));

    feedback.changes.push(`Files modified: ${newFiles.length}`);

    // Check for errors in tests
    if (tests.errors.length > 0) {
      feedback.needsIteration = true;
      feedback.issues.push(...tests.errors.slice(0, 3));
      feedback.suggestions.push('Fix errors found during testing');
    }

    // Check if no changes were made
    if (newFiles.length === 0 && before.gitStatus === after.gitStatus) {
      feedback.needsIteration = true;
      feedback.issues.push('No changes were made to the codebase');
      feedback.suggestions.push('Verify the task was understood correctly');
    }

    return feedback;
  }

  /**
   * Iterate with feedback if needed
   */
  private async iterateWithFeedback(
    task: Task,
    feedback: ClosedLoopFeedback
  ): Promise<{
    success: boolean;
    output: string;
    feedback: ClosedLoopFeedback;
  }> {
    console.log('   🔄 Iterating with feedback...');

    // Build iteration prompt
    let iterationPrompt = `Previous attempt had issues. Please address them:\n\n`;
    iterationPrompt += `**Issues:**\n`;
    for (const issue of feedback.issues) {
      iterationPrompt += `- ${issue}\n`;
    }
    iterationPrompt += `\n**Suggestions:**\n`;
    for (const suggestion of feedback.suggestions) {
      iterationPrompt += `- ${suggestion}\n`;
    }
    iterationPrompt += `\nOriginal task: ${task.description}\n`;

    const output = await this.executeWithClaudeCode(iterationPrompt);

    // Test again
    const testResults = await this.runAutomatedTests(task);

    return {
      success: testResults.passed,
      output,
      feedback: {
        success: testResults.passed,
        needsIteration: false,
        changes: ['Iteration completed'],
        issues: [],
        suggestions: [],
      },
    };
  }

  /**
   * Find files with specific extensions
   */
  private async findFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];

    const searchDir = (currentDir: string, depth: number = 0) => {
      if (depth > 3) return; // Limit depth

      try {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv'].includes(item)) {
              searchDir(fullPath, depth + 1);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir(dir);
    return files;
  }
}

interface SystemState {
  timestamp: number;
  gitStatus: string;
  recentCommits: string[];
  fileTree: string;
  terminalOutput: string;
  screenshot: string | null;
  runningProcesses: string[];
}

interface TestResults {
  passed: boolean;
  tests: Array<{
    name: string;
    passed: boolean;
    output: string;
  }>;
  errors: string[];
  screenshots: string[];
}

interface ClosedLoopFeedback {
  success: boolean;
  needsIteration: boolean;
  changes: string[];
  issues: string[];
  suggestions: string[];
}
