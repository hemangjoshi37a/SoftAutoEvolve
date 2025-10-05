import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config/config.js';

export interface ShinkaEvolveConfig {
  shinkaPath?: string;
  pythonPath?: string;
  uvPath?: string;
}

export interface EvolutionConfig {
  task_sys_msg?: string;
  num_generations?: number;
  max_parallel_jobs?: number;
  llm_models?: string[];
  language?: string;
  init_program_path?: string;
  eval_program_path?: string;
  results_dir?: string;
}

export class ShinkaEvolveIntegration {
  private shinkaPath: string;
  private pythonPath: string;
  private uvPath: string;
  private isAvailable: boolean = false;
  private isInstalled: boolean = false;

  constructor(private customConfig: ShinkaEvolveConfig = {}) {
    this.shinkaPath = customConfig.shinkaPath || config.shinkaEvolvePath;
    this.pythonPath = customConfig.pythonPath || config.pythonPath;
    this.uvPath = customConfig.uvPath || config.uvPath;
    this.checkAvailability();
  }

  private checkAvailability(): void {
    try {
      // First check if shinka commands are available in PATH
      try {
        execSync('shinka_launch --help', { encoding: 'utf8', stdio: 'pipe' });
        this.isAvailable = true;
        this.isInstalled = true;
        return;
      } catch {
        // Not in PATH, continue checking
      }

      // Check if we have the source and can potentially install it
      if (
        this.shinkaPath &&
        fs.existsSync(path.join(this.shinkaPath, 'pyproject.toml'))
      ) {
        this.isAvailable = true;
        this.isInstalled = false;
      } else {
        this.isAvailable = false;
        this.isInstalled = false;
      }
    } catch (error) {
      this.isAvailable = false;
      this.isInstalled = false;
    }
  }

  public isShinkaAvailable(): boolean {
    return this.isAvailable;
  }

  public isShinkaInstalled(): boolean {
    return this.isInstalled;
  }

  public getInstallationInstructions(): string {
    if (this.shinkaPath && fs.existsSync(this.shinkaPath)) {
      return `
ShinkaEvolve is available but not installed. To enable evolutionary algorithm capabilities:

1. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

2. Install ShinkaEvolve:
   cd ${this.shinkaPath}
   uv venv --python 3.11
   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
   uv pip install -e .

3. Restart to detect the new installation.

ShinkaEvolve provides evolutionary algorithm capabilities for:
- Automated code optimization and improvement
- Scientific discovery through program evolution
- Multi-objective optimization with LLM-guided mutations
- Parallel evaluation and evolutionary islands
- Sample-efficient program evolution
`;
    } else {
      return `
ShinkaEvolve repository not found. To enable evolutionary algorithm capabilities:

1. Clone ShinkaEvolve repository:
   git clone https://github.com/SakanaAI/ShinkaEvolve ${this.shinkaPath}

2. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

3. Install ShinkaEvolve:
   cd ${this.shinkaPath}
   uv venv --python 3.11
   source .venv/bin/activate
   uv pip install -e .

4. Update your .env file with the correct path:
   SHINKA_EVOLVE_PATH=${this.shinkaPath}

5. Restart to detect the new installation.
`;
    }
  }

  public async runEvolution(evolutionConfig: EvolutionConfig): Promise<string> {
    if (!this.isAvailable) {
      throw new Error(
        'ShinkaEvolve not available. ' + this.getInstallationInstructions()
      );
    }

    if (!this.isInstalled) {
      throw new Error(
        'ShinkaEvolve not installed. ' + this.getInstallationInstructions()
      );
    }

    return this.executeShinkaCommand(evolutionConfig);
  }

  public async runEvolutionWithSpecKit(
    specKitTasksDir: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      throw new Error(
        'ShinkaEvolve not available. ' + this.getInstallationInstructions()
      );
    }

    // Create evaluation script that integrates with spec-kit tasks
    const evalScript = this.generateSpecKitEvaluationScript(specKitTasksDir);
    const evalPath = path.join(process.cwd(), 'evaluate_spec_tasks.py');
    fs.writeFileSync(evalPath, evalScript);

    const finalConfig: EvolutionConfig = {
      eval_program_path: evalPath,
      task_sys_msg:
        'Optimize implementation to complete spec-kit tasks efficiently',
      num_generations:
        evolutionConfig.num_generations || config.defaultNumGenerations,
      max_parallel_jobs:
        evolutionConfig.max_parallel_jobs || config.defaultMaxParallelJobs,
      llm_models: evolutionConfig.llm_models || config.defaultLlmModels,
      language: evolutionConfig.language || 'python',
      results_dir: evolutionConfig.results_dir || './shinka_results',
      ...evolutionConfig,
    };

    return this.runEvolution(finalConfig);
  }

  private generateSpecKitEvaluationScript(tasksDir: string): string {
    return `#!/usr/bin/env python3
"""
SoftAutoEvolve - Spec-Kit Integration Evaluator
Evaluates evolved programs against Spec-Kit tasks
"""

import sys
import os
import subprocess
import json
from pathlib import Path
from typing import Dict, Any

def main(program_path: str, results_dir: str) -> Dict[str, Any]:
    """Evaluate a program by running it against spec-kit tasks"""

    # Read tasks from spec-kit directory
    tasks_file = Path("${tasksDir}") / "tasks.md"
    if not tasks_file.exists():
        return {
            "combined_score": 0.0,
            "text_feedback": "No tasks.md found in ${tasksDir}"
        }

    try:
        # Run the program and capture results
        result = subprocess.run(
            [sys.executable, program_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        # Score based on successful execution and output quality
        score = 0.0
        feedback = ""

        if result.returncode == 0:
            score += 50.0  # Base score for successful execution
            output_quality = evaluate_output_quality(result.stdout)
            score += output_quality
            feedback = f"Program executed successfully. Output quality: {output_quality}/50"
        else:
            feedback = f"Program failed with return code {result.returncode}: {result.stderr[:200]}"

        metrics = {
            "combined_score": float(score),
            "public": {
                "execution_success": result.returncode == 0,
                "output_length": len(result.stdout)
            },
            "private": {
                "stdout": result.stdout[:1000],
                "stderr": result.stderr[:1000]
            },
            "text_feedback": feedback
        }

        return metrics

    except subprocess.TimeoutExpired:
        return {
            "combined_score": 0.0,
            "text_feedback": "Program execution timed out after 60 seconds"
        }
    except Exception as e:
        return {
            "combined_score": 0.0,
            "text_feedback": f"Evaluation error: {str(e)}"
        }

def evaluate_output_quality(output: str) -> float:
    """Simple heuristic to evaluate output quality"""
    if not output.strip():
        return 0.0

    score = 0.0

    # Length bonus (up to 20 points)
    score += min(len(output.strip()) / 100, 20.0)

    # Structure bonus (up to 15 points)
    if "\\n" in output:
        score += 10.0
    if any(keyword in output.lower() for keyword in ["error", "warning", "info", "success"]):
        score += 5.0

    # Content quality bonus (up to 15 points)
    lines = output.strip().split("\\n")
    if len(lines) > 1:
        score += 10.0
    if len([line for line in lines if len(line.strip()) > 10]) > 0:
        score += 5.0

    return min(score, 50.0)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(
        description="Evaluate program against Spec-Kit tasks"
    )
    parser.add_argument("program_path", help="Path to program to evaluate")
    parser.add_argument("results_dir", help="Directory to store results")
    args = parser.parse_args()

    result = main(args.program_path, args.results_dir)

    # Save results
    os.makedirs(args.results_dir, exist_ok=True)
    with open(os.path.join(args.results_dir, "metrics.json"), "w") as f:
        json.dump(result, f, indent=2)

    print(f"Score: {result['combined_score']}")
    print(f"Feedback: {result['text_feedback']}")
`;
  }

  private async executeShinkaCommand(
    evolutionConfig: EvolutionConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build command arguments
      const args = ['shinka_launch'];

      if (evolutionConfig.eval_program_path) {
        args.push(`cluster.eval_program_path=${evolutionConfig.eval_program_path}`);
      }

      if (evolutionConfig.init_program_path) {
        args.push(`evolution.init_program_path=${evolutionConfig.init_program_path}`);
      }

      if (evolutionConfig.num_generations) {
        args.push(`evolution.num_generations=${evolutionConfig.num_generations}`);
      }

      if (evolutionConfig.max_parallel_jobs) {
        args.push(`evolution.max_parallel_jobs=${evolutionConfig.max_parallel_jobs}`);
      }

      if (evolutionConfig.llm_models) {
        const models = evolutionConfig.llm_models.map((m) => `"${m}"`).join(',');
        args.push(`evolution.llm_models=[${models}]`);
      }

      if (evolutionConfig.results_dir) {
        args.push(`evolution.results_dir=${evolutionConfig.results_dir}`);
      }

      const child = spawn('bash', ['-c', args.join(' ')], {
        cwd: this.shinkaPath,
        stdio: config.verbose ? 'inherit' : ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      if (!config.verbose) {
        child.stdout?.on('data', (data) => {
          output += data.toString();
        });

        child.stderr?.on('data', (data) => {
          error += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output || 'Evolution completed successfully');
        } else {
          reject(
            new Error(
              `ShinkaEvolve command failed with code ${code}: ${error}`
            )
          );
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute ShinkaEvolve: ${err.message}`));
      });
    });
  }

  public getStatus(): {
    available: boolean;
    installed: boolean;
    path: string;
    message: string;
  } {
    let message = '';

    if (!this.isAvailable) {
      message = 'ShinkaEvolve not found - evolutionary algorithms unavailable';
    } else if (!this.isInstalled) {
      message = 'ShinkaEvolve found but not installed - run installation';
    } else {
      message = 'ShinkaEvolve integration ready';
    }

    return {
      available: this.isAvailable,
      installed: this.isInstalled,
      path: this.shinkaPath,
      message,
    };
  }
}

export const shinkaEvolveIntegration = new ShinkaEvolveIntegration();
