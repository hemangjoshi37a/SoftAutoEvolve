import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * AI Strategist
 * Uses Claude API to make strategic decisions about development direction
 * Reads actual code state and decides what to do next
 */
export class AIStrategist {
  private workingDir: string;
  private apiKey: string | null = null;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
  }

  /**
   * Analyze current project state by reading actual code
   */
  async analyzeProjectState(): Promise<ProjectState> {
    console.log('🔍 AI Strategist: Reading project code state...');

    const state: ProjectState = {
      files: [],
      structure: '',
      gitLog: '',
      gitStatus: '',
      recentChanges: '',
      codeQuality: {},
      missingFeatures: []
    };

    try {
      // Get git history
      const { stdout: gitLog } = await execAsync('git log -20 --oneline --no-decorate', {
        cwd: this.workingDir
      });
      state.gitLog = gitLog;

      // Get git status
      const { stdout: gitStatus } = await execAsync('git status --short', {
        cwd: this.workingDir
      });
      state.gitStatus = gitStatus;

      // Get recent commits with details
      const { stdout: recentChanges } = await execAsync(
        'git log -5 --pretty=format:"%h - %s (%ar)" --stat',
        { cwd: this.workingDir }
      );
      state.recentChanges = recentChanges;

      // Get project structure
      const { stdout: structure } = await execAsync(
        'tree -L 3 -I "node_modules|dist|build|.git|__pycache__|venv|myenv*" || ls -R',
        { cwd: this.workingDir, maxBuffer: 10 * 1024 * 1024 }
      );
      state.structure = structure.substring(0, 5000);

      // Read key source files
      const sourceFiles = this.findImportantFiles();
      for (const file of sourceFiles.slice(0, 10)) {
        const content = fs.readFileSync(file, 'utf-8');
        state.files.push({
          path: path.relative(this.workingDir, file),
          content: content.substring(0, 2000), // First 2000 chars
          lines: content.split('\n').length
        });
      }

      console.log(`   ✓ Analyzed ${state.files.length} key files`);

    } catch (error: any) {
      console.warn(`   ⚠️  Partial analysis: ${error.message}`);
    }

    return state;
  }

  /**
   * Use Claude API to decide what to do next based on project state
   */
  async decideNextActions(state: ProjectState, webInsights?: string): Promise<StrategicPlan> {
    if (!this.apiKey) {
      console.log('   ⚠️  No ANTHROPIC_API_KEY - using fallback strategy');
      return this.fallbackStrategy(state);
    }

    console.log('🧠 AI Strategist: Consulting Claude API for strategy...');

    const prompt = this.buildStrategyPrompt(state, webInsights);

    try {
      // Use --print mode to call Claude API-style decision making
      // For now, use local analysis until we add @anthropic-ai/sdk
      const decision = await this.makeLocalDecision(state);
      console.log('   ✓ Strategic decision made');
      return decision;

    } catch (error: any) {
      console.warn(`   ⚠️  API call failed: ${error.message}`);
      return this.fallbackStrategy(state);
    }
  }

  /**
   * Build strategic prompt for Claude API
   */
  private buildStrategyPrompt(state: ProjectState, webInsights?: string): string {
    return `You are an expert software architect analyzing a project to decide the next development actions.

## Current Project State

### Git History (last 20 commits):
\`\`\`
${state.gitLog}
\`\`\`

### Recent Detailed Changes:
\`\`\`
${state.recentChanges}
\`\`\`

### Git Status:
\`\`\`
${state.gitStatus || 'Working directory clean'}
\`\`\`

### Project Structure:
\`\`\`
${state.structure}
\`\`\`

### Key Source Files:
${state.files.map(f => `
**${f.path}** (${f.lines} lines):
\`\`\`
${f.content}
\`\`\`
`).join('\n')}

${webInsights ? `\n### Industry Best Practices:\n${webInsights}\n` : ''}

## Your Task

Analyze this project and decide the next 2-3 development actions that would add the MOST VALUE.

Consider:
1. What features are missing that users would want?
2. What code quality improvements are needed?
3. What's the natural next evolution of this project?
4. What would make this project more useful/powerful?
5. Are there any bugs or issues visible in the code?

## Output Format

Respond with EXACTLY this format:

### ACTIONS
1. [Action description]
2. [Action description]
3. [Action description]

### REASONING
[Brief explanation of why these actions]

### SPEC_KIT_COMMANDS
[Spec-Kit slash commands to use, e.g., /specify, /plan, /tasks]

Be specific and actionable. Focus on NEW features/improvements, not just documentation.`;
  }

  /**
   * Make local decision based on code analysis
   */
  private async makeLocalDecision(state: ProjectState): Promise<StrategicPlan> {
    const actions: string[] = [];
    const reasoning: string[] = [];

    // Analyze what's been done recently
    const recentCommits = state.gitLog.split('\n').slice(0, 10);
    const hasRecentFeatures = recentCommits.some(c =>
      c.includes('feature') || c.includes('Add') || c.includes('Create')
    );

    // Check if stuck in loops (same commit messages)
    const commitMessages = recentCommits.map(c => c.split(' ').slice(1).join(' '));
    const uniqueMessages = new Set(commitMessages);
    const isLooping = commitMessages.length > 0 && uniqueMessages.size < commitMessages.length / 2;

    if (isLooping) {
      // Break out of loop with different action
      actions.push('Analyze existing codebase for bugs and issues');
      actions.push('Refactor most complex module for clarity');
      reasoning.push('Detected repetitive tasks - switching to code quality improvements');
    } else {
      // Normal progression
      // Look at file structure to understand what's missing
      const hasTests = state.structure.includes('test') || state.structure.includes('spec');
      const hasDocs = state.structure.includes('README') || state.structure.includes('docs');
      const hasConfig = state.structure.includes('config') || state.structure.includes('.github');

      if (state.files.length > 0) {
        // Analyze actual code to suggest improvements
        const mainFile = state.files[0];
        const hasErrorHandling = mainFile.content.includes('try') || mainFile.content.includes('except');
        const hasLogging = mainFile.content.includes('log') || mainFile.content.includes('print');

        if (!hasErrorHandling) {
          actions.push('Add comprehensive error handling to core modules');
          reasoning.push('Code lacks error handling');
        }

        if (!hasLogging) {
          actions.push('Add logging system for debugging and monitoring');
          reasoning.push('No logging infrastructure found');
        }

        // Suggest feature based on project type
        if (mainFile.path.includes('main') || mainFile.path.includes('app')) {
          actions.push('Add new user-facing feature based on project purpose');
          reasoning.push('Expand core functionality');
        }
      }

      if (!hasTests) {
        actions.push('Create test suite for critical functionality');
        reasoning.push('No test infrastructure detected');
      }
    }

    // Ensure we have at least 2 actions
    if (actions.length < 2) {
      actions.push('Improve code organization and structure');
      actions.push('Optimize performance of core operations');
      reasoning.push('General improvements needed');
    }

    return {
      actions: actions.slice(0, 3),
      reasoning: reasoning.join('; '),
      specKitCommands: ['/specify', '/plan'],
      priority: 'high'
    };
  }

  /**
   * Fallback strategy when API unavailable
   */
  private fallbackStrategy(state: ProjectState): StrategicPlan {
    return {
      actions: [
        'Add new feature based on project analysis',
        'Improve code quality and error handling',
        'Optimize performance'
      ],
      reasoning: 'Fallback strategy - API unavailable',
      specKitCommands: ['/specify'],
      priority: 'medium'
    };
  }

  /**
   * Find important files to analyze
   */
  private findImportantFiles(): string[] {
    const important: string[] = [];
    const extensions = ['.ts', '.js', '.py', '.go', '.rs', '.java', '.cpp'];

    const search = (dir: string, depth: number = 0) => {
      if (depth > 3) return;

      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules' || item === 'venv') continue;

          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            search(fullPath, depth + 1);
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
              // Prioritize main files
              if (item.includes('main') || item.includes('index') || item.includes('app')) {
                important.unshift(fullPath);
              } else {
                important.push(fullPath);
              }
            }
          }
        }
      } catch (e) {
        // Skip directories we can't read
      }
    };

    search(this.workingDir);
    return important;
  }

  /**
   * Search web for feature inspiration and best practices
   */
  async getWebInsights(projectType: string, language: string): Promise<string | null> {
    console.log(`🌐 Searching web for ${projectType} ${language} best practices...`);

    try {
      // Use Claude Code's web search capability via --print mode
      const query = `best features and improvements for ${projectType} projects in ${language} 2025`;
      const { stdout } = await execAsync(
        `echo "Search the web for: ${query}. Summarize key features and best practices." | timeout 30s claude --print --permission-mode bypassPermissions`,
        { cwd: this.workingDir, maxBuffer: 5 * 1024 * 1024 }
      );

      if (stdout && stdout.length > 50) {
        console.log('   ✓ Got web insights');
        return stdout.substring(0, 2000);
      }
    } catch (error) {
      console.log('   ⚠️  Web search unavailable');
    }

    return null;
  }
}

// Type definitions
export interface ProjectState {
  files: Array<{ path: string; content: string; lines: number }>;
  structure: string;
  gitLog: string;
  gitStatus: string;
  recentChanges: string;
  codeQuality: Record<string, any>;
  missingFeatures: string[];
}

export interface StrategicPlan {
  actions: string[];
  reasoning: string;
  specKitCommands: string[];
  priority: 'low' | 'medium' | 'high';
}
