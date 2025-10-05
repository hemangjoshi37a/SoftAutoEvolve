import {
  claudeCodeIntegration,
  ClaudeCodeIntegration,
} from './claude-code-integration.js';
import {
  specKitIntegration,
  SpecKitIntegration,
} from './spec-kit-integration.js';
import {
  shinkaEvolveIntegration,
  ShinkaEvolveIntegration,
  EvolutionConfig,
} from './shinka-evolve-integration.js';

export interface IntegrationStatus {
  claudeCode: {
    available: boolean;
    installed: boolean;
    path: string;
    message: string;
  };
  specKit: {
    available: boolean;
    initialized: boolean;
    path: string;
    message: string;
    commands: string[];
  };
  shinkaEvolve: {
    available: boolean;
    installed: boolean;
    path: string;
    message: string;
  };
  combined: {
    canUseFullWorkflow: boolean;
    canUseSpecKitWorkflow: boolean;
    canUseEvolution: boolean;
    message: string;
  };
}

export class IntegrationManager {
  private claudeCode: ClaudeCodeIntegration;
  private specKit: SpecKitIntegration;
  private shinkaEvolve: ShinkaEvolveIntegration;

  constructor() {
    this.claudeCode = claudeCodeIntegration;
    this.specKit = specKitIntegration;
    this.shinkaEvolve = shinkaEvolveIntegration;
  }

  public getStatus(): IntegrationStatus {
    const claudeStatus = this.claudeCode.getStatus();
    const specKitStatus = this.specKit.getStatus();
    const shinkaStatus = this.shinkaEvolve.getStatus();

    const canUseFullWorkflow =
      claudeStatus.available &&
      specKitStatus.available &&
      shinkaStatus.available &&
      shinkaStatus.installed;

    const canUseSpecKitWorkflow =
      claudeStatus.available && specKitStatus.available;

    const canUseEvolution = shinkaStatus.available && shinkaStatus.installed;

    let combinedMessage = '';
    if (canUseFullWorkflow) {
      combinedMessage =
        '✅ Full workflow available: Claude Code → Spec-Kit → ShinkaEvolve';
    } else if (canUseSpecKitWorkflow) {
      combinedMessage =
        '⚠️  Partial workflow: Claude Code → Spec-Kit (ShinkaEvolve unavailable)';
    } else if (claudeStatus.available) {
      combinedMessage =
        '⚠️  Limited workflow: Claude Code only (Spec-Kit & ShinkaEvolve unavailable)';
    } else {
      combinedMessage =
        '❌ Enhanced workflows unavailable - install required components';
    }

    return {
      claudeCode: claudeStatus,
      specKit: specKitStatus,
      shinkaEvolve: shinkaStatus,
      combined: {
        canUseFullWorkflow,
        canUseSpecKitWorkflow,
        canUseEvolution,
        message: combinedMessage,
      },
    };
  }

  public getInstallationInstructions(): string {
    const status = this.getStatus();
    let instructions = '';

    if (!status.claudeCode.available || !status.claudeCode.installed) {
      instructions += '\n' + this.claudeCode.getInstallationInstructions();
      instructions += '\n' + '='.repeat(80) + '\n';
    }

    if (!status.specKit.available) {
      instructions += '\n' + this.specKit.getInstallationInstructions();
      instructions += '\n' + '='.repeat(80) + '\n';
    }

    if (!status.shinkaEvolve.available || !status.shinkaEvolve.installed) {
      instructions += '\n' + this.shinkaEvolve.getInstallationInstructions();
      instructions += '\n' + '='.repeat(80) + '\n';
    }

    if (status.combined.canUseFullWorkflow) {
      instructions =
        '✅ All integrations are ready! You can use the full enhanced workflow.';
    } else if (instructions) {
      instructions =
        '📦 Enhanced capabilities available after installation:\n' +
        instructions;
    }

    return instructions.trim();
  }

  /**
   * Run the complete workflow:
   * 1. Use Spec-Kit to generate constitution, spec, plan, and tasks
   * 2. Use ShinkaEvolve to optimize implementation
   * 3. Use Claude Code for final execution
   */
  public async runFullWorkflow(
    projectDescription: string,
    technicalRequirements: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<{
    constitution?: string;
    specification?: string;
    plan?: string;
    tasks?: string;
    evolutionResults?: string;
    implementation?: string;
    status: string;
  }> {
    const status = this.getStatus();

    if (!status.combined.canUseFullWorkflow) {
      throw new Error(
        'Full workflow requires all integrations. ' +
          this.getInstallationInstructions()
      );
    }

    console.log('\n🚀 Starting SoftAutoEvolve Full Workflow...\n');

    try {
      const results: any = {
        status: 'in_progress',
      };

      // Step 1: Initialize Spec-Kit if not already done
      if (!this.specKit.isSpecKitInitialized()) {
        console.log('📦 Initializing Spec-Kit in current directory...');
        await this.specKit.initializeSpecKit();
        console.log('✅ Spec-Kit initialized\n');
      }

      // Step 2: Launch Claude Code for constitution, spec, plan, tasks
      console.log(
        '🎯 Launching Claude Code for Spec-Kit workflow...'
      );
      console.log(
        '   Please use the following commands in Claude Code:'
      );
      console.log('   1. /constitution - Create project principles');
      console.log('   2. /specify - ' + projectDescription);
      console.log('   3. /plan - ' + technicalRequirements);
      console.log('   4. /tasks - Generate task list');
      console.log('   5. Exit Claude Code to continue with evolution\n');

      await this.claudeCode.launchClaude();

      // Step 3: Get tasks directory
      const tasksDir = this.specKit.getTasksDirectory();
      if (!tasksDir) {
        throw new Error('No tasks directory found. Did you run /tasks?');
      }

      console.log('\n✅ Spec-Kit workflow completed\n');

      // Step 4: Run evolutionary optimization
      if (evolutionConfig && Object.keys(evolutionConfig).length > 0) {
        console.log('🧬 Running evolutionary optimization...');
        try {
          results.evolutionResults =
            await this.shinkaEvolve.runEvolutionWithSpecKit(
              tasksDir,
              evolutionConfig
            );
          console.log('✅ Evolution completed\n');
        } catch (error) {
          console.warn(
            '⚠️  Evolutionary optimization failed, continuing without it'
          );
          console.warn(error);
        }
      }

      // Step 5: Launch Claude Code for implementation
      console.log('⚙️  Launching Claude Code for implementation...');
      console.log('   Use: /implement\n');

      await this.claudeCode.launchClaude();

      results.status = 'completed';
      console.log('\n🎉 Full workflow completed successfully!\n');

      return results;
    } catch (error: any) {
      throw new Error(`Full workflow failed: ${error.message}`);
    }
  }

  /**
   * Run spec-kit workflow only (no evolution)
   */
  public async runSpecKitWorkflow(): Promise<void> {
    const status = this.getStatus();

    if (!status.combined.canUseSpecKitWorkflow) {
      throw new Error(
        'Spec-Kit workflow requires Claude Code and Spec-Kit. ' +
          this.getInstallationInstructions()
      );
    }

    console.log('\n🚀 Starting Spec-Kit Workflow...\n');

    // Initialize Spec-Kit if needed
    if (!this.specKit.isSpecKitInitialized()) {
      console.log('📦 Initializing Spec-Kit...');
      await this.specKit.initializeSpecKit();
      console.log('✅ Spec-Kit initialized\n');
    }

    console.log('🎯 Launching Claude Code with Spec-Kit commands...');
    console.log('   Available commands:');
    this.specKit.getAvailableCommands().forEach((cmd) => {
      console.log(`   ${cmd}`);
    });
    console.log('');

    await this.claudeCode.launchClaude();

    console.log('\n✅ Spec-Kit workflow completed!\n');
  }

  /**
   * Run evolutionary optimization only
   */
  public async runEvolutionOnly(
    initialCodePath: string,
    evaluationScript: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<string> {
    const status = this.getStatus();

    if (!status.combined.canUseEvolution) {
      throw new Error(
        'Evolution requires ShinkaEvolve installation. ' +
          this.shinkaEvolve.getInstallationInstructions()
      );
    }

    console.log('\n🧬 Starting evolutionary optimization...\n');

    const config: EvolutionConfig = {
      init_program_path: initialCodePath,
      eval_program_path: evaluationScript,
      ...evolutionConfig,
    };

    const result = await this.shinkaEvolve.runEvolution(config);

    console.log('\n✅ Evolution completed!\n');
    return result;
  }

  /**
   * Launch Claude Code directly
   */
  public async launchClaudeCode(args: string[] = []): Promise<void> {
    const status = this.getStatus();

    if (!status.claudeCode.available || !status.claudeCode.installed) {
      throw new Error(
        'Claude Code not available. ' +
          this.claudeCode.getInstallationInstructions()
      );
    }

    await this.claudeCode.launchClaude(args);
  }

  /**
   * Check integrations and display status
   */
  public displayStatus(): void {
    const status = this.getStatus();

    console.log('\n' + '='.repeat(80));
    console.log('🔍 SoftAutoEvolve Integration Status');
    console.log('='.repeat(80) + '\n');

    console.log('📦 Claude Code:');
    console.log(`   Status: ${status.claudeCode.message}`);
    console.log(`   Path: ${status.claudeCode.path}`);
    console.log('');

    console.log('📦 Spec-Kit:');
    console.log(`   Status: ${status.specKit.message}`);
    console.log(`   Path: ${status.specKit.path}`);
    if (status.specKit.commands.length > 0) {
      console.log(`   Available commands: ${status.specKit.commands.join(', ')}`);
    }
    console.log('');

    console.log('📦 ShinkaEvolve:');
    console.log(`   Status: ${status.shinkaEvolve.message}`);
    console.log(`   Path: ${status.shinkaEvolve.path}`);
    console.log('');

    console.log('🔗 Combined Status:');
    console.log(`   ${status.combined.message}`);
    console.log('');

    if (
      !status.combined.canUseFullWorkflow &&
      !status.combined.canUseSpecKitWorkflow
    ) {
      console.log('💡 Installation Instructions:');
      console.log(this.getInstallationInstructions());
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Get available commands
   */
  public getAvailableCommands(): {
    command: string;
    description: string;
    available: boolean;
    requirements?: string;
  }[] {
    const status = this.getStatus();

    return [
      {
        command: 'status',
        description: 'Display integration status',
        available: true,
      },
      {
        command: 'launch',
        description: 'Launch Claude Code',
        available: status.claudeCode.available && status.claudeCode.installed,
        requirements:
          status.claudeCode.available && status.claudeCode.installed
            ? undefined
            : 'Requires Claude Code installation',
      },
      {
        command: 'init',
        description: 'Initialize Spec-Kit in current directory',
        available: status.specKit.available,
        requirements: status.specKit.available
          ? undefined
          : 'Requires uv installation',
      },
      {
        command: 'workflow',
        description: 'Run full workflow (Spec-Kit + ShinkaEvolve)',
        available: status.combined.canUseFullWorkflow,
        requirements: status.combined.canUseFullWorkflow
          ? undefined
          : 'Requires all integrations',
      },
      {
        command: 'spec-workflow',
        description: 'Run Spec-Kit workflow only',
        available: status.combined.canUseSpecKitWorkflow,
        requirements: status.combined.canUseSpecKitWorkflow
          ? undefined
          : 'Requires Claude Code and Spec-Kit',
      },
      {
        command: 'evolve',
        description: 'Run evolutionary optimization',
        available: status.combined.canUseEvolution,
        requirements: status.combined.canUseEvolution
          ? undefined
          : 'Requires ShinkaEvolve installation',
      },
    ];
  }
}

export const integrationManager = new IntegrationManager();
