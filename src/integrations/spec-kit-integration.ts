import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config/config.js';

export interface SpecKitConfig {
  specKitPath?: string;
  repoUrl?: string;
}

export class SpecKitIntegration {
  private specKitPath: string;
  private repoUrl: string;
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;

  constructor(private customConfig: SpecKitConfig = {}) {
    this.specKitPath = customConfig.specKitPath || config.specKitPath;
    this.repoUrl = customConfig.repoUrl || config.specKitRepoUrl;
    this.checkAvailability();
  }

  private checkAvailability(): void {
    try {
      // Check if uvx is available (required for spec-kit)
      execSync('uvx --help', { encoding: 'utf8', stdio: 'pipe' });
      this.isAvailable = true;

      // Check if current directory has spec-kit initialized
      this.checkInitialization();
    } catch (error) {
      this.isAvailable = false;
    }
  }

  private checkInitialization(): void {
    // Check if current directory has been initialized with spec-kit
    const specifyDir = path.join(process.cwd(), '.specify');
    const claudeDir = path.join(process.cwd(), '.claude');

    this.isInitialized =
      fs.existsSync(specifyDir) &&
      fs.existsSync(claudeDir) &&
      fs.existsSync(path.join(claudeDir, 'commands'));
  }

  public isSpecKitAvailable(): boolean {
    return this.isAvailable;
  }

  public isSpecKitInitialized(): boolean {
    // Always re-check initialization status to handle directory changes
    this.checkInitialization();
    return this.isInitialized;
  }

  public getInstallationInstructions(): string {
    return `
To enable Spec-Kit task management and structured development:

1. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

2. Initialize Spec-Kit in your project:
   uvx --from ${this.repoUrl} specify init --here --ai claude

   OR create a new project:
   uvx --from ${this.repoUrl} specify init my-project --ai claude
   cd my-project

Once initialized, you'll have access to these slash commands:
- /constitution: Create project governing principles
- /specify: Define requirements and user stories
- /clarify: Clarify underspecified areas
- /plan: Create technical implementation plans
- /tasks: Generate actionable task lists
- /analyze: Cross-artifact consistency analysis
- /implement: Execute tasks according to the plan

Spec-Kit enables:
- Spec-Driven Development workflow
- Structured requirement gathering
- Automated task generation
- Implementation plan creation
- Progress tracking and validation
`;
  }

  public async initializeSpecKit(projectName?: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('uvx not available. Please install uv first.');
    }

    return new Promise((resolve, reject) => {
      const args = projectName
        ? ['--from', this.repoUrl, 'specify', 'init', projectName, '--ai', 'claude']
        : ['--from', this.repoUrl, 'specify', 'init', '--here', '--ai', 'claude'];

      const child = spawn('uvx', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        if (config.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
        if (config.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.checkInitialization(); // Update initialization status
          resolve(output);
        } else {
          reject(new Error(`Spec-Kit initialization failed: ${error}`));
        }
      });
    });
  }

  public getAvailableCommands(): string[] {
    // Always check current initialization status
    this.checkInitialization();

    if (!this.isInitialized) {
      return [];
    }

    // These commands become available after spec-kit initialization
    return [
      '/constitution',
      '/specify',
      '/clarify',
      '/plan',
      '/tasks',
      '/analyze',
      '/implement',
    ];
  }

  public getStatus(): {
    available: boolean;
    initialized: boolean;
    path: string;
    repoUrl: string;
    message: string;
    commands: string[];
  } {
    // Always refresh initialization status when getting status
    this.checkInitialization();

    let message = '';

    if (!this.isAvailable) {
      message = 'uvx not available - install uv to enable Spec-Kit integration';
    } else if (!this.isInitialized) {
      message = 'Spec-Kit available but not initialized in this project';
    } else {
      message = 'Spec-Kit integration ready - slash commands available';
    }

    return {
      available: this.isAvailable,
      initialized: this.isInitialized,
      path: this.specKitPath,
      repoUrl: this.repoUrl,
      message,
      commands: this.getAvailableCommands(),
    };
  }

  /**
   * Get the tasks directory for the current spec-kit project
   */
  public getTasksDirectory(): string | null {
    if (!this.isInitialized) {
      return null;
    }

    // Find the active feature directory
    const specsDir = path.join(process.cwd(), '.specify', 'specs');
    if (!fs.existsSync(specsDir)) {
      return null;
    }

    // Get the latest feature directory
    const featureDirs = fs
      .readdirSync(specsDir)
      .filter((name) => fs.statSync(path.join(specsDir, name)).isDirectory());

    if (featureDirs.length === 0) {
      return null;
    }

    // Sort by name (usually numbered like 001-feature-name)
    featureDirs.sort();
    const latestFeature = featureDirs[featureDirs.length - 1];

    return path.join(specsDir, latestFeature);
  }
}

export const specKitIntegration = new SpecKitIntegration();
