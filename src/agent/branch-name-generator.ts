/**
 * Branch Name Generator
 * Generates meaningful, human-readable Git branch names from task descriptions
 */
export class BranchNameGenerator {
  private maxLength: number = 50;

  constructor(maxLength: number = 50) {
    this.maxLength = maxLength;
  }

  /**
   * Generate a branch name from tasks
   */
  public generateFromTasks(tasks: string[], prefix: string = 'feature'): string {
    if (tasks.length === 0) {
      return `${prefix}/auto-${Date.now()}`;
    }

    // Analyze tasks to determine the main theme
    const theme = this.determineTheme(tasks);

    // Generate descriptive name
    let branchName = `${prefix}/${theme}`;

    // Ensure it's a valid Git branch name
    branchName = this.sanitizeBranchName(branchName);

    return branchName;
  }

  /**
   * Determine the main theme from tasks
   */
  private determineTheme(tasks: string[]): string {
    // If only one task, use it directly
    if (tasks.length === 1) {
      return this.extractKeywords(tasks[0]);
    }

    // Multiple tasks - find common theme or use first 2-3 tasks
    const keywords = tasks.slice(0, 3).map(task => this.extractKeywords(task));

    // Try to find common category
    const category = this.detectCategory(tasks);

    if (category && keywords.length > 1) {
      // Use category + first task keyword
      return `${category}-${keywords[0]}`;
    }

    // Join first 2 keywords
    return keywords.slice(0, 2).join('-');
  }

  /**
   * Extract keywords from a task description
   */
  private extractKeywords(task: string): string {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'can', 'must', 'shall', 'need',
    ]);

    // Extract words
    const words = task
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Take first 3 meaningful words
    const keywords = words.slice(0, 3);

    // Join with dashes
    return keywords.join('-');
  }

  /**
   * Detect category from tasks
   */
  private detectCategory(tasks: string[]): string | null {
    const allTasks = tasks.join(' ').toLowerCase();

    // Feature-related
    if (this.hasKeywords(allTasks, ['add', 'create', 'implement', 'build'])) {
      return 'add';
    }

    // Bug fixes
    if (this.hasKeywords(allTasks, ['fix', 'bug', 'issue', 'resolve', 'repair'])) {
      return 'fix';
    }

    // Tests
    if (this.hasKeywords(allTasks, ['test', 'testing', 'spec', 'coverage'])) {
      return 'test';
    }

    // Documentation
    if (this.hasKeywords(allTasks, ['doc', 'documentation', 'readme', 'guide'])) {
      return 'docs';
    }

    // Refactoring
    if (this.hasKeywords(allTasks, ['refactor', 'improve', 'optimize', 'enhance', 'update'])) {
      return 'refactor';
    }

    // Configuration
    if (this.hasKeywords(allTasks, ['config', 'setup', 'configure', 'install'])) {
      return 'config';
    }

    // UI/UX
    if (this.hasKeywords(allTasks, ['ui', 'ux', 'design', 'style', 'layout'])) {
      return 'ui';
    }

    return null;
  }

  /**
   * Check if text has any of the keywords
   */
  private hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Sanitize branch name for Git
   */
  private sanitizeBranchName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')  // Replace non-alphanumeric with dash
      .replace(/-+/g, '-')          // Multiple dashes to single dash
      .replace(/^-|-$/g, '')        // Remove leading/trailing dashes
      .substring(0, this.maxLength) // Limit length
      .replace(/-$/, '');           // Remove trailing dash if truncated
  }

  /**
   * Generate branch name with timestamp (fallback)
   */
  public generateWithTimestamp(description: string = 'auto'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:-]/g, '');
    const sanitized = this.sanitizeBranchName(description);
    return `feature/${sanitized}-${timestamp}`;
  }

  /**
   * Generate parallel branch name
   */
  public generateParallelBranchName(tasks: string[], index: number): string {
    const theme = this.determineTheme(tasks);
    const sanitized = this.sanitizeBranchName(theme);
    return `parallel/${sanitized}-${index}`;
  }

  /**
   * Generate evolution branch name
   */
  public generateEvolutionBranchName(generation: number, description: string = ''): string {
    if (description) {
      const sanitized = this.sanitizeBranchName(description);
      return `evolution/gen${generation}-${sanitized}`;
    }
    return `evolution/gen${generation}-${Date.now()}`;
  }

  /**
   * Examples of good branch names
   */
  public static examples(): Record<string, string[]> {
    return {
      'Feature branches': [
        'feature/add-user-authentication',
        'feature/implement-payment-gateway',
        'feature/create-dashboard-ui',
      ],
      'Bug fixes': [
        'fix/resolve-login-error',
        'fix/correct-payment-calculation',
        'fix/update-database-schema',
      ],
      'Documentation': [
        'docs/add-api-documentation',
        'docs/update-readme-installation',
        'docs/create-contributing-guide',
      ],
      'Tests': [
        'test/add-unit-tests-auth',
        'test/implement-integration-tests',
        'test/increase-coverage-api',
      ],
      'Refactoring': [
        'refactor/improve-code-structure',
        'refactor/optimize-database-queries',
        'refactor/update-deprecated-apis',
      ],
    };
  }
}
