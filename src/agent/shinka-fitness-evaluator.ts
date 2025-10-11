import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Shinka Fitness Evaluator - v5.0
 *
 * Evaluates code fitness using multiple metrics
 * Provides evolution recommendations based on fitness scores
 */

export interface FitnessMetrics {
  combined_score: number; // Overall fitness (0-100)
  code_quality: number; // Code complexity, maintainability (0-100)
  test_coverage: number; // Test coverage percentage (0-100)
  performance: number; // Performance score (0-100)
  feature_completeness: number; // Feature implementation completeness (0-100)
  bug_count: number; // Number of bugs/issues
  technical_debt: number; // Technical debt score (lower is better, 0-100)
}

export interface EvolutionGuidance {
  recommendations: string[];
  priorityAreas: string[];
  estimatedImpact: number; // Expected fitness improvement
  reasoning: string;
}

export interface ProjectGoals {
  targetCoverage?: number;
  targetPerformance?: number;
  targetQuality?: number;
  prioritizeFeatures?: boolean;
  prioritizeTests?: boolean;
}

export class ShinkaFitnessEvaluator {
  private workingDir: string;
  private goals: ProjectGoals;

  constructor(workingDir: string, goals: ProjectGoals = {}) {
    this.workingDir = workingDir;
    this.goals = {
      targetCoverage: goals.targetCoverage || 80,
      targetPerformance: goals.targetPerformance || 90,
      targetQuality: goals.targetQuality || 85,
      prioritizeFeatures: goals.prioritizeFeatures || false,
      prioritizeTests: goals.prioritizeTests || false
    };
  }

  /**
   * Evaluate current implementation and return fitness metrics
   */
  async evaluateImplementation(): Promise<FitnessMetrics> {
    console.log(chalk.blue('\n🧬 Evaluating code fitness...\n'));

    const codeQuality = await this.evaluateCodeQuality();
    const testCoverage = await this.evaluateTestCoverage();
    const performance = await this.evaluatePerformance();
    const featureCompleteness = await this.evaluateFeatureCompleteness();
    const bugCount = await this.countBugs();
    const technicalDebt = await this.evaluateTechnicalDebt();

    // Calculate combined score with weighted factors
    const weights = {
      quality: 0.25,
      coverage: 0.20,
      performance: 0.15,
      features: 0.20,
      bugs: 0.10,
      debt: 0.10
    };

    const bugPenalty = Math.min(bugCount * 5, 50); // Max 50 point penalty
    const combinedScore = Math.max(
      0,
      Math.min(100,
        codeQuality * weights.quality +
        testCoverage * weights.coverage +
        performance * weights.performance +
        featureCompleteness * weights.features -
        bugPenalty * weights.bugs +
        (100 - technicalDebt) * weights.debt
      )
    );

    const metrics: FitnessMetrics = {
      combined_score: Math.round(combinedScore),
      code_quality: codeQuality,
      test_coverage: testCoverage,
      performance,
      feature_completeness: featureCompleteness,
      bug_count: bugCount,
      technical_debt: technicalDebt
    };

    this.displayFitnessMetrics(metrics);

    return metrics;
  }

  /**
   * Get evolution recommendations based on current fitness
   */
  async getEvolutionDirection(
    currentMetrics: FitnessMetrics
  ): Promise<EvolutionGuidance> {
    const recommendations: string[] = [];
    const priorityAreas: string[] = [];
    let estimatedImpact = 0;

    // Analyze gaps vs goals
    const coverageGap = this.goals.targetCoverage! - currentMetrics.test_coverage;
    const qualityGap = this.goals.targetQuality! - currentMetrics.code_quality;
    const performanceGap = this.goals.targetPerformance! - currentMetrics.performance;

    // Coverage recommendations
    if (coverageGap > 10) {
      recommendations.push(
        `Add tests to reach ${this.goals.targetCoverage}% coverage (currently ${Math.round(currentMetrics.test_coverage)}%)`
      );
      priorityAreas.push('testing');
      estimatedImpact += coverageGap * 0.2;
    }

    // Code quality recommendations
    if (qualityGap > 10) {
      recommendations.push(
        'Refactor complex functions to improve code quality'
      );
      priorityAreas.push('refactoring');
      estimatedImpact += qualityGap * 0.25;
    }

    // Performance recommendations
    if (performanceGap > 15) {
      recommendations.push('Optimize performance bottlenecks');
      priorityAreas.push('performance');
      estimatedImpact += performanceGap * 0.15;
    }

    // Bug recommendations
    if (currentMetrics.bug_count > 0) {
      recommendations.push(`Fix ${currentMetrics.bug_count} identified bugs`);
      priorityAreas.push('bug-fixes');
      estimatedImpact += currentMetrics.bug_count * 3;
    }

    // Technical debt
    if (currentMetrics.technical_debt > 40) {
      recommendations.push('Address technical debt (code smells, TODOs)');
      priorityAreas.push('maintenance');
      estimatedImpact += (currentMetrics.technical_debt - 40) * 0.1;
    }

    // Feature completeness
    if (currentMetrics.feature_completeness < 70) {
      recommendations.push('Complete unfinished features');
      priorityAreas.push('feature-completion');
      estimatedImpact += (70 - currentMetrics.feature_completeness) * 0.2;
    }

    // General improvement if fitness is good
    if (currentMetrics.combined_score >= 80 && recommendations.length === 0) {
      recommendations.push('Add new features to expand functionality');
      recommendations.push('Improve documentation and examples');
      priorityAreas.push('enhancement');
      estimatedImpact += 5;
    }

    // Generate reasoning
    const topPriority = priorityAreas[0] || 'general improvement';
    const reasoning = `Focus on ${topPriority} to maximize fitness improvement. Current score: ${currentMetrics.combined_score}/100`;

    return {
      recommendations,
      priorityAreas,
      estimatedImpact: Math.round(estimatedImpact),
      reasoning
    };
  }

  /**
   * Compare two implementations and show fitness delta
   */
  compareFitness(
    before: FitnessMetrics,
    after: FitnessMetrics
  ): { improved: boolean; delta: number; summary: string } {
    const delta = after.combined_score - before.combined_score;
    const improved = delta > 0;

    const changes: string[] = [];

    if (after.code_quality !== before.code_quality) {
      changes.push(
        `Code quality: ${Math.round(before.code_quality)} → ${Math.round(after.code_quality)}`
      );
    }

    if (after.test_coverage !== before.test_coverage) {
      changes.push(
        `Test coverage: ${Math.round(before.test_coverage)}% → ${Math.round(after.test_coverage)}%`
      );
    }

    if (after.performance !== before.performance) {
      changes.push(
        `Performance: ${Math.round(before.performance)} → ${Math.round(after.performance)}`
      );
    }

    if (after.bug_count !== before.bug_count) {
      changes.push(`Bugs: ${before.bug_count} → ${after.bug_count}`);
    }

    const summary = changes.length > 0 ? changes.join(', ') : 'No significant changes';

    return { improved, delta: Math.round(delta), summary };
  }

  // Private evaluation methods

  private async evaluateCodeQuality(): Promise<number> {
    try {
      // Count files and lines
      const stats = this.getProjectStats();

      // Simple heuristic: fewer large files = better quality
      const avgLinesPerFile = stats.fileCount > 0 ? stats.totalLines / stats.fileCount : 0;
      const qualityScore = Math.max(0, Math.min(100, 100 - (avgLinesPerFile / 10)));

      // Check for common quality indicators
      let bonusPoints = 0;

      // Check for TypeScript/typed code
      if (stats.hasTypes) bonusPoints += 10;

      // Check for documentation
      if (stats.hasReadme) bonusPoints += 5;

      // Check for configuration files (eslint, prettier, etc.)
      if (stats.hasLinting) bonusPoints += 5;

      return Math.min(100, qualityScore + bonusPoints);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not evaluate code quality'));
      return 50; // Default neutral score
    }
  }

  private async evaluateTestCoverage(): Promise<number> {
    try {
      // Look for test files
      const testFiles = this.findFiles('**/*.{test,spec}.{ts,js,py}');

      const allFiles = this.findFiles('**/*.{ts,js,py}', [
        'node_modules',
        'dist',
        'build',
        '.venv',
        '__pycache__'
      ]);

      if (allFiles.length === 0) return 0;

      // Rough estimate: assume each test file covers 2-3 source files
      const estimatedCoverage = Math.min(
        100,
        (testFiles.length / allFiles.length) * 250
      );

      return Math.round(estimatedCoverage);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not evaluate test coverage'));
      return 0;
    }
  }

  private async evaluatePerformance(): Promise<number> {
    // Simple heuristic based on code structure
    try {
      const stats = this.getProjectStats();

      // Assume good performance if code is modular
      const performanceScore = stats.fileCount > 5 ? 75 : 60;

      return performanceScore;
    } catch (error) {
      return 70; // Default
    }
  }

  private async evaluateFeatureCompleteness(): Promise<number> {
    try {
      // Check for TODOs and FIXMEs
      const todoCount = this.countPatternInFiles(/TODO|FIXME|XXX|HACK/gi);

      // Check for empty/stub functions
      const stubCount = this.countPatternInFiles(/throw new Error\(['"]Not implemented/gi);

      // More TODOs = less complete
      const completeness = Math.max(0, 100 - todoCount * 5 - stubCount * 10);

      return Math.round(completeness);
    } catch (error) {
      return 80; // Default assume mostly complete
    }
  }

  private async countBugs(): Promise<number> {
    try {
      // Look for common bug indicators
      const bugPatterns = [
        /console\.error/gi,
        /throw new Error/gi,
        /BUG:|FIXME:/gi,
        /\btry\s*{\s*}\s*catch/gi // Empty try-catch
      ];

      let bugCount = 0;
      for (const pattern of bugPatterns) {
        bugCount += this.countPatternInFiles(pattern);
      }

      return Math.floor(bugCount / 3); // Normalize
    } catch (error) {
      return 0;
    }
  }

  private async evaluateTechnicalDebt(): Promise<number> {
    try {
      // Check for tech debt indicators
      const todoCount = this.countPatternInFiles(/TODO|FIXME/gi);
      const hackCount = this.countPatternInFiles(/HACK|XXX|WIP/gi);
      const deprecatedCount = this.countPatternInFiles(/@deprecated/gi);

      // More debt indicators = higher debt score
      const debtScore = Math.min(
        100,
        todoCount * 2 + hackCount * 3 + deprecatedCount * 2
      );

      return Math.round(debtScore);
    } catch (error) {
      return 20; // Default low debt
    }
  }

  // Helper methods

  private getProjectStats(): {
    fileCount: number;
    totalLines: number;
    hasTypes: boolean;
    hasReadme: boolean;
    hasLinting: boolean;
  } {
    const files = this.findFiles('**/*.{ts,js,py}', [
      'node_modules',
      'dist',
      'build',
      '.venv'
    ]);

    let totalLines = 0;
    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        totalLines += content.split('\n').length;
      } catch {}
    });

    const hasTypes = fs.existsSync(path.join(this.workingDir, 'tsconfig.json'));
    const hasReadme = fs.existsSync(path.join(this.workingDir, 'README.md'));
    const hasLinting =
      fs.existsSync(path.join(this.workingDir, '.eslintrc.json')) ||
      fs.existsSync(path.join(this.workingDir, '.eslintrc.js')) ||
      fs.existsSync(path.join(this.workingDir, 'pylint.rc'));

    return {
      fileCount: files.length,
      totalLines,
      hasTypes,
      hasReadme,
      hasLinting
    };
  }

  private findFiles(pattern: string, exclude: string[] = []): string[] {
    try {
      const command = `find . -type f -name "${pattern.replace('**/', '')}" ${exclude
        .map((e) => `-not -path "*/${e}/*"`)
        .join(' ')}`;

      const output = execSync(command, {
        cwd: this.workingDir,
        encoding: 'utf-8'
      });

      return output
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => path.join(this.workingDir, line.trim()));
    } catch (error) {
      return [];
    }
  }

  private countPatternInFiles(pattern: RegExp): number {
    const files = this.findFiles('**/*.{ts,js,py}', [
      'node_modules',
      'dist',
      'build',
      '.venv'
    ]);

    let count = 0;
    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.match(pattern);
        if (matches) count += matches.length;
      } catch {}
    });

    return count;
  }

  private displayFitnessMetrics(metrics: FitnessMetrics): void {
    console.log(chalk.bold('🧬 Fitness Evaluation Results:\n'));

    const scoreColor = (score: number) =>
      score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;

    console.log(
      chalk.gray('   Combined Score: ') +
        scoreColor(metrics.combined_score)(`${metrics.combined_score}/100`)
    );
    console.log(
      chalk.gray('   Code Quality: ') +
        scoreColor(metrics.code_quality)(`${Math.round(metrics.code_quality)}/100`)
    );
    console.log(
      chalk.gray('   Test Coverage: ') +
        scoreColor(metrics.test_coverage)(`${Math.round(metrics.test_coverage)}%`)
    );
    console.log(
      chalk.gray('   Performance: ') +
        scoreColor(metrics.performance)(`${Math.round(metrics.performance)}/100`)
    );
    console.log(
      chalk.gray('   Feature Completeness: ') +
        scoreColor(metrics.feature_completeness)(
          `${Math.round(metrics.feature_completeness)}%`
        )
    );
    console.log(
      chalk.gray('   Bugs: ') +
        (metrics.bug_count === 0
          ? chalk.green('0')
          : chalk.red(`${metrics.bug_count}`))
    );
    console.log(
      chalk.gray('   Technical Debt: ') +
        scoreColor(100 - metrics.technical_debt)(
          `${Math.round(metrics.technical_debt)}/100`
        )
    );

    console.log();
  }
}
