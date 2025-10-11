import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Branch Namer
 * Uses Claude API to generate semantic branch names from task descriptions
 */
export class BranchNamer {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
  }

  /**
   * Generate semantic branch name from actions using Claude API
   */
  async generateBranchName(actions: string[]): Promise<string> {
    if (!this.apiKey || actions.length === 0) {
      return this.generateFallbackName(actions);
    }

    const prompt = `Generate a git branch name for these development actions:

${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Requirements:
- Format: type/short-description
- Type must be: feature, fix, refactor, docs, test, chore
- Use kebab-case for description
- Max 50 characters total
- Be descriptive but concise
- Focus on the PRIMARY action

Examples:
- feature/error-handling
- feature/logging-system
- fix/validation-bug
- refactor/code-cleanup
- docs/api-documentation

Respond with ONLY the branch name, nothing else.`;

    try {
      // Use Claude API via --print mode
      const { stdout } = await execAsync(
        `echo "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" | timeout 30s claude --print --permission-mode bypassPermissions`,
        {
          maxBuffer: 1024 * 1024,
          shell: '/bin/bash'
        }
      );

      const branchName = stdout.trim().toLowerCase();

      // Validate format
      if (this.isValidBranchName(branchName)) {
        console.log(`   ✓ AI-generated branch name: ${branchName}`);
        return branchName;
      } else {
        console.log(`   ⚠️  AI branch name invalid, using fallback`);
        return this.generateFallbackName(actions);
      }
    } catch (error) {
      console.log(`   ⚠️  AI branch naming failed, using fallback`);
      return this.generateFallbackName(actions);
    }
  }

  /**
   * Validate branch name format
   */
  private isValidBranchName(name: string): boolean {
    // Check format: type/description
    const pattern = /^(feature|fix|refactor|docs|test|chore)\/[a-z0-9-]+$/;
    return pattern.test(name) && name.length <= 50;
  }

  /**
   * Generate fallback branch name from actions
   */
  private generateFallbackName(actions: string[]): string {
    if (actions.length === 0) {
      return 'feature/development';
    }

    const firstAction = actions[0].toLowerCase();

    // Determine type
    let type = 'feature';
    if (firstAction.includes('fix') || firstAction.includes('bug')) {
      type = 'fix';
    } else if (firstAction.includes('refactor')) {
      type = 'refactor';
    } else if (firstAction.includes('test')) {
      type = 'test';
    } else if (firstAction.includes('doc')) {
      type = 'docs';
    }

    // Generate description from first action
    const description = firstAction
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 4) // Max 4 words
      .join('-')
      .substring(0, 40);

    return `${type}/${description}`;
  }
}
