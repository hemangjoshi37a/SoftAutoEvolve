import { WorkflowOrchestrator } from './workflow-orchestrator.js';
import { AutoTaskGenerator } from './auto-task-generator.js';
import { GitAutomation } from './git-automation.js';
import { ProjectAnalyzer, ProjectIntent } from './project-analyzer.js';
import { GitHubAutomation } from './github-automation.js';
import { MDAnalyzer, MDAnalysisResult } from './md-analyzer.js';
import { NotificationSystem } from './notification-system.js';
import { BranchResumeManager } from './branch-resume-manager.js';
import { CyberpunkUI } from './cyberpunk-ui.js';
import { SensorySystem } from './sensory-system.js';
import { ClosedLoopTester } from './closed-loop-tester.js';

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
  private branchResumeManager: BranchResumeManager;
  private sensorySystem: SensorySystem;
  private closedLoopTester: ClosedLoopTester;
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
    this.branchResumeManager = new BranchResumeManager(workingDir);
    this.sensorySystem = new SensorySystem(workingDir);
    this.closedLoopTester = new ClosedLoopTester(workingDir);
  }

  /**
   * Start autonomous development
   */
  public async start(): Promise<void> {
    this.running = true;

    // Cyberpunk header
    console.log(CyberpunkUI.banner([
      '🤖 AUTONOMOUS AGENT INITIALIZED',
      'INFINITE DEVELOPMENT MODE',
      '═══════════════════════════'
    ]));

    console.log(CyberpunkUI.info(`Working Directory: ${this.workingDir}\n`));

    // Analyze project intent
    console.log(CyberpunkUI.info('Analyzing project structure...\n'));
    this.projectIntent = await this.projectAnalyzer.analyzeProject();
    console.log(this.projectAnalyzer.getSummary(this.projectIntent));
    console.log('');

    // Analyze Markdown documentation
    this.mdAnalysisResult = await this.mdAnalyzer.analyzeAllMDFiles();
    console.log(this.mdAnalyzer.formatSummary(this.mdAnalysisResult));
    console.log('');

    // Initialize sensory system
    await this.sensorySystem.initialize();

    // Display sensory capabilities (Sensors & Actuators)
    console.log(CyberpunkUI.info('Detecting sensory capabilities...\n'));
    const capabilities = await this.closedLoopTester.getCapabilities();

    console.log('🎮 Sensory System Status:');
    console.log(`   X11 Display: ${capabilities.x11 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}\n`);

    console.log('   📥 SENSORS (Input - Perceive Environment):');
    console.log(`      Screenshot:  ${capabilities.sensors.screenshot ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    console.log(`      Browser:     ${capabilities.sensors.browser ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    console.log(`      OCR:         ${capabilities.sensors.ocr ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}\n`);

    console.log('   📤 ACTUATORS (Output - Change Environment):');
    console.log(`      Keyboard:    ${capabilities.actuators.keyboard ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    console.log(`      Mouse:       ${capabilities.actuators.mouse ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    console.log(`      Window Mgmt: ${capabilities.actuators.window ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}\n`);

    console.log('   🤖 Advanced Automation:');
    console.log(`      Actiona:     ${capabilities.actiona ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    console.log('');

    // Check for open branches to resume
    const branchesToResume = await this.branchResumeManager.getBranchesToResume();

    if (branchesToResume.length > 0) {
      console.log(CyberpunkUI.header('OPEN BRANCHES DETECTED'));
      console.log('');

      for (const branch of branchesToResume) {
        // Resume the branch
        const resumed = await this.branchResumeManager.resumeBranch(branch);

        if (resumed) {
          // Check if work is complete
          const isComplete = await this.branchResumeManager.isBranchComplete(branch);

          if (isComplete) {
            // Complete and merge the branch
            await this.branchResumeManager.completeBranch(branch.name);
          } else {
            // Continue working on this branch
            console.log(CyberpunkUI.info('Continuing work on this branch...'));
            break;
          }
        }
      }

      console.log('');
    }

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
        const docTasks = await this.mdAnalyzer.generateTasks(this.mdAnalysisResult);
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

    // Notify cycle completion with task details
    await this.notifications.notifyCycleComplete(this.cycleCount, tasks.length, tasks);

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
