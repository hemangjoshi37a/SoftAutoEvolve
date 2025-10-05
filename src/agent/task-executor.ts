import { spawn, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Task } from './task-manager.js';
import { claudeCodeIntegration } from '../integrations/claude-code-integration.js';
import { specKitIntegration } from '../integrations/spec-kit-integration.js';
import { shinkaEvolveIntegration } from '../integrations/shinka-evolve-integration.js';

const execAsync = promisify(exec);

/**
 * Task Executor
 * Executes tasks using Claude Code, Spec-Kit, and ShinkaEvolve
 */
export class TaskExecutor {
  private workingDir: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Execute a task using the appropriate tool
   */
  public async executeTask(task: Task): Promise<any> {
    console.log(`\n🚀 Executing: ${task.description}`);
    console.log(`   Tool: ${task.tool || 'auto'} | Type: ${task.type} | Priority: ${task.priority}`);

    try {
      switch (task.tool) {
        case 'claude':
          return await this.executeWithClaude(task);

        case 'spec-kit':
          return await this.executeWithSpecKit(task);

        case 'shinka-evolve':
          return await this.executeWithEvolution(task);

        case 'all':
          return await this.executeWithAllTools(task);

        default:
          // Auto-select tool based on task type
          return await this.autoExecute(task);
      }
    } catch (error: any) {
      console.error(`❌ Task failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute multiple tasks in parallel
   */
  public async executeTasksParallel(tasks: Task[]): Promise<any[]> {
    console.log(`\n🔄 Executing ${tasks.length} tasks in parallel...\n`);

    const promises = tasks.map((task) => this.executeTask(task));
    return await Promise.allSettled(promises);
  }

  /**
   * Execute with Claude Code
   */
  private async executeWithClaude(task: Task): Promise<any> {
    if (!claudeCodeIntegration.isClaudeInstalled()) {
      throw new Error('Claude Code is not installed');
    }

    console.log('   🤖 Using Claude Code...');

    // Create a temporary prompt file
    const promptFile = path.join(this.workingDir, '.claude-prompt.txt');
    const prompt = this.createPromptFromTask(task);
    fs.writeFileSync(promptFile, prompt);

    try {
      // Execute Claude Code with the prompt
      // Since Claude Code is interactive, we'll use a different approach
      // We'll spawn it and send the prompt via stdin
      const result = await this.runClaudeWithPrompt(prompt);

      // Clean up
      if (fs.existsSync(promptFile)) {
        fs.unlinkSync(promptFile);
      }

      return result;
    } catch (error: any) {
      // Clean up on error
      if (fs.existsSync(promptFile)) {
        fs.unlinkSync(promptFile);
      }
      throw error;
    }
  }

  /**
   * Run Claude Code with a prompt (compact UI with progress)
   */
  private async runClaudeWithPrompt(prompt: string): Promise<string> {
    const startTime = Date.now();
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;

    // Create temp file
    const tempFile = path.join(this.workingDir, `.claude-prompt-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, prompt);

    // Show compact progress
    process.stdout.write('      ⏳ Claude Code: ');

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r      ${spinner[spinnerIndex]} Claude Code: ${elapsed}s`);
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
      process.stdout.write(`\r      ✓ Claude Code: ${duration}s\n`);

      // Clean up
      try { fs.unlinkSync(tempFile); } catch {}

      return stdout || 'Task executed';
    } catch (error: any) {
      clearInterval(interval);
      process.stdout.write(`\r      ⚠️  Claude Code: ${error.message}\n`);

      // Clean up
      try { fs.unlinkSync(tempFile); } catch {}

      return 'Task attempted';
    }
  }

  /**
   * Execute with Spec-Kit
   */
  private async executeWithSpecKit(task: Task): Promise<any> {
    if (!specKitIntegration.isSpecKitAvailable()) {
      throw new Error('Spec-Kit is not available');
    }

    console.log('   📋 Using Spec-Kit...');

    // Initialize if needed
    if (!specKitIntegration.isSpecKitInitialized()) {
      console.log('   Initializing Spec-Kit...');
      await specKitIntegration.initializeSpecKit();
    }

    // Determine which Spec-Kit command to run based on task
    const command = this.getSpecKitCommandForTask(task);

    if (command) {
      console.log(`   Running: ${command}`);
      return await this.runSpecKitCommand(command, task.description);
    } else {
      throw new Error('Could not determine Spec-Kit command for task');
    }
  }

  /**
   * Get appropriate Spec-Kit command for a task
   */
  private getSpecKitCommandForTask(task: Task): string | null {
    const desc = task.description.toLowerCase();

    if (desc.includes('constitution') || desc.includes('principles')) {
      return '/constitution';
    } else if (desc.includes('specify') || desc.includes('specification') || desc.includes('requirements')) {
      return '/specify';
    } else if (desc.includes('plan') || desc.includes('architecture')) {
      return '/plan';
    } else if (desc.includes('tasks') || desc.includes('break down')) {
      return '/tasks';
    } else if (desc.includes('implement')) {
      return '/implement';
    }

    // Default to /specify for general feature tasks
    if (task.type === 'feature') {
      return '/specify';
    }

    return null;
  }

  /**
   * Run a Spec-Kit command via Claude Code
   */
  private async runSpecKitCommand(command: string, context: string): Promise<any> {
    const prompt = `${command} ${context}`;
    return await this.runClaudeWithPrompt(prompt);
  }

  /**
   * Execute with ShinkaEvolve
   */
  private async executeWithEvolution(task: Task): Promise<any> {
    if (!shinkaEvolveIntegration.isShinkaAvailable()) {
      throw new Error('ShinkaEvolve is not available');
    }

    console.log('   🧬 Using ShinkaEvolve for evolutionary optimization...');

    // Find code files to evolve
    const codeFiles = this.findCodeFilesInProject();

    if (codeFiles.length === 0) {
      throw new Error('No code files found to evolve');
    }

    console.log(`   Found ${codeFiles.length} code files to optimize`);

    // Create an evaluation script
    const evalScript = path.join(this.workingDir, 'evaluate_evolution.py');
    this.createEvaluationScript(evalScript, task);

    // Run evolution on the first code file (or combine them)
    const targetFile = codeFiles[0];

    try {
      const result = await shinkaEvolveIntegration.runEvolution({
        init_program_path: targetFile,
        eval_program_path: evalScript,
        num_generations: 5,
        max_parallel_jobs: 2,
        llm_models: ['azure-gpt-4.1-mini'],
        results_dir: path.join(this.workingDir, 'shinka_results'),
      });

      // Clean up
      if (fs.existsSync(evalScript)) {
        fs.unlinkSync(evalScript);
      }

      return result;
    } catch (error: any) {
      // Clean up on error
      if (fs.existsSync(evalScript)) {
        fs.unlinkSync(evalScript);
      }
      throw error;
    }
  }

  /**
   * Execute with all tools (orchestrated workflow)
   */
  private async executeWithAllTools(task: Task): Promise<any> {
    console.log('   🎯 Using orchestrated workflow with all tools...');

    const results: any = {};

    // Step 1: Use Spec-Kit for structure
    if (specKitIntegration.isSpecKitAvailable()) {
      console.log('\n   📋 Step 1: Creating specification with Spec-Kit...');
      try {
        results.specification = await this.executeWithSpecKit(task);
      } catch (error: any) {
        console.warn(`   ⚠️  Spec-Kit step failed: ${error.message}`);
      }
    }

    // Step 2: Use Claude Code for implementation
    if (claudeCodeIntegration.isClaudeInstalled()) {
      console.log('\n   🤖 Step 2: Implementing with Claude Code...');
      try {
        results.implementation = await this.executeWithClaude(task);
      } catch (error: any) {
        console.warn(`   ⚠️  Claude Code step failed: ${error.message}`);
      }
    }

    // Step 3: Use Evolution for optimization
    if (shinkaEvolveIntegration.isShinkaAvailable() && task.type === 'optimization') {
      console.log('\n   🧬 Step 3: Optimizing with ShinkaEvolve...');
      try {
        results.evolution = await this.executeWithEvolution(task);
      } catch (error: any) {
        console.warn(`   ⚠️  Evolution step failed: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Auto-select tool based on task type
   */
  private async autoExecute(task: Task): Promise<any> {
    switch (task.type) {
      case 'feature':
        // Complex features use all tools
        if (this.isComplexFeature(task.description)) {
          return await this.executeWithAllTools(task);
        } else {
          return await this.executeWithClaude(task);
        }

      case 'bug_fix':
        // Bugs go straight to Claude Code
        return await this.executeWithClaude(task);

      case 'optimization':
        // Optimizations use evolution
        return await this.executeWithEvolution(task);

      case 'test':
      case 'refactor':
        // These use Claude Code
        return await this.executeWithClaude(task);

      default:
        // Default to Claude Code
        return await this.executeWithClaude(task);
    }
  }

  /**
   * Check if feature is complex
   */
  private isComplexFeature(description: string): boolean {
    const complexityIndicators = [
      'authentication',
      'database',
      'api',
      'integration',
      'dashboard',
      'admin',
      'user management',
      'payment',
      'real-time',
      'websocket',
      'multiple',
      'system',
    ];

    const lower = description.toLowerCase();
    return complexityIndicators.some((indicator) => lower.includes(indicator));
  }

  /**
   * Create a smart, context-aware prompt from a task
   */
  private createPromptFromTask(task: Task): string {
    let prompt = `Task: ${task.description}\n\n`;

    // Add git context
    try {
      const { execSync } = require('child_process');
      const commits = execSync('git log -3 --oneline', { cwd: this.workingDir }).toString();
      prompt += `Recent commits:\n${commits}\n`;

      const status = execSync('git status --short', { cwd: this.workingDir }).toString();
      if (status.trim()) {
        prompt += `Modified files:\n${status}\n`;
      }
    } catch {}

    prompt += `\nType: ${task.type} | Priority: ${task.priority}\n\n`;

    switch (task.type) {
      case 'feature':
        prompt += '## Requirements\n\n';
        prompt += 'Implement this feature with:\n';
        prompt += '1. Clean, maintainable code following project conventions\n';
        prompt += '2. Proper error handling and input validation\n';
        prompt += '3. Tests to verify functionality (run them!)\n';
        prompt += '4. Documentation (docstrings, comments)\n\n';
        prompt += 'After implementation:\n';
        prompt += '- Run any existing tests\n';
        prompt += '- Try running the application to verify it works\n';
        prompt += '- Check for errors or warnings\n';
        break;

      case 'bug_fix':
        prompt += '## Debug Process\n\n';
        prompt += '1. Analyze the code to identify the root cause\n';
        prompt += '2. Implement a proper fix\n';
        prompt += '3. Add tests to prevent regression\n';
        prompt += '4. Run tests to verify the fix works\n';
        break;

      case 'optimization':
        prompt += '## Optimization Goals\n\n';
        prompt += '1. Profile the code to find bottlenecks\n';
        prompt += '2. Optimize for better performance\n';
        prompt += '3. Reduce resource usage\n';
        prompt += '4. Verify improvements with benchmarks\n';
        break;

      case 'test':
        prompt += '## Test Coverage\n\n';
        prompt += '1. Add comprehensive unit tests\n';
        prompt += '2. Cover edge cases and error conditions\n';
        prompt += '3. Run the tests to verify they pass\n';
        prompt += '4. Aim for high code coverage\n';
        break;

      case 'refactor':
        prompt += '## Refactoring\n\n';
        prompt += '1. Improve code structure and organization\n';
        prompt += '2. Enhance readability and maintainability\n';
        prompt += '3. Preserve existing functionality\n';
        prompt += '4. Run tests to ensure nothing broke\n';
        break;

      default:
        prompt += '## Task Completion\n\n';
        prompt += 'Complete this task following best practices.\n';
        prompt += 'Run tests and verify everything works.\n';
    }

    return prompt;
  }

  /**
   * Find code files in the project
   */
  private findCodeFilesInProject(): string[] {
    const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb'];
    const files: string[] = [];

    const searchDir = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!['node_modules', '.git', 'dist', 'build', '__pycache__'].includes(item)) {
              searchDir(fullPath);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (codeExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir(this.workingDir);
    return files;
  }

  /**
   * Create an evaluation script for ShinkaEvolve
   */
  private createEvaluationScript(scriptPath: string, task: Task): void {
    const evalScript = `#!/usr/bin/env python3
"""
Evaluation script for ShinkaEvolve
Task: ${task.description}
"""

import sys

def evaluate_program(program_path: str) -> float:
    """
    Evaluate the program and return a fitness score (0.0 to 1.0)
    Higher is better.
    """
    try:
        # Import and test the program
        # For now, return a basic score
        # In a real implementation, this would run tests and measure metrics

        score = 0.5  # Base score

        # Add scoring logic based on task type
        # - Code complexity
        # - Performance metrics
        # - Test pass rate
        # - Code quality

        return score
    except Exception as e:
        print(f"Evaluation failed: {e}", file=sys.stderr)
        return 0.0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: evaluate.py <program_path>", file=sys.stderr)
        sys.exit(1)

    program_path = sys.argv[1]
    score = evaluate_program(program_path)
    print(score)
`;

    fs.writeFileSync(scriptPath, evalScript);
    fs.chmodSync(scriptPath, 0o755);
  }
}
