import * as fs from 'fs';
import * as path from 'path';

/**
 * Automatic Task Generator
 * Generates tasks based on project state and best practices
 */
export class AutoTaskGenerator {
  private workingDir: string;
  private generatedTasksCount: number = 0;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Generate tasks based on project analysis
   */
  public async generateTasks(): Promise<string[]> {
    const tasks: string[] = [];

    // Analyze project structure
    const analysis = this.analyzeProject();

    // Generate tasks based on what's missing
    if (!analysis.hasPackageJson && this.isNodeProject()) {
      tasks.push('Create package.json with project metadata');
    }

    if (!analysis.hasReadme) {
      tasks.push('Create comprehensive README.md');
    }

    if (!analysis.hasTests) {
      tasks.push('Add unit tests for core functionality');
    }

    if (!analysis.hasGitignore) {
      tasks.push('Create .gitignore file');
    }

    if (analysis.fileCount === 0) {
      // Empty project - create initial structure
      tasks.push('Create initial project structure');
      tasks.push('Add main entry point file');
      tasks.push('Set up basic configuration');
    }

    if (analysis.hasCode && !analysis.hasTests) {
      tasks.push('Add integration tests');
    }

    // Quality improvements
    if (analysis.fileCount > 0) {
      tasks.push('Add error handling and logging');
      tasks.push('Optimize performance and memory usage');
      tasks.push('Add input validation');
    }

    // If we have some tasks, add documentation
    if (tasks.length > 0) {
      tasks.push('Add inline code documentation');
    }

    // If nothing specific, add feature expansion
    if (tasks.length === 0) {
      tasks.push(...this.generateFeatureExpansionTasks(analysis));
    }

    this.generatedTasksCount += tasks.length;

    return tasks.slice(0, 5); // Return max 5 tasks at a time
  }

  /**
   * Generate feature expansion tasks
   */
  private generateFeatureExpansionTasks(analysis: ProjectAnalysis): string[] {
    const tasks: string[] = [];

    if (analysis.hasCode) {
      tasks.push('Add CLI argument parsing');
      tasks.push('Add configuration file support');
      tasks.push('Add progress indicators');
      tasks.push('Add result export functionality');
      tasks.push('Add verbose logging mode');
    }

    return tasks;
  }

  /**
   * Analyze project structure
   */
  private analyzeProject(): ProjectAnalysis {
    const analysis: ProjectAnalysis = {
      hasPackageJson: false,
      hasReadme: false,
      hasTests: false,
      hasGitignore: false,
      hasCode: false,
      fileCount: 0,
      codeFiles: [],
    };

    try {
      const files = fs.readdirSync(this.workingDir);

      analysis.fileCount = files.length;
      analysis.hasPackageJson = files.includes('package.json');
      analysis.hasReadme = files.some((f) =>
        f.toLowerCase().startsWith('readme')
      );
      analysis.hasGitignore = files.includes('.gitignore');

      // Check for test files
      analysis.hasTests = this.hasTestFiles(this.workingDir);

      // Check for code files
      const codeExtensions = ['.js', '.ts', '.py', '.java', '.go', '.rs'];
      analysis.codeFiles = this.findFiles(this.workingDir, codeExtensions);
      analysis.hasCode = analysis.codeFiles.length > 0;
    } catch (error) {
      // Can't read directory
    }

    return analysis;
  }

  /**
   * Check if directory has test files
   */
  private hasTestFiles(dir: string): boolean {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (['test', 'tests', '__tests__', 'spec'].includes(file)) {
            return true;
          }
          if (this.hasTestFiles(fullPath)) {
            return true;
          }
        } else if (
          file.includes('.test.') ||
          file.includes('.spec.') ||
          file.includes('_test.')
        ) {
          return true;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return false;
  }

  /**
   * Find files with specific extensions
   */
  private findFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip common directories
          if (
            !['node_modules', '.git', 'dist', 'build', '__pycache__'].includes(
              item
            )
          ) {
            files.push(...this.findFiles(fullPath, extensions));
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return files;
  }

  /**
   * Check if this is a Node.js project
   */
  private isNodeProject(): boolean {
    try {
      const files = fs.readdirSync(this.workingDir);
      return (
        files.includes('package.json') ||
        files.some((f) => f.endsWith('.js') || f.endsWith('.ts'))
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get generation statistics
   */
  public getStats(): { totalGenerated: number } {
    return {
      totalGenerated: this.generatedTasksCount,
    };
  }
}

interface ProjectAnalysis {
  hasPackageJson: boolean;
  hasReadme: boolean;
  hasTests: boolean;
  hasGitignore: boolean;
  hasCode: boolean;
  fileCount: number;
  codeFiles: string[];
}
