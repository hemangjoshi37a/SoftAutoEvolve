import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ConversationManager } from './conversation-manager.js';
import { integrationManager } from '../integrations/integration-manager.js';
import { specKitIntegration } from '../integrations/spec-kit-integration.js';

export class WorkflowOrchestrator {
  private conversation: ConversationManager;
  private projectDir: string;

  constructor(conversation: ConversationManager, projectDir: string) {
    this.conversation = conversation;
    this.projectDir = projectDir;
  }

  public async executeFullWorkflow(): Promise<void> {
    try {
      // Step 1: Ensure project is initialized
      await this.initializeProject();

      // Step 2: Gather and refine requirements
      const { description, technicalPreferences } =
        await this.conversation.refineRequirements();

      // Step 3: Generate constitution automatically
      this.conversation.displaySystem('Creating project principles...');
      await this.generateConstitution();

      // Step 4: Generate specification automatically
      this.conversation.displaySystem('Generating detailed specification...');
      await this.generateSpecification(description);

      // Step 5: Generate plan automatically
      this.conversation.displaySystem('Creating technical implementation plan...');
      const planSummary = await this.generatePlan(technicalPreferences);

      // Step 6: Confirm with user
      const approved = await this.conversation.confirmPlan(planSummary);
      if (!approved) {
        this.conversation.displayAssistant(
          'Let me refine the plan based on your feedback...'
        );
        // Recursively refine
        await this.executeFullWorkflow();
        return;
      }

      // Step 7: Generate tasks automatically
      this.conversation.displaySystem('Breaking down into actionable tasks...');
      await this.generateTasks();

      // Step 8: Implement
      this.conversation.updatePhase('implementing');
      this.conversation.displayAssistant(
        'Great! I\'ll start implementing now. This may take a few minutes...'
      );

      await this.implement();

      // Step 9: Complete
      this.conversation.updatePhase('completed');
      this.conversation.displayAssistant(
        '🎉 Your project is ready! Check out the generated files in your project directory.'
      );

      this.displayProjectSummary();
    } catch (error: any) {
      console.error('\n❌ Error during workflow execution:', error.message);
      this.conversation.displayAssistant(
        'I encountered an issue. Would you like me to try again or make some adjustments?'
      );
    }
  }

  private async initializeProject(): Promise<void> {
    if (!specKitIntegration.isSpecKitInitialized()) {
      this.conversation.displaySystem('Initializing project structure...');

      try {
        await specKitIntegration.initializeSpecKit();
        this.conversation.displaySystem('✅ Project initialized');
      } catch (error: any) {
        throw new Error(`Failed to initialize project: ${error.message}`);
      }
    }
  }

  private async generateConstitution(): Promise<void> {
    const constitutionPrompt = `Create principles focused on:
- Code quality and maintainability
- User experience and accessibility
- Performance and scalability
- Security and privacy
- Testing and documentation
- Clear, readable code that is easy to understand and modify`;

    await this.executeClaudeCommand(`/constitution ${constitutionPrompt}`);
  }

  private async generateSpecification(description: string): Promise<void> {
    await this.executeClaudeCommand(`/specify ${description}`);
  }

  private async generatePlan(technicalPreferences: string): Promise<string> {
    await this.executeClaudeCommand(`/plan ${technicalPreferences}`);

    // Read the generated plan
    const tasksDir = specKitIntegration.getTasksDirectory();
    if (tasksDir) {
      const planPath = path.join(tasksDir, 'plan.md');
      if (fs.existsSync(planPath)) {
        const planContent = fs.readFileSync(planPath, 'utf-8');
        return this.extractPlanSummary(planContent);
      }
    }

    return 'Plan generated successfully. Ready to proceed with implementation.';
  }

  private extractPlanSummary(planContent: string): string {
    // Extract first few sections for summary
    const lines = planContent.split('\n');
    const summaryLines: string[] = [];
    let count = 0;

    for (const line of lines) {
      if (line.startsWith('#') || line.trim().length > 0) {
        summaryLines.push(line);
        count++;
      }
      if (count > 20) break; // Limit summary length
    }

    return summaryLines.join('\n');
  }

  private async generateTasks(): Promise<void> {
    await this.executeClaudeCommand('/tasks');
  }

  private async implement(): Promise<void> {
    // Show progress during implementation
    this.conversation.displayProgress(0, 100, 'Starting implementation...');

    await this.executeClaudeCommand('/implement', true, (output: string) => {
      // Parse output for progress updates
      if (output.includes('Task') || output.includes('Step')) {
        const progress = this.estimateProgress(output);
        this.conversation.displayProgress(progress, 100, 'Implementing features...');
      }
    });

    this.conversation.displayProgress(100, 100, 'Implementation complete!');
  }

  private estimateProgress(output: string): number {
    // Simple heuristic to estimate progress
    const taskMatch = output.match(/Task (\d+) of (\d+)/i);
    if (taskMatch) {
      const current = parseInt(taskMatch[1], 10);
      const total = parseInt(taskMatch[2], 10);
      return Math.round((current / total) * 100);
    }
    return 50; // Default mid-progress
  }

  private async executeClaudeCommand(
    command: string,
    showProgress: boolean = false,
    onOutput?: (output: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // We need to write the command to a file and have Claude execute it
      const commandFile = path.join(this.projectDir, '.claude-command.tmp');
      fs.writeFileSync(commandFile, command);

      // Launch Claude in non-interactive mode with the command
      const claude = spawn('claude', ['--non-interactive', commandFile], {
        cwd: this.projectDir,
        stdio: showProgress ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'ignore', 'ignore'],
      });

      let output = '';

      if (showProgress && claude.stdout) {
        claude.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          if (onOutput) {
            onOutput(text);
          }
        });
      }

      claude.on('close', (code) => {
        // Clean up temp file
        if (fs.existsSync(commandFile)) {
          fs.unlinkSync(commandFile);
        }

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Claude command failed with code ${code}`));
        }
      });

      claude.on('error', (error) => {
        reject(new Error(`Failed to execute Claude: ${error.message}`));
      });
    });
  }

  private displayProjectSummary(): void {
    console.log('\n' + '═'.repeat(80));
    console.log('📦 Project Summary');
    console.log('═'.repeat(80));

    // List generated files
    const specifyDir = path.join(this.projectDir, '.specify');
    if (fs.existsSync(specifyDir)) {
      console.log('\n📁 Generated Files:');

      // Find spec directory
      const specsDir = path.join(specifyDir, 'specs');
      if (fs.existsSync(specsDir)) {
        const features = fs.readdirSync(specsDir);
        features.forEach((feature) => {
          const featurePath = path.join(specsDir, feature);
          if (fs.statSync(featurePath).isDirectory()) {
            console.log(`\n   Feature: ${feature}`);
            const files = fs.readdirSync(featurePath);
            files.forEach((file) => {
              console.log(`      ✓ ${file}`);
            });
          }
        });
      }
    }

    // List implementation files
    const srcFiles = this.findImplementationFiles(this.projectDir);
    if (srcFiles.length > 0) {
      console.log('\n📝 Implementation Files:');
      srcFiles.forEach((file) => {
        console.log(`   ✓ ${path.relative(this.projectDir, file)}`);
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Review the generated code');
    console.log('   2. Test the application');
    console.log('   3. Make any necessary adjustments');
    console.log('   4. Deploy when ready!');
    console.log('\n' + '═'.repeat(80));
  }

  private findImplementationFiles(dir: string): string[] {
    const files: string[] = [];
    const excludeDirs = ['.specify', '.claude', 'node_modules', '.git'];

    const scan = (currentDir: string) => {
      try {
        const entries = fs.readdirSync(currentDir);
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!excludeDirs.includes(entry) && !entry.startsWith('.')) {
              scan(fullPath);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(entry);
            if (
              [
                '.js',
                '.ts',
                '.jsx',
                '.tsx',
                '.py',
                '.html',
                '.css',
                '.vue',
                '.svelte',
              ].includes(ext)
            ) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };

    scan(dir);
    return files;
  }
}
