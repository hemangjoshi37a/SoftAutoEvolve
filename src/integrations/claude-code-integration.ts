import { execSync, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/config.js';

export interface ClaudeCodeConfig {
  claudePath?: string;
  cliPath?: string;
}

export class ClaudeCodeIntegration {
  private claudePath: string;
  private cliPath?: string;
  private isAvailable: boolean = false;
  private isInstalled: boolean = false;

  constructor(private customConfig: ClaudeCodeConfig = {}) {
    this.claudePath = customConfig.claudePath || config.claudeCodePath;
    this.cliPath = customConfig.cliPath || config.claudeCliPath;
    this.checkAvailability();
  }

  private checkAvailability(): void {
    try {
      // First check if claude is available in PATH
      try {
        execSync('claude --version', { encoding: 'utf8', stdio: 'pipe' });
        this.isAvailable = true;
        this.isInstalled = true;
        return;
      } catch {
        // Not in PATH, continue checking
      }

      // Check if we have a custom CLI path
      if (this.cliPath && fs.existsSync(this.cliPath)) {
        this.isAvailable = true;
        this.isInstalled = true;
        return;
      }

      // Check if we have the source repository
      if (
        this.claudePath &&
        fs.existsSync(path.join(this.claudePath, 'package.json'))
      ) {
        this.isAvailable = true;
        this.isInstalled = false;
      } else {
        this.isAvailable = false;
        this.isInstalled = false;
      }
    } catch (error) {
      this.isAvailable = false;
      this.isInstalled = false;
    }
  }

  public isClaudeAvailable(): boolean {
    return this.isAvailable;
  }

  public isClaudeInstalled(): boolean {
    return this.isInstalled;
  }

  public getInstallationInstructions(): string {
    return `
Claude Code CLI is not available. To enable Claude Code integration:

1. Install Claude Code globally:
   npm install -g @anthropic-ai/claude-code

   OR

2. If you have a custom Claude Code installation, set the path in your .env file:
   CLAUDE_CODE_PATH=/path/to/your/claude-code
   CLAUDE_CLI_PATH=/path/to/claude

3. If you're using a cloned repository at ${this.claudePath}:
   cd ${this.claudePath}
   npm install
   npm link

Claude Code provides the core AI-powered coding capabilities for:
- Interactive code generation and editing
- Intelligent code understanding
- Terminal command execution
- File system operations
`;
  }

  public async launchClaude(args: string[] = []): Promise<void> {
    if (!this.isAvailable) {
      throw new Error(
        'Claude Code not available. ' + this.getInstallationInstructions()
      );
    }

    if (!this.isInstalled) {
      throw new Error(
        'Claude Code not installed. ' + this.getInstallationInstructions()
      );
    }

    return new Promise((resolve, reject) => {
      let command: string;
      let commandArgs: string[];

      if (this.cliPath) {
        command = 'node';
        commandArgs = [this.cliPath, ...args];
      } else {
        command = 'claude';
        commandArgs = args;
      }

      const child = spawn(command, commandArgs, {
        stdio: 'inherit',
        env: {
          ...process.env,
          SOFTAUTOEVOLVE_ENABLED: 'true',
          SOFTAUTOEVOLVE_VERSION: '1.0.0',
        },
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Claude Code exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start Claude Code: ${error.message}`));
      });
    });
  }

  public async executeClaude(
    workingDir: string,
    command: string
  ): Promise<string> {
    if (!this.isAvailable || !this.isInstalled) {
      throw new Error(
        'Claude Code not available. ' + this.getInstallationInstructions()
      );
    }

    return new Promise((resolve, reject) => {
      const child = spawn('claude', [command], {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Claude Code failed: ${error}`));
        }
      });
    });
  }

  public getStatus(): {
    available: boolean;
    installed: boolean;
    path: string;
    cliPath?: string;
    message: string;
  } {
    let message = '';

    if (!this.isAvailable) {
      message = 'Claude Code not found - install to enable core capabilities';
    } else if (!this.isInstalled) {
      message = 'Claude Code found but not installed - run installation';
    } else {
      message = 'Claude Code integration ready';
    }

    return {
      available: this.isAvailable,
      installed: this.isInstalled,
      path: this.claudePath,
      cliPath: this.cliPath,
      message,
    };
  }
}

export const claudeCodeIntegration = new ClaudeCodeIntegration();
