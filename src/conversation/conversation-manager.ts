import * as readline from 'readline';
import { config } from '../config/config.js';

export type WorkflowPhase =
  | 'initial'
  | 'gathering_requirements'
  | 'refining_requirements'
  | 'technical_discussion'
  | 'generating_plan'
  | 'implementing'
  | 'completed';

export interface ConversationState {
  phase: WorkflowPhase;
  projectDescription: string;
  technicalRequirements: string;
  userFeedback: string[];
  currentTask: string;
  history: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export class ConversationManager {
  private state: ConversationState;
  private rl: readline.Interface;

  constructor() {
    this.state = {
      phase: 'initial',
      projectDescription: '',
      technicalRequirements: '',
      userFeedback: [],
      currentTask: '',
      history: [],
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n💬 You: ',
    });
  }

  public getState(): ConversationState {
    return { ...this.state };
  }

  public updatePhase(phase: WorkflowPhase): void {
    this.state.phase = phase;
  }

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.state.history.push({
      role,
      content,
      timestamp: new Date(),
    });
  }

  public async askUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.displayAssistant(question);
      this.rl.question('', (answer) => {
        const trimmedAnswer = answer.trim();
        this.addMessage('user', trimmedAnswer);
        resolve(trimmedAnswer);
      });
    });
  }

  public displayAssistant(message: string): void {
    console.log(`\n🤖 Assistant: ${message}`);
    this.addMessage('assistant', message);
  }

  public displaySystem(message: string): void {
    console.log(`\n⚙️  ${message}`);
    this.addMessage('system', message);
  }

  public displayProgress(current: number, total: number, task: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    console.log(`\n📊 Progress: ${progressBar} ${percentage}%`);
    console.log(`   ${task}`);
  }

  private createProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  public displayThinking(): void {
    process.stdout.write('\n🤔 Thinking');
    let dots = 0;
    const thinkingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      process.stdout.write('\r🤔 Thinking' + '.'.repeat(dots) + '   ');
    }, 500);

    return thinkingInterval as any;
  }

  public stopThinking(interval: any): void {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
  }

  public async start(): Promise<void> {
    this.displayWelcome();
    await this.gatherInitialRequirements();
  }

  private displayWelcome(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                      🧬 SoftAutoEvolve - Conversational Mode                  ║
║                                                                               ║
║     Just tell me what you want to build, and I'll handle the rest!          ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

    console.log('💡 Tips:');
    console.log('   • Describe your project in natural language');
    console.log('   • I\'ll ask clarifying questions as needed');
    console.log('   • You can provide feedback at any time');
    console.log('   • Type "exit" to quit, "help" for assistance');
    console.log('   • Type "status" to see current progress');
  }

  private async gatherInitialRequirements(): Promise<void> {
    this.updatePhase('gathering_requirements');

    const response = await this.askUser(
      'What would you like to build today? Tell me about your project idea.'
    );

    if (response.toLowerCase() === 'exit') {
      this.close();
      return;
    }

    if (response.toLowerCase() === 'help') {
      this.displayHelp();
      await this.gatherInitialRequirements();
      return;
    }

    this.state.projectDescription = response;
    this.displayAssistant('Got it! Let me understand your requirements better.');
  }

  private displayHelp(): void {
    console.log(`
📖 How to Use SoftAutoEvolve Conversational Mode:

1. Describe Your Project
   Just tell me what you want to build in plain English.
   Example: "I want to build a todo app with drag and drop"

2. Answer My Questions
   I'll ask clarifying questions to understand your needs better.

3. Provide Technical Preferences (Optional)
   Tell me about tech stack, frameworks, or specific requirements.

4. Review and Approve
   I'll show you the plan before implementation.

5. Watch It Build
   I'll handle all the implementation automatically.

Commands:
   status  - Show current workflow phase
   back    - Go back to previous step
   skip    - Skip current question
   exit    - Exit conversation
`);
  }

  public async refineRequirements(): Promise<{
    description: string;
    technicalPreferences: string;
  }> {
    this.updatePhase('refining_requirements');

    // Extract key aspects from the description
    const hasUI = this.state.projectDescription.toLowerCase().includes('ui') ||
                  this.state.projectDescription.toLowerCase().includes('interface') ||
                  this.state.projectDescription.toLowerCase().includes('web') ||
                  this.state.projectDescription.toLowerCase().includes('app');

    const hasBackend = this.state.projectDescription.toLowerCase().includes('database') ||
                       this.state.projectDescription.toLowerCase().includes('api') ||
                       this.state.projectDescription.toLowerCase().includes('server');

    // Ask clarifying questions
    const questions: string[] = [];

    if (hasUI) {
      const uiResponse = await this.askUser(
        'What kind of user interface are you thinking about? (e.g., web app, mobile app, desktop app)'
      );
      this.state.userFeedback.push(`UI Type: ${uiResponse}`);
    }

    if (hasBackend) {
      const backendResponse = await this.askUser(
        'Do you have any preferences for the backend technology? (e.g., Node.js, Python, or leave it to me)'
      );
      this.state.userFeedback.push(`Backend: ${backendResponse}`);
    }

    const featuresResponse = await this.askUser(
      'What are the most important features for your users? (List 3-5 key features)'
    );
    this.state.userFeedback.push(`Key Features: ${featuresResponse}`);

    const constraintsResponse = await this.askUser(
      'Any specific constraints or requirements? (e.g., must work offline, needs authentication, or press Enter to skip)'
    );
    if (constraintsResponse.trim()) {
      this.state.userFeedback.push(`Constraints: ${constraintsResponse}`);
    }

    // Build comprehensive description
    const comprehensiveDescription = `
Project: ${this.state.projectDescription}

User Feedback:
${this.state.userFeedback.join('\n')}

Goals:
- Stable and working features
- Appropriate UI/UX for the target users
- Focus on user experience and usability
`.trim();

    // Ask about technical preferences
    this.updatePhase('technical_discussion');

    const techResponse = await this.askUser(
      'Any specific technologies or frameworks you want to use? (or press Enter to let me choose the best fit)'
    );

    this.state.technicalRequirements = techResponse.trim() ||
      'Use modern, stable technologies that best fit the requirements. Prioritize developer experience, performance, and maintainability.';

    return {
      description: comprehensiveDescription,
      technicalPreferences: this.state.technicalRequirements,
    };
  }

  public async confirmPlan(planSummary: string): Promise<boolean> {
    console.log('\n📋 Here\'s what I\'m planning to build:\n');
    console.log('─'.repeat(80));
    console.log(planSummary);
    console.log('─'.repeat(80));

    const confirmation = await this.askUser(
      'Does this look good? (yes/no/modify) - Type "modify" to make changes'
    );

    if (confirmation.toLowerCase().includes('yes') || confirmation.toLowerCase().includes('y')) {
      return true;
    } else if (confirmation.toLowerCase().includes('modify')) {
      const changes = await this.askUser('What would you like to change?');
      this.state.userFeedback.push(`Modifications: ${changes}`);
      return false;
    }

    return false;
  }

  public displayStatus(): void {
    const phaseNames: Record<WorkflowPhase, string> = {
      initial: '🌱 Starting',
      gathering_requirements: '📝 Gathering Requirements',
      refining_requirements: '🔍 Refining Details',
      technical_discussion: '⚙️  Technical Planning',
      generating_plan: '📋 Generating Plan',
      implementing: '🚀 Implementing',
      completed: '✅ Completed',
    };

    console.log('\n📊 Current Status:');
    console.log(`   Phase: ${phaseNames[this.state.phase]}`);
    console.log(`   Description: ${this.state.projectDescription.substring(0, 100)}...`);
    console.log(`   Messages: ${this.state.history.length}`);
  }

  public close(): void {
    console.log('\n👋 Thanks for using SoftAutoEvolve! Your project progress has been saved.');
    this.rl.close();
    process.exit(0);
  }
}
