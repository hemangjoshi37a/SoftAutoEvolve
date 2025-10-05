import { execSync } from 'child_process';
import { GitAutomation } from './git-automation.js';

/**
 * Branch Information
 */
export interface BranchInfo {
  name: string;
  lastCommit: string;
  lastCommitMessage: string;
  lastCommitDate: Date;
  isFeatureBranch: boolean;
  intent: string;
}

/**
 * Branch Resume Manager
 * Checks for open branches and determines if work needs to be resumed
 */
export class BranchResumeManager {
  private workingDir: string;
  private gitAutomation: GitAutomation;
  private mainBranch: string = 'main';

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.gitAutomation = new GitAutomation(workingDir);
  }

  /**
   * Check for open feature branches that need work
   */
  public async checkOpenBranches(): Promise<BranchInfo[]> {
    console.log('\n🔍 Checking for open feature branches...');

    try {
      // Get current branch
      const currentBranch = await this.gitAutomation.getCurrentBranch();

      // Get all branches
      const branchesOutput = execSync('git branch', {
        cwd: this.workingDir,
        encoding: 'utf8',
      });

      const branches = branchesOutput
        .split('\n')
        .map(b => b.replace(/^\*?\s*/, '').trim())
        .filter(b => b && b !== this.mainBranch && b !== 'master');

      if (branches.length === 0) {
        console.log('   ✓ No open branches found\n');
        return [];
      }

      console.log(`   Found ${branches.length} branch(es):\n`);

      // Analyze each branch
      const branchInfos: BranchInfo[] = [];

      for (const branch of branches) {
        const info = await this.analyzeBranch(branch);
        branchInfos.push(info);

        // Display branch info with cyberpunk styling
        console.log(`   \x1b[36m▸\x1b[0m ${info.name}`);
        console.log(`     Intent: ${info.intent}`);
        console.log(`     Last commit: ${info.lastCommitMessage.substring(0, 60)}...`);
        console.log(`     Date: ${info.lastCommitDate.toLocaleString()}\n`);
      }

      return branchInfos;
    } catch (error) {
      console.log('   ⚠️  Could not check branches\n');
      return [];
    }
  }

  /**
   * Analyze a branch to extract information
   */
  private async analyzeBranch(branchName: string): Promise<BranchInfo> {
    try {
      // Get last commit info
      const commitHash = execSync(`git log ${branchName} -1 --format=%H`, {
        cwd: this.workingDir,
        encoding: 'utf8',
      }).trim();

      const commitMessage = execSync(`git log ${branchName} -1 --format=%s`, {
        cwd: this.workingDir,
        encoding: 'utf8',
      }).trim();

      const commitDateStr = execSync(`git log ${branchName} -1 --format=%ai`, {
        cwd: this.workingDir,
        encoding: 'utf8',
      }).trim();

      const commitDate = new Date(commitDateStr);

      // Extract intent from branch name
      const intent = this.extractIntent(branchName);

      return {
        name: branchName,
        lastCommit: commitHash,
        lastCommitMessage: commitMessage,
        lastCommitDate: commitDate,
        isFeatureBranch: branchName.startsWith('feature') || branchName.startsWith('fix') ||
                         branchName.startsWith('docs') || branchName.startsWith('test'),
        intent,
      };
    } catch (error) {
      return {
        name: branchName,
        lastCommit: '',
        lastCommitMessage: 'Unknown',
        lastCommitDate: new Date(),
        isFeatureBranch: false,
        intent: 'Unknown',
      };
    }
  }

  /**
   * Extract intent from branch name
   */
  private extractIntent(branchName: string): string {
    // Remove prefix
    let intent = branchName
      .replace(/^(feature|fix|docs|test|refactor|config|ui)[\/\-]/, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ');

    // Capitalize first letter
    intent = intent.charAt(0).toUpperCase() + intent.slice(1);

    return intent;
  }

  /**
   * Ask if user wants to resume a branch (for now, auto-resume)
   */
  public shouldResumeBranch(branch: BranchInfo): boolean {
    // Auto-resume if it's a feature branch and less than 7 days old
    const daysSinceCommit = (Date.now() - branch.lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);

    return branch.isFeatureBranch && daysSinceCommit < 7;
  }

  /**
   * Resume work on a branch
   */
  public async resumeBranch(branch: BranchInfo): Promise<boolean> {
    console.log(`\n🔄 Resuming work on: \x1b[36m${branch.name}\x1b[0m`);
    console.log(`   Intent: ${branch.intent}\n`);

    try {
      // Checkout the branch
      execSync(`git checkout ${branch.name}`, {
        cwd: this.workingDir,
        stdio: 'pipe',
      });

      console.log('   ✓ Checked out branch\n');
      return true;
    } catch (error: any) {
      console.log(`   ✗ Failed to checkout branch: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Get branches that should be resumed
   */
  public async getBranchesToResume(): Promise<BranchInfo[]> {
    const openBranches = await this.checkOpenBranches();

    return openBranches.filter(branch => this.shouldResumeBranch(branch));
  }

  /**
   * Complete a branch (merge to main)
   */
  public async completeBranch(branchName: string): Promise<boolean> {
    console.log(`\n✅ Completing branch: ${branchName}\n`);

    try {
      await this.gitAutomation.mergeBranch(branchName);
      console.log('   ✓ Branch merged and deleted\n');
      return true;
    } catch (error: any) {
      console.log(`   ✗ Failed to merge branch: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Check if branch work is complete
   */
  public async isBranchComplete(branch: BranchInfo): Promise<boolean> {
    try {
      // Check if there are uncommitted changes
      const statusOutput = execSync('git status --porcelain', {
        cwd: this.workingDir,
        encoding: 'utf8',
      });

      // If there are uncommitted changes, work is not complete
      if (statusOutput.trim()) {
        return false;
      }

      // Check if branch has meaningful commits
      const commitCount = execSync(`git rev-list --count ${branch.name} ^${this.mainBranch}`, {
        cwd: this.workingDir,
        encoding: 'utf8',
      }).trim();

      // If branch has at least 1 commit, consider it complete
      return parseInt(commitCount) > 0;
    } catch (error) {
      return false;
    }
  }
}
