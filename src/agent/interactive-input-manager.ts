import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Interactive Input Manager - v5.0
 *
 * Provides interactive prompts for users to guide development direction
 * while maintaining the option for fully autonomous mode
 */

export interface UserGuidance {
  developmentGoal?: string;
  priorityFeatures?: string[];
  constraints?: string[];
  skipInteraction?: boolean;
  continueMode?: 'interactive' | 'autonomous';
}

export interface ProjectState {
  files: number;
  tests: number;
  coverage?: number;
  openTasks?: number;
  totalTasks?: number;
  fitnessScore?: number;
  branchName?: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  estimatedImpact?: number;
  reasoning?: string;
}

export class InteractiveInputManager {
  private autonomousMode: boolean = false;

  constructor(autonomousMode: boolean = false) {
    this.autonomousMode = autonomousMode;
  }

  /**
   * Prompt user for development direction at cycle start
   */
  async promptUserForDirection(
    projectState: ProjectState,
    aiRecommendations: AIRecommendation[]
  ): Promise<UserGuidance> {
    // Skip interaction if in autonomous mode
    if (this.autonomousMode) {
      return {
        skipInteraction: true,
        continueMode: 'autonomous'
      };
    }

    // Display header
    this.displayHeader();

    // Show current project state
    this.displayProjectState(projectState);

    // Show AI recommendations
    this.displayAIRecommendations(aiRecommendations);

    // Prompt for user choice
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.cyan('How would you like to proceed?'),
        choices: [
          {
            name: '1. Follow AI recommendation (use top suggestion)',
            value: 'follow-ai'
          },
          {
            name: '2. Custom goal (type your own development direction)',
            value: 'custom'
          },
          {
            name: '3. Review all Spec-Kit tasks',
            value: 'review-tasks'
          },
          {
            name: '4. Fully autonomous mode (no more prompts)',
            value: 'autonomous'
          },
          {
            name: '5. Exit',
            value: 'exit'
          }
        ]
      }
    ]);

    // Handle user choice
    switch (action) {
      case 'follow-ai':
        return this.handleFollowAI(aiRecommendations);

      case 'custom':
        return this.handleCustomGoal();

      case 'review-tasks':
        return this.handleReviewTasks();

      case 'autonomous':
        this.autonomousMode = true;
        console.log(chalk.green('\n✓ Switched to autonomous mode\n'));
        return {
          skipInteraction: true,
          continueMode: 'autonomous'
        };

      case 'exit':
        console.log(chalk.yellow('\n👋 Exiting...\n'));
        process.exit(0);

      default:
        return { skipInteraction: true };
    }
  }

  /**
   * Simple prompt for quick decisions
   */
  async promptContinue(): Promise<boolean> {
    if (this.autonomousMode) {
      return true;
    }

    const { continue: shouldContinue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: chalk.cyan('Continue with next cycle?'),
        default: true
      }
    ]);

    return shouldContinue;
  }

  /**
   * Prompt for custom task details
   */
  async promptCustomTask(): Promise<{ task: string; priority: string }> {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'task',
        message: chalk.cyan('Enter task description:'),
        validate: (input) => input.length > 0 || 'Task cannot be empty'
      },
      {
        type: 'list',
        name: 'priority',
        message: chalk.cyan('Select priority:'),
        choices: ['High', 'Medium', 'Low'],
        default: 'Medium'
      }
    ]);
  }

  // Private helper methods

  private displayHeader(): void {
    console.log(chalk.blue('\n╔══════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║') + chalk.bold.white(' 🚀 SoftAutoEvolve v5.0 - Interactive Mode          ') + chalk.blue('║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════╝\n'));
  }

  private displayProjectState(state: ProjectState): void {
    console.log(chalk.bold('📋 Current Project State:'));
    console.log(chalk.gray('   Files: ') + chalk.white(state.files) +
                chalk.gray(' | Tests: ') + chalk.white(state.tests));

    if (state.coverage !== undefined) {
      console.log(chalk.gray('   Coverage: ') + chalk.white(`${state.coverage}%`));
    }

    if (state.openTasks !== undefined && state.totalTasks !== undefined) {
      console.log(chalk.gray('   Open Tasks: ') +
                  chalk.white(`${state.openTasks}/${state.totalTasks}`));
    }

    if (state.fitnessScore !== undefined) {
      const scoreColor = state.fitnessScore >= 80 ? chalk.green :
                         state.fitnessScore >= 60 ? chalk.yellow : chalk.red;
      console.log(chalk.gray('   Fitness Score: ') +
                  scoreColor(`${state.fitnessScore}/100`));
    }

    if (state.branchName) {
      console.log(chalk.gray('   Current Branch: ') + chalk.cyan(state.branchName));
    }

    console.log();
  }

  private displayAIRecommendations(recommendations: AIRecommendation[]): void {
    if (recommendations.length === 0) {
      return;
    }

    console.log(chalk.bold('💭 AI Suggests:'));

    recommendations.slice(0, 3).forEach((rec, i) => {
      const num = chalk.cyan(`${i + 1}.`);
      const title = chalk.white(rec.title);
      const impact = rec.estimatedImpact !== undefined
        ? chalk.green(` (Est: +${rec.estimatedImpact} fitness)`)
        : '';

      console.log(`   ${num} ${title}${impact}`);

      if (rec.reasoning) {
        console.log(chalk.gray(`      ${rec.reasoning}`));
      }
    });

    console.log();
  }

  private async handleFollowAI(recommendations: AIRecommendation[]): Promise<UserGuidance> {
    if (recommendations.length === 0) {
      console.log(chalk.yellow('\n⚠️  No AI recommendations available\n'));
      return { skipInteraction: true };
    }

    const topRecommendation = recommendations[0];

    console.log(chalk.green(`\n✨ Following AI recommendation: ${topRecommendation.title}\n`));

    return {
      developmentGoal: topRecommendation.title,
      skipInteraction: false,
      continueMode: 'interactive'
    };
  }

  private async handleCustomGoal(): Promise<UserGuidance> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'goal',
        message: chalk.cyan('What would you like to focus on?'),
        validate: (input) => input.length > 0 || 'Goal cannot be empty'
      },
      {
        type: 'input',
        name: 'features',
        message: chalk.cyan('Priority features (comma-separated, optional):'),
        default: ''
      },
      {
        type: 'input',
        name: 'constraints',
        message: chalk.cyan('Any constraints or requirements (comma-separated, optional):'),
        default: ''
      }
    ]);

    const guidance: UserGuidance = {
      developmentGoal: answers.goal,
      skipInteraction: false,
      continueMode: 'interactive'
    };

    if (answers.features) {
      guidance.priorityFeatures = answers.features.split(',').map((f: string) => f.trim());
    }

    if (answers.constraints) {
      guidance.constraints = answers.constraints.split(',').map((c: string) => c.trim());
    }

    console.log(chalk.green('\n✓ Custom goal set!\n'));

    return guidance;
  }

  private async handleReviewTasks(): Promise<UserGuidance> {
    console.log(chalk.yellow('\n📋 Review tasks functionality - showing Spec-Kit tasks...\n'));

    // This will be enhanced when we implement Spec-Kit task reading
    return {
      developmentGoal: 'Review and execute Spec-Kit tasks',
      skipInteraction: false,
      continueMode: 'interactive'
    };
  }

  /**
   * Display success summary after cycle completion
   */
  displayCycleSummary(summary: {
    filesChanged: number;
    testsAdded: number;
    commitMessage: string;
    fitnessChange?: { before: number; after: number };
    duration: number;
  }): void {
    console.log(chalk.green('\n🎉 Development cycle complete!\n'));

    console.log(chalk.gray('   Files changed: ') + chalk.white(summary.filesChanged));
    console.log(chalk.gray('   Tests added: ') + chalk.white(summary.testsAdded));
    console.log(chalk.gray('   Commit: ') + chalk.cyan(`"${summary.commitMessage}"`));

    if (summary.fitnessChange) {
      const change = summary.fitnessChange.after - summary.fitnessChange.before;
      const changeStr = change >= 0 ? chalk.green(`+${change}`) : chalk.red(`${change}`);
      console.log(chalk.gray('   Fitness: ') +
                  chalk.white(`${summary.fitnessChange.before} → ${summary.fitnessChange.after}`) +
                  chalk.gray(' (') + changeStr + chalk.gray(')'));
    }

    const durationStr = summary.duration < 60
      ? `${Math.floor(summary.duration)}s`
      : `${Math.floor(summary.duration / 60)}m ${Math.floor(summary.duration % 60)}s`;

    console.log(chalk.gray('   Duration: ') + chalk.white(durationStr));
    console.log();
  }

  /**
   * Display error message
   */
  displayError(message: string): void {
    console.log(chalk.red('\n❌ Error: ') + chalk.white(message) + '\n');
  }

  /**
   * Display warning message
   */
  displayWarning(message: string): void {
    console.log(chalk.yellow('\n⚠️  Warning: ') + chalk.white(message) + '\n');
  }

  /**
   * Display info message
   */
  displayInfo(message: string): void {
    console.log(chalk.blue('\nℹ️  ') + chalk.white(message) + '\n');
  }

  /**
   * Check if in autonomous mode
   */
  isAutonomous(): boolean {
    return this.autonomousMode;
  }

  /**
   * Set autonomous mode
   */
  setAutonomousMode(enabled: boolean): void {
    this.autonomousMode = enabled;
  }
}
