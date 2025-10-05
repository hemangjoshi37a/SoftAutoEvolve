import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Git Automation
 * Handles all Git operations automatically
 */
export class GitAutomation {
  private workingDir: string;
  private mainBranch: string = 'main';

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.detectMainBranch();
  }

  /**
   * Detect main branch (main or master)
   */
  private detectMainBranch(): void {
    try {
      const result = execSync('git branch --show-current', {
        cwd: this.workingDir,
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();

      if (result) {
        this.mainBranch = result;
      }
    } catch (error) {
      // Not in a git repo or error - will init later
    }
  }

  /**
   * Initialize Git repo if not already
   */
  public async initRepo(): Promise<void> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.workingDir });
    } catch (error) {
      // Not a git repo, initialize
      await execAsync('git init', { cwd: this.workingDir });
      await execAsync('git config user.name "SoftAutoEvolve Agent"', { cwd: this.workingDir });
      await execAsync('git config user.email "agent@softautoevolve.dev"', { cwd: this.workingDir });
      console.log('✓ Git repo initialized');
    }
  }

  /**
   * Create a feature branch
   */
  public async createBranch(branchName: string): Promise<string> {
    const safeBranchName = this.sanitizeBranchName(branchName);
    const fullBranchName = `feature/${safeBranchName}`;

    try {
      await execAsync(`git checkout -b ${fullBranchName}`, { cwd: this.workingDir });
      console.log(`✓ Branch created: ${fullBranchName}`);
      return fullBranchName;
    } catch (error: any) {
      // Branch might already exist, try to checkout
      try {
        await execAsync(`git checkout ${fullBranchName}`, { cwd: this.workingDir });
        return fullBranchName;
      } catch (e) {
        throw new Error(`Failed to create/checkout branch: ${error.message}`);
      }
    }
  }

  /**
   * Commit changes
   */
  public async commit(message: string): Promise<void> {
    try {
      // Add all changes
      await execAsync('git add .', { cwd: this.workingDir });

      // Check if there are changes to commit
      const status = await execAsync('git status --porcelain', { cwd: this.workingDir });
      if (!status.stdout.trim()) {
        console.log('✓ No changes to commit');
        return;
      }

      // Commit
      const safeMessage = message.replace(/"/g, '\\"');
      await execAsync(`git commit -m "${safeMessage}"`, { cwd: this.workingDir });
      console.log(`✓ Committed: ${message}`);
    } catch (error: any) {
      console.warn(`⚠ Commit failed: ${error.message}`);
    }
  }

  /**
   * Merge branch to main
   */
  public async mergeBranch(branchName: string): Promise<void> {
    try {
      // Switch to main
      await execAsync(`git checkout ${this.mainBranch}`, { cwd: this.workingDir });

      // Merge
      await execAsync(`git merge ${branchName} --no-ff -m "Merge ${branchName}"`, {
        cwd: this.workingDir,
      });

      console.log(`✓ Merged ${branchName} → ${this.mainBranch}`);

      // Delete feature branch
      await execAsync(`git branch -d ${branchName}`, { cwd: this.workingDir });
      console.log(`✓ Deleted branch: ${branchName}`);
    } catch (error: any) {
      console.warn(`⚠ Merge failed: ${error.message}`);
    }
  }

  /**
   * Get current branch
   */
  public async getCurrentBranch(): Promise<string> {
    try {
      const result = await execAsync('git branch --show-current', { cwd: this.workingDir });
      return result.stdout.trim();
    } catch (error) {
      return this.mainBranch;
    }
  }

  /**
   * Get commit history
   */
  public async getCommitHistory(limit: number = 10): Promise<string[]> {
    try {
      const result = await execAsync(`git log -${limit} --oneline`, { cwd: this.workingDir });
      return result.stdout.trim().split('\n').filter((line) => line);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get file changes in last commit
   */
  public async getLastCommitChanges(): Promise<string[]> {
    try {
      const result = await execAsync('git diff --name-only HEAD~1 HEAD', { cwd: this.workingDir });
      return result.stdout.trim().split('\n').filter((line) => line);
    } catch (error) {
      return [];
    }
  }

  /**
   * Create evolution branch for optimization
   */
  public async createEvolutionBranch(generation: number): Promise<string> {
    const branchName = `evolution/gen-${generation}-${Date.now()}`;
    try {
      await execAsync(`git checkout -b ${branchName}`, { cwd: this.workingDir });
      console.log(`✓ Evolution branch: ${branchName}`);
      return branchName;
    } catch (error: any) {
      throw new Error(`Failed to create evolution branch: ${error.message}`);
    }
  }

  /**
   * Sanitize branch name
   */
  private sanitizeBranchName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Get stats for progress tracking
   */
  public async getStats(): Promise<{
    totalCommits: number;
    branches: number;
    filesChanged: number;
  }> {
    try {
      // Count commits
      const commitCount = await execAsync('git rev-list --count HEAD', { cwd: this.workingDir });
      const totalCommits = parseInt(commitCount.stdout.trim()) || 0;

      // Count branches
      const branchList = await execAsync('git branch', { cwd: this.workingDir });
      const branches = branchList.stdout.trim().split('\n').length;

      // Count files changed in last commit
      const changes = await this.getLastCommitChanges();
      const filesChanged = changes.length;

      return { totalCommits, branches, filesChanged };
    } catch (error) {
      return { totalCommits: 0, branches: 0, filesChanged: 0 };
    }
  }
}
