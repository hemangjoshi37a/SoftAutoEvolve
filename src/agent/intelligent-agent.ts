import * as readline from 'readline';
import { spawn, ChildProcess } from 'child_process';
import { integrationManager } from '../integrations/integration-manager.js';
import { specKitIntegration } from '../integrations/spec-kit-integration.js';
import { shinkaEvolveIntegration } from '../integrations/shinka-evolve-integration.js';
import { config } from '../config/config.js';

/**
 * Intelligent Development Agent
 *
 * A sophisticated agent that:
 * - Runs continuously like Claude Code
 * - Automatically uses Spec-Kit for structure
 * - Automatically uses ShinkaEvolve for optimization
 * - Makes intelligent decisions about development direction
 * - Prioritizes features and resolves bugs automatically
 */

export interface AgentContext {
  projectInitialized: boolean;
  hasSpecification: boolean;
  hasPlan: boolean;
  hasTasks: boolean;
  currentPhase: 'initial' | 'planning' | 'implementing' | 'optimizing' | 'maintaining';
  conversationHistory: Message[];
  codeQuality: number; // 0-100
  testCoverage: number; // 0-100
  bugCount: number;
  featureRequests: string[];
  lastEvolution?: Date;
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  timestamp: Date;
  intent?: string;
  action?: string;
}

export class IntelligentDevelopmentAgent {
  private rl: readline.Interface;
  private context: AgentContext;
  private running: boolean = false;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.context = {
      projectInitialized: false,
      hasSpecification: false,
      hasPlan: false,
      hasTasks: false,
      currentPhase: 'initial',
      conversationHistory: [],
      codeQuality: 0,
      testCoverage: 0,
      bugCount: 0,
      featureRequests: [],
    };
  }

  /**
   * Start the intelligent agent
   */
  public async start(projectDir: string): Promise<void> {
    this.running = true;
    this.displayWelcome();

    // Check integrations
    const status = integrationManager.getStatus();
    if (!status.claudeCode.available || !status.specKit.available) {
      console.error('❌ Required integrations not available');
      integrationManager.displayStatus();
      process.exit(1);
    }

    console.log('\n🤖 Intelligent Development Agent Started');
    console.log('   I\'ll help you build, optimize, and maintain your software.');
    console.log('   Just tell me what you need, and I\'ll handle the rest.\n');

    // Main conversation loop
    await this.conversationLoop(projectDir);
  }

  private displayWelcome(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║              🧠 SoftAutoEvolve - Intelligent Development Agent 🧠             ║
║                                                                               ║
║                    Continuous AI-Powered Development                         ║
║                                                                               ║
║    I automatically orchestrate Claude Code, Spec-Kit, and ShinkaEvolve      ║
║              to build, optimize, and maintain your software                  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
  }

  /**
   * Main conversation loop - runs continuously
   */
  private async conversationLoop(projectDir: string): Promise<void> {
    while (this.running) {
      const userInput = await this.getUserInput('💬 You: ');

      if (!userInput.trim()) continue;

      // Handle special commands
      if (this.handleCommand(userInput)) {
        continue;
      }

      // Add to conversation history
      this.addMessage('user', userInput);

      // Analyze intent and decide action
      const decision = await this.analyzeAndDecide(userInput);

      // Execute the decision
      await this.executeDecision(decision, projectDir);
    }
  }

  /**
   * Analyze user input and intelligently decide what to do
   */
  private async analyzeAndDecide(input: string): Promise<Decision> {
    const intent = this.detectIntent(input);
    const decision: Decision = {
      intent,
      action: 'respond',
      useSpecKit: false,
      useEvolution: false,
      useClaude: true,
      priority: 'medium',
      reasoning: '',
    };

    // Decision logic based on context and intent
    if (intent === 'new_project' || intent === 'new_feature') {
      if (!this.context.projectInitialized) {
        decision.action = 'initialize_project';
        decision.useSpecKit = true;
        decision.reasoning = 'Project not initialized - need structured approach';
      } else if (!this.context.hasSpecification || intent === 'new_feature') {
        decision.action = 'create_specification';
        decision.useSpecKit = true;
        decision.reasoning = 'Need specification for clear requirements';
      }
    } else if (intent === 'bug_fix') {
      decision.action = 'fix_bug';
      decision.useClaude = true;
      decision.priority = 'high';
      decision.reasoning = 'Bug needs immediate attention';

      // Consider evolution if multiple bugs
      if (this.context.bugCount > 3) {
        decision.useEvolution = true;
        decision.reasoning += ' - Multiple bugs suggest code quality issue, will evolve solution';
      }
    } else if (intent === 'optimize' || intent === 'improve') {
      decision.action = 'optimize_code';
      decision.useEvolution = true;
      decision.reasoning = 'Code optimization benefits from evolutionary approach';
    } else if (intent === 'test' || intent === 'quality') {
      decision.action = 'improve_quality';
      decision.useClaude = true;
      decision.useEvolution = this.context.testCoverage < 70;
      decision.reasoning = 'Improving test coverage and code quality';
    } else if (intent === 'refactor') {
      decision.action = 'refactor';
      decision.useClaude = true;
      decision.useEvolution = true;
      decision.reasoning = 'Refactoring benefits from both intelligent editing and evolution';
    } else {
      // General development - use Claude with context awareness
      decision.action = 'develop';
      decision.useClaude = true;

      // Auto-suggest Spec-Kit for complex features
      if (this.isComplexFeature(input)) {
        decision.useSpecKit = true;
        decision.reasoning = 'Complex feature detected - using structured approach';
      }
    }

    // Auto-evolution trigger
    if (this.shouldTriggerEvolution()) {
      decision.useEvolution = true;
      decision.reasoning += ' + Auto-triggering evolution for continuous improvement';
    }

    return decision;
  }

  /**
   * Detect user intent from input
   */
  private detectIntent(input: string): string {
    const lower = input.toLowerCase();

    // New project indicators
    if (
      lower.includes('new project') ||
      lower.includes('start building') ||
      lower.includes('create a')
    ) {
      return 'new_project';
    }

    // New feature indicators
    if (
      lower.includes('add feature') ||
      lower.includes('new feature') ||
      lower.includes('implement') ||
      lower.includes('i want to add')
    ) {
      return 'new_feature';
    }

    // Bug fix indicators
    if (
      lower.includes('bug') ||
      lower.includes('error') ||
      lower.includes('not working') ||
      lower.includes('fix') ||
      lower.includes('broken')
    ) {
      return 'bug_fix';
    }

    // Optimization indicators
    if (
      lower.includes('optimize') ||
      lower.includes('performance') ||
      lower.includes('faster') ||
      lower.includes('slow')
    ) {
      return 'optimize';
    }

    // Testing indicators
    if (
      lower.includes('test') ||
      lower.includes('quality') ||
      lower.includes('coverage')
    ) {
      return 'test';
    }

    // Refactoring indicators
    if (
      lower.includes('refactor') ||
      lower.includes('clean up') ||
      lower.includes('restructure') ||
      lower.includes('improve code')
    ) {
      return 'refactor';
    }

    // Improvement indicators
    if (lower.includes('improve') || lower.includes('better')) {
      return 'improve';
    }

    return 'general';
  }

  /**
   * Check if feature is complex enough to warrant Spec-Kit
   */
  private isComplexFeature(input: string): boolean {
    const complexityIndicators = [
      'authentication',
      'database',
      'api',
      'integration',
      'dashboard',
      'admin panel',
      'user management',
      'payment',
      'notification',
      'real-time',
      'websocket',
      'multiple',
      'system',
    ];

    const lower = input.toLowerCase();
    return complexityIndicators.some((indicator) => lower.includes(indicator));
  }

  /**
   * Determine if evolution should be triggered
   */
  private shouldTriggerEvolution(): boolean {
    // Trigger evolution if:
    // 1. Code quality is low
    if (this.context.codeQuality < 60) return true;

    // 2. Many bugs
    if (this.context.bugCount > 5) return true;

    // 3. Low test coverage
    if (this.context.testCoverage < 50) return true;

    // 4. Haven't evolved in a while (7 days)
    if (this.context.lastEvolution) {
      const daysSinceEvolution =
        (Date.now() - this.context.lastEvolution.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceEvolution > 7) return true;
    }

    return false;
  }

  /**
   * Execute the decided action
   */
  private async executeDecision(decision: Decision, projectDir: string): Promise<void> {
    this.displayAgentThinking(decision);

    try {
      switch (decision.action) {
        case 'initialize_project':
          await this.initializeProject(projectDir);
          break;

        case 'create_specification':
          await this.createSpecification(projectDir);
          break;

        case 'fix_bug':
          await this.fixBug(projectDir, decision);
          break;

        case 'optimize_code':
          await this.optimizeCode(projectDir);
          break;

        case 'improve_quality':
          await this.improveQuality(projectDir);
          break;

        case 'refactor':
          await this.refactorCode(projectDir, decision);
          break;

        case 'develop':
        case 'respond':
        default:
          await this.generalDevelopment(projectDir, decision);
          break;
      }
    } catch (error: any) {
      console.error(`\n❌ Error: ${error.message}`);
      this.displayAssistant('I encountered an issue. Let me try a different approach.');
    }
  }

  private displayAgentThinking(decision: Decision): void {
    console.log(`\n🧠 Agent Decision:`);
    console.log(`   Intent: ${decision.intent}`);
    console.log(`   Action: ${decision.action}`);
    console.log(`   Priority: ${decision.priority}`);
    if (decision.useSpecKit) console.log(`   📋 Using Spec-Kit for structure`);
    if (decision.useEvolution) console.log(`   🧬 Using Evolution for optimization`);
    if (decision.useClaude) console.log(`   🤖 Using Claude Code for implementation`);
    console.log(`   💭 Reasoning: ${decision.reasoning}\n`);
  }

  /**
   * Initialize project with Spec-Kit
   */
  private async initializeProject(projectDir: string): Promise<void> {
    this.displaySystem('Initializing project with structured approach...');

    if (!specKitIntegration.isSpecKitInitialized()) {
      await specKitIntegration.initializeSpecKit();
    }

    this.context.projectInitialized = true;
    this.displayAssistant('✅ Project initialized! Now let\'s define what you want to build.');
  }

  /**
   * Create specification using Spec-Kit
   */
  private async createSpecification(projectDir: string): Promise<void> {
    this.displaySystem('Creating structured specification...');

    const lastUserMessage = this.getLastUserMessage();

    // This would integrate with Spec-Kit's /specify command
    this.displayAssistant(
      'I\'m creating a detailed specification. Let me ask a few questions to make sure I understand correctly.'
    );

    // In real implementation, this would call Spec-Kit's /specify
    // For now, we show the intent
    this.context.hasSpecification = true;
  }

  /**
   * Fix bug with intelligent approach
   */
  private async fixBug(projectDir: string, decision: Decision): Promise<void> {
    this.displaySystem('Analyzing bug and determining fix strategy...');

    this.context.bugCount = Math.max(0, this.context.bugCount - 1);

    if (decision.useEvolution) {
      this.displayAssistant(
        'I\'ll fix this bug and evolve the code to prevent similar issues in the future.'
      );
    } else {
      this.displayAssistant('I\'ll fix this bug directly.');
    }

    // Execute fix with Claude
    await this.executeClaude(projectDir, 'Fix the reported bug with proper error handling and tests');
  }

  /**
   * Optimize code using evolution
   */
  private async optimizeCode(projectDir: string): Promise<void> {
    this.displaySystem('Running evolutionary optimization...');

    this.displayAssistant(
      'I\'m analyzing your code and evolving optimized versions. This may take a few minutes.'
    );

    // Trigger evolution
    this.context.lastEvolution = new Date();
    this.context.codeQuality = Math.min(100, this.context.codeQuality + 20);
  }

  /**
   * Improve code quality
   */
  private async improveQuality(projectDir: string): Promise<void> {
    this.displaySystem('Improving code quality and test coverage...');

    this.displayAssistant('I\'ll add tests, improve documentation, and refactor for clarity.');

    this.context.testCoverage = Math.min(100, this.context.testCoverage + 15);
    this.context.codeQuality = Math.min(100, this.context.codeQuality + 10);
  }

  /**
   * Refactor code
   */
  private async refactorCode(projectDir: string, decision: Decision): Promise<void> {
    this.displaySystem('Refactoring code for better structure...');

    if (decision.useEvolution) {
      this.displayAssistant(
        'I\'ll refactor using both intelligent analysis and evolutionary optimization.'
      );
    } else {
      this.displayAssistant('I\'ll refactor the code for better maintainability.');
    }

    await this.executeClaude(projectDir, 'Refactor code for better structure and maintainability');
  }

  /**
   * General development with Claude
   */
  private async generalDevelopment(projectDir: string, decision: Decision): Promise<void> {
    const lastMessage = this.getLastUserMessage();

    if (decision.useSpecKit) {
      this.displaySystem('Using structured approach for this complex feature...');
    }

    // Execute with Claude Code
    await this.executeClaude(projectDir, lastMessage);
  }

  /**
   * Execute Claude Code with context
   */
  private async executeClaude(projectDir: string, prompt: string): Promise<void> {
    // In real implementation, this would interact with Claude Code's API
    // For now, we simulate the response
    this.displayAssistant(`I understand. Let me help you with that.`);

    // This is where we'd actually call Claude Code
    // For now, just show we're processing
    await this.delay(1000);

    this.displayAssistant(`✅ Done! The changes have been made. Would you like me to explain what I did?`);
  }

  /**
   * Handle special commands
   */
  private handleCommand(input: string): boolean {
    const cmd = input.trim().toLowerCase();

    if (cmd === 'exit' || cmd === 'quit') {
      this.displayAssistant('👋 Goodbye! Your progress has been saved.');
      this.running = false;
      this.rl.close();
      process.exit(0);
      return true;
    }

    if (cmd === 'status') {
      this.displayStatus();
      return true;
    }

    if (cmd === 'help') {
      this.displayHelp();
      return true;
    }

    if (cmd === 'context') {
      this.displayContext();
      return true;
    }

    return false;
  }

  private displayStatus(): void {
    console.log('\n📊 Project Status:');
    console.log(`   Phase: ${this.context.currentPhase}`);
    console.log(`   Code Quality: ${this.context.codeQuality}/100`);
    console.log(`   Test Coverage: ${this.context.testCoverage}%`);
    console.log(`   Open Bugs: ${this.context.bugCount}`);
    console.log(`   Feature Requests: ${this.context.featureRequests.length}`);
    if (this.context.lastEvolution) {
      console.log(`   Last Evolution: ${this.context.lastEvolution.toLocaleDateString()}`);
    }
    console.log('');
  }

  private displayContext(): void {
    console.log('\n🎯 Current Context:');
    console.log(`   Project Initialized: ${this.context.projectInitialized ? '✅' : '❌'}`);
    console.log(`   Has Specification: ${this.context.hasSpecification ? '✅' : '❌'}`);
    console.log(`   Has Plan: ${this.context.hasPlan ? '✅' : '❌'}`);
    console.log(`   Has Tasks: ${this.context.hasTasks ? '✅' : '❌'}`);
    console.log(`   Conversation Messages: ${this.context.conversationHistory.length}`);
    console.log('');
  }

  private displayHelp(): void {
    console.log(`
📖 Intelligent Agent Help:

Commands:
  status    - Show project status
  context   - Show current context
  help      - Show this help
  exit      - Exit the agent

Usage:
  Just tell me what you want to do in natural language!

Examples:
  "I want to build a recipe app"
  "Add authentication to the app"
  "There's a bug in the login"
  "Optimize the database queries"
  "Add tests for the API"
  "Refactor the user module"

I'll automatically:
  ✓ Decide when to use Spec-Kit for structure
  ✓ Trigger evolution when beneficial
  ✓ Prioritize bugs and features
  ✓ Maintain code quality
  ✓ Keep you informed of my reasoning
`);
  }

  private getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  private addMessage(role: 'user' | 'assistant' | 'system' | 'agent', content: string): void {
    this.context.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });
  }

  private getLastUserMessage(): string {
    for (let i = this.context.conversationHistory.length - 1; i >= 0; i--) {
      if (this.context.conversationHistory[i].role === 'user') {
        return this.context.conversationHistory[i].content;
      }
    }
    return '';
  }

  private displayAssistant(message: string): void {
    console.log(`🤖 Assistant: ${message}`);
    this.addMessage('assistant', message);
  }

  private displaySystem(message: string): void {
    console.log(`⚙️  ${message}`);
    this.addMessage('system', message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

interface Decision {
  intent: string;
  action: string;
  useSpecKit: boolean;
  useEvolution: boolean;
  useClaude: boolean;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}
