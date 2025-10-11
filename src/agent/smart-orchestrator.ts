import { AIStrategist, ProjectState, StrategicPlan } from './ai-strategist.js';
import { TTYInteractionManager } from './tty-interaction-manager.js';
import { BranchNamer } from './branch-namer.js';
import { InteractiveInputManager, UserGuidance, AIRecommendation } from './interactive-input-manager.js';
import { SpecKitTaskReader, TaskGraph } from './spec-kit-task-reader.js';
import { ShinkaFitnessEvaluator, FitnessMetrics } from './shinka-fitness-evaluator.js';
import { shinkaEvolveIntegration } from '../integrations/shinka-evolve-integration.js';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * Smart Orchestrator v5.0
 * Intelligently coordinates AI strategy, Spec-Kit, Claude Code, and ShinkaEvolve
 * NOW WITH: Interactive user input, Spec-Kit task execution, Fitness-based evolution
 * This is the "brain" that makes smart decisions based on actual code state
 */
export class SmartOrchestrator {
  private workingDir: string;
  private strategist: AIStrategist;
  private ttyManager: TTYInteractionManager;
  private branchNamer: BranchNamer;
  private interactiveManager: InteractiveInputManager;
  private taskReader: SpecKitTaskReader;
  private fitnessEvaluator: ShinkaFitnessEvaluator;
  private cycleCount: number = 0;
  private previousFitness?: FitnessMetrics;

  constructor(workingDir: string, autonomousMode: boolean = false) {
    this.workingDir = workingDir;
    this.strategist = new AIStrategist(workingDir);
    this.ttyManager = new TTYInteractionManager(workingDir);
    this.branchNamer = new BranchNamer();
    this.interactiveManager = new InteractiveInputManager(autonomousMode);
    this.taskReader = new SpecKitTaskReader(workingDir);
    this.fitnessEvaluator = new ShinkaFitnessEvaluator(workingDir);
  }

  /**
   * Initialize Spec-Kit if not already present
   */
  private async ensureSpecKitInitialized(): Promise<boolean> {
    const specKitDir = path.join(this.workingDir, '.specify');

    if (fs.existsSync(specKitDir)) {
      console.log('   ✓ Spec-Kit already initialized');
      return true;
    }

    console.log('   🔧 Initializing Spec-Kit...');

    try {
      const { stdout, stderr } = await execAsync(
        `specify init . --here --ai claude --force`,
        {
          cwd: this.workingDir,
          timeout: 60000
        }
      );

      if (fs.existsSync(specKitDir)) {
        console.log('   ✓ Spec-Kit initialized successfully');
        return true;
      } else {
        console.log('   ⚠️  Spec-Kit initialization completed but directory not found');
        return false;
      }
    } catch (error: any) {
      console.log(`   ❌ Failed to initialize Spec-Kit: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute one smart development cycle - v5.0 ENHANCED
   * Now with: Interactive user input, Spec-Kit task execution, Fitness-based evolution
   */
  async executeSmartCycle(): Promise<CycleResult> {
    this.cycleCount++;
    const startTime = Date.now();

    console.log(`\n╔═══════════════════════════════════════════════════╗`);
    console.log(`║  🧠 SMART CYCLE ${this.cycleCount} - AI-Driven Development  ║`);
    console.log(`╚═══════════════════════════════════════════════════╝\n`);

    // STEP 0: Ensure Spec-Kit is initialized
    console.log('🔧 Step 0: Ensuring Spec-Kit Ready');
    await this.ensureSpecKitInitialized();

    // STEP 1: Read actual project code state
    console.log('\n📖 Step 1: Analyzing Project State');
    const projectState = await this.strategist.analyzeProjectState();

    // STEP 1.5: Evaluate current fitness (v5.0)
    console.log('\n🧬 Step 1.5: Evaluating Code Fitness');
    const currentFitness = await this.fitnessEvaluator.evaluateImplementation();

    // STEP 2: Get web insights for inspiration (DISABLED for now)
    console.log('\n🌐 Step 2: Gathering Inspiration');
    console.log('   ⚠️  Web search disabled');
    const webInsights = null; // Disabled web search

    // STEP 3: AI decides strategy (what to do next)
    console.log('\n🎯 Step 3: AI Strategic Planning');
    const strategy = await this.strategist.decideNextActions(projectState, webInsights || undefined);

    // STEP 3.5: Get fitness-based recommendations (v5.0)
    const evolutionGuidance = await this.fitnessEvaluator.getEvolutionDirection(currentFitness);

    // Convert to AI recommendations format
    const aiRecommendations: AIRecommendation[] = [
      ...strategy.actions.slice(0, 3).map((action, i) => ({
        title: action,
        description: strategy.reasoning,
        estimatedImpact: 10 - i * 2
      })),
      ...evolutionGuidance.recommendations.map((rec, i) => ({
        title: rec,
        description: evolutionGuidance.reasoning,
        estimatedImpact: evolutionGuidance.estimatedImpact - i * 2
      }))
    ];

    // STEP 4: Interactive user input (v5.0) - Skip if autonomous
    console.log('\n💬 Step 4: User Guidance');

    // Count test files from project state
    const testCount = projectState.files.filter(f =>
      f.path.includes('.test.') || f.path.includes('.spec.') || f.path.includes('/test/')
    ).length;

    const userGuidance = await this.interactiveManager.promptUserForDirection(
      {
        files: projectState.files.length,
        tests: testCount,
        coverage: currentFitness.test_coverage,
        fitnessScore: currentFitness.combined_score,
        branchName: await this.getCurrentBranch()
      },
      aiRecommendations
    );

    // Use user's custom goal if provided
    let finalStrategy = strategy;
    if (userGuidance.developmentGoal && !userGuidance.skipInteraction) {
      console.log(`\n   ✨ Using user-provided goal: ${userGuidance.developmentGoal}`);
      finalStrategy = {
        ...strategy,
        actions: [userGuidance.developmentGoal, ...strategy.actions.slice(1)]
      };
    }

    console.log('\n   Strategic Plan:');
    finalStrategy.actions.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
    console.log(`\n   Reasoning: ${finalStrategy.reasoning}`);

    // STEP 5: Use Spec-Kit to plan implementation
    console.log('\n📋 Step 5: Spec-Kit Planning');
    const specKitResult = await this.planWithSpecKit(finalStrategy);

    // STEP 5.5: Read and execute Spec-Kit tasks if available (v5.0)
    let taskGraph: TaskGraph | null = null;
    if (this.taskReader.isInitialized()) {
      const tasks = await this.taskReader.readGeneratedTasks();
      if (tasks.length > 0) {
        taskGraph = this.taskReader.parseTaskBreakdown(tasks);
        this.taskReader.displayTaskGraph(taskGraph);
      }
    }

    // STEP 6: Execute with Claude Code (implementation)
    console.log('\n💻 Step 6: Claude Code Implementation');
    const implementationResult = await this.implementWithClaudeCode(
      finalStrategy,
      specKitResult,
      evolutionGuidance.recommendations.join('; '),
      taskGraph
    );

    // STEP 7: Verify changes were made
    console.log('\n✅ Step 7: Verification');
    const verification = await this.verifyChanges(implementationResult);

    // STEP 8: Re-evaluate fitness after changes (v5.0)
    let newFitness: FitnessMetrics | undefined;
    if (verification.success) {
      console.log('\n🧬 Step 8: Re-evaluating Fitness');
      newFitness = await this.fitnessEvaluator.evaluateImplementation();

      if (this.previousFitness) {
        const comparison = this.fitnessEvaluator.compareFitness(this.previousFitness, newFitness);
        console.log(`\n   Fitness Change: ${comparison.improved ? '📈' : '📉'} ${comparison.delta > 0 ? '+' : ''}${comparison.delta}`);
        console.log(`   ${comparison.summary}`);
      }

      this.previousFitness = newFitness;
    }

    // STEP 9: Commit if successful
    if (verification.success) {
      await this.commitChanges(finalStrategy.actions[0]);
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    const result: CycleResult = {
      cycle: this.cycleCount,
      strategy: finalStrategy,
      filesChanged: implementationResult.filesChanged,
      success: verification.success,
      duration,
      fitness: newFitness
    };

    // Display cycle summary using v5.0 interactive manager
    if (newFitness) {
      this.interactiveManager.displayCycleSummary({
        filesChanged: result.filesChanged.length,
        testsAdded: 0, // Could calculate from git diff
        commitMessage: finalStrategy.actions[0],
        fitnessChange: this.previousFitness && newFitness
          ? { before: this.previousFitness.combined_score, after: newFitness.combined_score }
          : undefined,
        duration
      });
    }

    this.printCycleSummary(result);

    // Ask if user wants to continue (v5.0)
    if (!this.interactiveManager.isAutonomous()) {
      const shouldContinue = await this.interactiveManager.promptContinue();
      if (!shouldContinue) {
        process.exit(0);
      }
    }

    return result;
  }

  /**
   * Plan implementation using Spec-Kit slash commands
   * Now shows FULL Claude Code interactive UI
   */
  private async planWithSpecKit(strategy: StrategicPlan): Promise<string> {
    if (strategy.specKitCommands.length === 0) {
      return 'Spec-Kit planning skipped';
    }

    // Execute Spec-Kit commands with FULL visibility
    const context = strategy.actions.join('\n');
    const results: string[] = [];

    for (const cmd of strategy.specKitCommands) {
      console.log(`\n   Executing: ${cmd}`);
      const result = await this.ttyManager.executeSlashCommand(cmd, context);
      results.push(result.output);
    }

    return results.join('\n\n');
  }

  /**
   * Get current git branch name
   */
  private async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: this.workingDir });
      return stdout.trim() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Implement using Claude Code with FULL INTERACTIVE UI - v5.0 ENHANCED
   * Shows everything Claude Code does in real-time
   * Now with Spec-Kit task execution
   */
  private async implementWithClaudeCode(
    strategy: StrategicPlan,
    specKitPlan: string,
    evolutionGuidance: string,
    taskGraph: TaskGraph | null
  ): Promise<{filesChanged: string[]}> {
    // If we have Spec-Kit tasks, execute them in order
    if (taskGraph && taskGraph.tasks.length > 0) {
      console.log('\n   📋 Executing Spec-Kit tasks in dependency order...\n');

      const prompts = taskGraph.executionOrder.map(taskId => {
        const task = taskGraph.tasks.find(t => t.id === taskId);
        if (!task) return '';

        return this.buildSmartPrompt(
          task.title,
          task.description || specKitPlan,
          evolutionGuidance
        );
      }).filter(p => p.length > 0);

      const result = await this.ttyManager.executeSequence(prompts, {
        timeout: 180000,
        waitBetween: 2,
        stopOnError: false
      });

      return { filesChanged: result.allFilesChanged };
    }

    // Otherwise, execute strategy actions normally
    const prompts = strategy.actions.map(action =>
      this.buildSmartPrompt(action, specKitPlan, evolutionGuidance)
    );

    // Execute with FULL visibility - shows Claude Code interactive UI
    const result = await this.ttyManager.executeSequence(prompts, {
      timeout: 180000,
      waitBetween: 2,
      stopOnError: false
    });

    return { filesChanged: result.allFilesChanged };
  }

  /**
   * Build intelligent prompt that emphasizes CREATING NEW WORK
   */
  private buildSmartPrompt(action: string, specKitPlan: string, evolutionGuidance: string): string {
    return `${action}

## Important Instructions

⚠️  **YOU MUST CREATE OR MODIFY FILES!**

This is NOT an analysis task. You must:
1. **Write actual code files** (create new or modify existing)
2. **Make real changes** to the codebase
3. **Add new functionality** (not just analyze)

${specKitPlan ? `\n## Spec-Kit Plan\n${specKitPlan.substring(0, 1000)}\n` : ''}

${evolutionGuidance ? `\n## Evolution Guidance\n${evolutionGuidance}\n` : ''}

## Implementation Requirements

✅ Create new files if needed
✅ Modify existing files to add functionality
✅ Write clean, working code
✅ Add proper error handling
✅ Include comments explaining new code
✅ Test that it works

❌ DO NOT just analyze existing code
❌ DO NOT skip implementation
❌ DO NOT say "file already exists" and stop

**START IMPLEMENTING NOW:**`;
  }

  /**
   * Verify that changes were actually made
   */
  private async verifyChanges(result: {filesChanged: string[]}): Promise<{success: boolean; message: string}> {
    // Check git status for actual changes
    try {
      const { stdout } = await execAsync('git status --short', { cwd: this.workingDir });

      if (stdout.trim()) {
        console.log(`   ✓ Git shows changes: ${stdout.split('\n').length} files`);
        return { success: true, message: 'Changes verified' };
      } else if (result.filesChanged.length > 0) {
        // Claude reported changes but git doesn't see them
        console.log(`   ⚠️  Claude reported changes but git sees none`);
        return { success: false, message: 'No changes detected by git' };
      } else {
        console.log(`   ⚠️  No changes made`);
        return { success: false, message: 'No changes made' };
      }
    } catch (error) {
      return { success: false, message: 'Verification failed' };
    }
  }

  /**
   * Commit changes with meaningful message
   */
  private async commitChanges(action: string): Promise<void> {
    try {
      await execAsync('git add -A', { cwd: this.workingDir });

      const commitMsg = `✨ ${action}

🤖 Generated with AI-driven development
Cycle: ${this.cycleCount}`;

      await execAsync(`git commit -m "${commitMsg}"`, { cwd: this.workingDir });

      console.log(`\n   ✓ Committed: ${action}`);
    } catch (error: any) {
      console.log(`   ⚠️  Commit failed: ${error.message}`);
    }
  }

  /**
   * Detect project type from state
   */
  private detectProjectType(state: ProjectState): string {
    const structure = state.structure.toLowerCase();

    if (structure.includes('pyqt') || structure.includes('tkinter')) return 'desktop-app';
    if (structure.includes('react') || structure.includes('vue')) return 'web-app';
    if (structure.includes('express') || structure.includes('fastapi')) return 'backend-api';
    if (structure.includes('cli') || structure.includes('command')) return 'cli-tool';

    return 'general';
  }

  /**
   * Detect primary language
   */
  private detectLanguage(state: ProjectState): string {
    const extensions = state.files.map(f => path.extname(f.path));

    if (extensions.some(e => e === '.py')) return 'python';
    if (extensions.some(e => e === '.ts')) return 'typescript';
    if (extensions.some(e => e === '.js')) return 'javascript';
    if (extensions.some(e => e === '.go')) return 'go';
    if (extensions.some(e => e === '.rs')) return 'rust';

    return 'unknown';
  }

  /**
   * Print cycle summary
   */
  private printCycleSummary(result: CycleResult): void {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log(`║  📊 Cycle ${result.cycle} Summary                         ║`);
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log(`\n   Status: ${result.success ? '✅ SUCCESS' : '⚠️  NO CHANGES'}`);
    console.log(`   Actions Planned: ${result.strategy.actions.length}`);
    console.log(`   Files Changed: ${result.filesChanged.length}`);

    if (result.filesChanged.length > 0) {
      console.log(`\n   Modified Files:`);
      result.filesChanged.slice(0, 5).forEach(f => console.log(`     • ${f}`));
    }

    console.log('');
  }
}

// Type definitions
export interface CycleResult {
  cycle: number;
  strategy: StrategicPlan;
  filesChanged: string[];
  success: boolean;
  duration: number;
  fitness?: FitnessMetrics; // v5.0: Track fitness metrics
}
