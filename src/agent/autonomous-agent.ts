import { WorkflowOrchestrator } from './workflow-orchestrator.js';
import { AutoTaskGenerator } from './auto-task-generator.js';
import { GitAutomation } from './git-automation.js';
import { ProjectAnalyzer, ProjectIntent } from './project-analyzer.js';
import { GitHubAutomation } from './github-automation.js';
import { MDAnalyzer, MDAnalysisResult } from './md-analyzer.js';
import { NotificationSystem } from './notification-system.js';

/**
 * Autonomous Development Agent
 * Runs infinitely, automatically generating and executing tasks
 */
export class AutonomousAgent {
  private orchestrator: WorkflowOrchestrator;
  private taskGenerator: AutoTaskGenerator;
  private gitAutomation: GitAutomation;
  private projectAnalyzer: ProjectAnalyzer;
  private githubAutomation: GitHubAutomation;
  private mdAnalyzer: MDAnalyzer;
  private notifications: NotificationSystem;
  private workingDir: string;
  private cycleCount: number = 0;
  private running: boolean = false;
  private projectIntent: ProjectIntent | null = null;
  private mdAnalysisResult: MDAnalysisResult | null = null;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.orchestrator = new WorkflowOrchestrator(workingDir);
    this.taskGenerator = new AutoTaskGenerator(workingDir);
    this.gitAutomation = new GitAutomation(workingDir);
    this.projectAnalyzer = new ProjectAnalyzer(workingDir);
    this.githubAutomation = new GitHubAutomation(workingDir);
    this.mdAnalyzer = new MDAnalyzer(workingDir);
    this.notifications = new NotificationSystem();
  }

  /**
   * Start autonomous development
   */
  public async start(): Promise<void> {
    this.running = true;

    console.log('╔════════════════════════════════════════╗');
    console.log('║   🤖 Autonomous Agent Started         ║');
    console.log('║   Infinite Development Mode            ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`📁 ${this.workingDir}\n`);

    // Analyze project intent
    console.log('🔍 Analyzing project...');
    this.projectIntent = await this.projectAnalyzer.analyzeProject();
    console.log(this.projectAnalyzer.getSummary(this.projectIntent));
    console.log('');

    // Analyze Markdown documentation
    this.mdAnalysisResult = await this.mdAnalyzer.analyzeAllMDFiles();
    console.log(this.mdAnalyzer.formatSummary(this.mdAnalysisResult));
    console.log('');

    // Initialize Git and GitHub
    await this.orchestrator.initialize();

    // Setup GitHub if configured
    if (this.githubAutomation.isConfigured()) {
      await this.githubAutomation.autoSetupGitHub();
      console.log('');
    }

    console.log('🔄 Running autonomous development cycles...\n');
    console.log('Press Ctrl+C to stop\n');

    // Run infinite loop
    while (this.running) {
      try {
        await this.runCycle();
        await this.delay(2000); // 2 second pause between cycles
      } catch (error: any) {
        console.error(`❌ Cycle error: ${error.message}`);
        await this.notifications.notifyCycleError(this.cycleCount, error.message);
        await this.delay(5000); // Longer delay on error
      }
    }
  }

  /**
   * Run a single development cycle
   */
  private async runCycle(): Promise<void> {
    this.cycleCount++;

    console.log(`┌─ Cycle ${this.cycleCount} ─────────────────────────────┐`);

    // Generate tasks based on project intent
    console.log('│ 🎯 Generating tasks...');
    let tasks: string[];

    if (this.projectIntent) {
      // Use intelligent task generation based on project analysis
      tasks = this.projectAnalyzer.generateDevelopmentPlan(this.projectIntent);

      // Add documentation improvement tasks from MD analysis
      if (this.mdAnalysisResult) {
        const docTasks = this.mdAnalyzer.generateTasks(this.mdAnalysisResult);
        // Add doc tasks with lower priority (add a few, not all)
        tasks = tasks.concat(docTasks.slice(0, 2));
      }
    } else {
      // Fallback to generic task generation
      tasks = await this.taskGenerator.generateTasks();
    }

    if (tasks.length === 0) {
      console.log('│ ✓ Project complete!');
      console.log('└─────────────────────────────────────────┘\n');

      // Push final state to GitHub
      if (this.githubAutomation.isConfigured()) {
        await this.githubAutomation.pushToGitHub(
          require('path').basename(this.workingDir)
        );
      }

      // Notify project completion
      await this.notifications.notifyProjectComplete();

      this.running = false;
      return;
    }

    console.log(`│ ✓ ${tasks.length} tasks generated`);

    // Execute workflow
    await this.orchestrator.executeWorkflowCycle(tasks);

    // Push to GitHub after each cycle
    if (this.githubAutomation.isConfigured()) {
      const repoName = require('path').basename(this.workingDir);
      await this.githubAutomation.pushToGitHub(repoName);
      await this.notifications.notifyGitHubPush(repoName);
    }

    // Display stats
    await this.displayStats();

    // Notify cycle completion
    await this.notifications.notifyCycleComplete(this.cycleCount, tasks.length);

    console.log('└─────────────────────────────────────────┘\n');

    // Re-analyze project for next cycle
    this.projectIntent = await this.projectAnalyzer.analyzeProject();

    // Re-analyze MD files every 3 cycles to track documentation improvements
    if (this.cycleCount % 3 === 0) {
      this.mdAnalysisResult = await this.mdAnalyzer.analyzeAllMDFiles();
    }
  }

  /**
   * Display cycle statistics
   */
  private async displayStats(): Promise<void> {
    const gitStats = await this.gitAutomation.getStats();
    const taskStats = this.taskGenerator.getStats();
    const evolutionCount = this.orchestrator.getEvolutionCount();

    console.log('│ 📊 Stats:');
    console.log(`│   Cycles: ${this.cycleCount} | Evolution: ${evolutionCount}`);
    console.log(`│   Commits: ${gitStats.totalCommits} | Tasks: ${taskStats.totalGenerated}`);
  }

  /**
   * Stop the agent
   */
  public stop(): void {
    this.running = false;
    console.log('\n👋 Autonomous agent stopped\n');
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
