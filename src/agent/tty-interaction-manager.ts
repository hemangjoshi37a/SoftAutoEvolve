import * as pty from 'node-pty';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * TTY Interaction Manager - REAL PTY VERSION
 *
 * Shows the ACTUAL Claude Code interactive UI in the terminal
 * while smartly injecting prompts and slash commands
 *
 * This is the core of autonomous control - we see everything Claude Code does
 * while our system intelligently feeds it the right prompts
 */
export class TTYInteractionManager {
  private workingDir: string;
  private currentPty: pty.IPty | null = null;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Execute Claude Code with VISIBLE interactive UI
   * This shows the full Claude Code experience while we control it
   */
  async executeClaudeCodeInteractive(prompt: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  🤖 CLAUDE CODE INTERACTIVE SESSION                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Ensure stdout is not buffered for real-time output
    // We use stdin for raw mode, not stdout
    if (process.stdin.isTTY && (process.stdin as any).setRawMode) {
      (process.stdin as any).setRawMode(false);
    }

    const startTime = Date.now();
    let output = '';
    let filesChanged: string[] = [];
    let hasStarted = false;
    let promptSent = false;
    let hasConfirmedSlashCommand = false; // Track if we've already confirmed

    // Smart state detection
    let lastActivityTime = Date.now();
    let isProcessing = false;
    let idleCheckTimer: NodeJS.Timeout | null = null;

    return new Promise((resolve, reject) => {
      // Spawn Claude Code in a REAL PTY (pseudo-terminal)
      // This gives us the full interactive UI with proper terminal size
      const cols = process.stdout.columns || 120;
      const rows = process.stdout.rows || 40;

      const ptyProcess = pty.spawn('claude', [], {
        name: 'xterm-256color',
        cols: cols,
        rows: rows,
        cwd: this.workingDir,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          FORCE_COLOR: '1',
          // Disable all buffering for live updates
          PYTHONUNBUFFERED: '1',
          NODE_NO_READLINE: '1'
        }
      });

      // Handle terminal resize events for proper live updating
      if (process.stdout.isTTY) {
        process.stdout.on('resize', () => {
          ptyProcess.resize(process.stdout.columns || 120, process.stdout.rows || 40);
        });
      }

      this.currentPty = ptyProcess;

      // Capture ALL output and display it in REAL-TIME (unbuffered)
      ptyProcess.onData((data: string) => {
        // Write directly to stdout - completely unbuffered
        // This shows LIVE updates as Claude Code generates them
        setImmediate(() => {
          process.stdout.write(data);
        });

        output += data;

        // SMART STATE DETECTION - Watch for Claude Code activity indicators
        const activityIndicators = [
          '✻', '✽', '✶', '✢', '·', '*',  // Spinner characters Claude uses
          'Thinking', 'Analyzing', 'Processing', 'Generating',
          'Effecting', 'Befuddling', 'Contemplating', 'Pondering',
          'Reading', 'Writing', 'Modifying', 'Creating',
          '(esc to interrupt)' // Shows when actively processing
        ];

        const idleIndicators = [
          '? for shortcuts',  // Main prompt ready
          'Try "',            // Prompt suggestions
          '> ',               // Input cursor without activity
          '────────'          // Separator line when idle
        ];

        // Detect if Claude is ACTIVELY processing
        const isActiveNow = activityIndicators.some(indicator => data.includes(indicator));
        const isIdleNow = idleIndicators.some(indicator => data.includes(indicator)) &&
                          !activityIndicators.some(indicator => data.includes(indicator));

        if (isActiveNow) {
          isProcessing = true;
          lastActivityTime = Date.now();

          // Clear any pending idle check
          if (idleCheckTimer) {
            clearTimeout(idleCheckTimer);
            idleCheckTimer = null;
          }
        }

        if (isIdleNow && isProcessing) {
          // Claude JUST became idle - set up debounced check
          if (idleCheckTimer) {
            clearTimeout(idleCheckTimer);
          }

          // Wait 2 seconds of continued idle before acting (debounce)
          idleCheckTimer = setTimeout(() => {
            const idleTime = Date.now() - lastActivityTime;
            if (idleTime >= 2000) { // 2 seconds of idle
              console.log('\n[🔍 Smart System: Claude Code became idle]\n');
              isProcessing = false;

              // Ready for next prompt if needed
              if (promptSent && options.onIdleDetected) {
                options.onIdleDetected();
              }
            }
          }, 2000);
        }

        // Auto-answer API key prompt (select "Yes")
        if (data.includes('Do you want to use this API key?')) {
          setTimeout(() => {
            console.log('\n[🧠 Smart System: Auto-selecting API key...]\n');
            // Press up arrow to select "Yes", then Enter
            ptyProcess.write('\x1B[A'); // Up arrow
            setTimeout(() => {
              ptyProcess.write('\r'); // Enter
            }, 100);
          }, 300);
        }

        // Auto-answer slash command confirmation prompts (one-time trigger)
        if (!hasConfirmedSlashCommand && data.includes('Do you want to proceed?')) {
          hasConfirmedSlashCommand = true; // Mark as confirmed
          console.log('\n[🧠 Smart System: Detected slash command prompt, auto-confirming...]\n');

          // Send Enter immediately
          setTimeout(() => {
            ptyProcess.write('\r'); // Enter
            console.log('[🧠 Smart System: Sent Enter key]\n');
            isProcessing = true;
            lastActivityTime = Date.now();
          }, 300); // Reduced timeout for faster response
        }

        // Detect when Claude is ready for FIRST input (shows prompt or input field)
        if (!hasStarted && (
          data.includes('Try "') ||
          data.includes('Welcome back!') ||
          data.includes('? for shortcuts')
        )) {
          hasStarted = true;
          // Send prompt immediately once we see the input field
          setTimeout(() => {
            console.log('\n[🧠 Smart System: Injecting initial prompt...]\n');
            // Type the prompt
            ptyProcess.write(prompt);
            // Wait a moment, then press Enter
            setTimeout(() => {
              ptyProcess.write('\r');
              promptSent = true;
              isProcessing = true;
              lastActivityTime = Date.now();
            }, 200);
          }, 1000);
        }

        // Detect file changes in real-time
        const newFiles = this.detectFileChanges(data);
        newFiles.forEach(f => {
          if (!filesChanged.includes(f)) {
            filesChanged.push(f);
          }
        });
      });

      // Handle PTY exit
      ptyProcess.onExit(({ exitCode, signal }) => {
        const duration = Math.floor((Date.now() - startTime) / 1000);

        // Clean up idle check timer
        if (idleCheckTimer) {
          clearTimeout(idleCheckTimer);
          idleCheckTimer = null;
        }

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log(`║  ✓ Claude Code session ended (${duration}s)                ║`);
        console.log('╚════════════════════════════════════════════════════════╝\n');

        this.currentPty = null;

        resolve({
          success: exitCode === 0,
          output,
          filesChanged,
          duration,
          error: exitCode !== 0 ? `Exit code: ${exitCode}` : undefined
        });
      });

      // Set timeout
      const timeout = options.timeout || 180000; // 3 minutes default
      setTimeout(() => {
        if (this.currentPty) {
          console.log('\n[⏱️  Timeout reached - closing session]\n');
          ptyProcess.kill();
        }
      }, timeout);
    });
  }

  /**
   * Execute slash command via PTY
   * Shows the full Spec-Kit interaction
   */
  async executeSlashCommand(command: string, context: string = ''): Promise<ExecutionResult> {
    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  📋 SLASH COMMAND: ${command.padEnd(35)} ║`);
    console.log(`╚════════════════════════════════════════════════════════╝\n`);

    // Build the full prompt with slash command
    const fullPrompt = context ? `${command}\n\n${context}` : command;

    // Execute in interactive mode so we see everything
    return this.executeClaudeCodeInteractive(fullPrompt, { timeout: 120000 });
  }

  /**
   * Execute multiple actions in sequence
   * Each one shows the full Claude Code UI
   */
  async executeSequence(prompts: string[], options: SequenceOptions = {}): Promise<SequenceResult> {
    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  🔄 EXECUTING ${prompts.length} ACTIONS IN SEQUENCE              ║`);
    console.log(`╚════════════════════════════════════════════════════════╝\n`);

    const results: ExecutionResult[] = [];

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];

      console.log(`\n┌─ Action ${i + 1}/${prompts.length} ─────────────────────────────────────────┐`);
      console.log(`│ ${prompt.substring(0, 70)}...`);
      console.log(`└──────────────────────────────────────────────────────────┘\n`);

      const result = await this.executeClaudeCodeInteractive(prompt, {
        timeout: options.timeout || 180000
      });

      results.push(result);

      // Stop on error if requested
      if (!result.success && options.stopOnError) {
        console.log('\n⚠️  Stopping sequence due to error\n');
        break;
      }

      // Wait between actions
      if (i < prompts.length - 1 && options.waitBetween) {
        console.log(`\n[⏳ Waiting ${options.waitBetween}s before next action...]\n`);
        await new Promise(resolve => setTimeout(resolve, options.waitBetween! * 1000));
      }
    }

    const allFiles = [...new Set(results.flatMap(r => r.filesChanged))];
    const successful = results.filter(r => r.success).length;

    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  ✓ SEQUENCE COMPLETE: ${successful}/${prompts.length} successful            ║`);
    console.log(`║  📁 Files changed: ${allFiles.length}                              ║`);
    console.log(`╚════════════════════════════════════════════════════════╝\n`);

    return {
      results,
      allFilesChanged: allFiles,
      successCount: successful,
      totalCount: prompts.length
    };
  }

  /**
   * Execute with Spec-Kit workflow
   * Shows full Claude Code UI for each step
   */
  async executeWithSpecKit(actions: string[], specKitCommands: string[] = []): Promise<SequenceResult> {
    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  📋 SPEC-KIT WORKFLOW                                  ║`);
    console.log(`╚════════════════════════════════════════════════════════╝\n`);

    const allPrompts: string[] = [];

    // Step 1: Spec-Kit planning commands
    for (const cmd of specKitCommands) {
      const context = actions.join('\n');
      allPrompts.push(`${cmd}\n\n${context}`);
    }

    // Step 2: Implementation actions
    for (const action of actions) {
      allPrompts.push(this.buildSmartPrompt(action));
    }

    // Execute all in sequence with full visibility
    return this.executeSequence(allPrompts, {
      timeout: 180000,
      waitBetween: 2,
      stopOnError: false
    });
  }

  /**
   * Build smart prompt that emphasizes action
   */
  private buildSmartPrompt(action: string): string {
    return `${action}

## 🎯 Implementation Task

⚠️  **YOU MUST CREATE OR MODIFY FILES!**

Requirements:
✅ Write actual code (create new or modify existing files)
✅ Make real, working changes to the codebase
✅ Add new functionality with proper implementation
✅ Include error handling and edge cases
✅ Add comments explaining the code
✅ Test that it works

❌ DO NOT just analyze or plan
❌ DO NOT skip implementation
❌ DO NOT stop if file exists - modify it!

**START IMPLEMENTING NOW:**`;
  }

  /**
   * Detect file changes from Claude's output
   */
  private detectFileChanges(output: string): string[] {
    const files: string[] = [];
    const patterns = [
      /Created:?\s+([^\s\n]+)/gi,
      /Modified:?\s+([^\s\n]+)/gi,
      /Updated:?\s+([^\s\n]+)/gi,
      /Writing\s+to\s+([^\s\n]+)/gi,
      /Wrote\s+([^\s\n]+)/gi,
      /✓\s+([^\s\n]+\.(?:ts|js|py|go|rs|java|cpp|c|h|md|json|yaml|yml))/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const file = match[1].trim();
        if (file && !file.includes(' ') && !files.includes(file)) {
          files.push(file);
        }
      }
    }

    return files;
  }

  /**
   * Gracefully close current PTY session
   */
  closeCurrent(): void {
    if (this.currentPty) {
      this.currentPty.kill();
      this.currentPty = null;
    }
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.currentPty !== null;
  }
}

// Type definitions
export interface ExecutionOptions {
  timeout?: number;
  stopOnError?: boolean;
  waitAfter?: number;
  onIdleDetected?: () => void; // Callback when Claude Code becomes idle
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  filesChanged: string[];
  duration: number;
  error?: string;
}

export interface SequenceOptions {
  timeout?: number;
  waitBetween?: number; // seconds between actions
  stopOnError?: boolean;
}

export interface SequenceResult {
  results: ExecutionResult[];
  allFilesChanged: string[];
  successCount: number;
  totalCount: number;
}

export interface VerificationResult {
  verified: string[];
  missing: string[];
  success: boolean;
}

// Legacy interface for backward compatibility
export interface SlashCommand {
  type: 'spec-kit' | 'claude-code';
  command: string;
  input?: string;
  options?: ExecutionOptions;
}
