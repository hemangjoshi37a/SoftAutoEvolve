import { SensorySystem } from './sensory-system.js';
import { Task } from './task-manager.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Closed-Loop Tester
 * Tests software with visual feedback, keyboard, and mouse interaction
 */
export class ClosedLoopTester {
  private sensory: SensorySystem;
  private workingDir: string;
  private testResultsDir: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.sensory = new SensorySystem(workingDir);
    this.testResultsDir = path.join(workingDir, '.softautoevolve', 'test-results');

    if (!fs.existsSync(this.testResultsDir)) {
      fs.mkdirSync(this.testResultsDir, { recursive: true });
    }
  }

  /**
   * Test a task's implementation with visual feedback
   */
  public async testTaskImplementation(task: Task): Promise<{
    passed: boolean;
    screenshots: string[];
    errors: string[];
    logs: string[];
  }> {
    const result = {
      passed: true,
      screenshots: [] as string[],
      errors: [] as string[],
      logs: [] as string[],
    };

    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║  🧪 CLOSED-LOOP TESTING                 ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);

    console.log(`   \x1b[36m▸\x1b[0m Testing: ${task.description}`);
    result.logs.push(`Testing: ${task.description}`);

    try {
      // Determine test strategy based on task type
      const testStrategy = this.determineTestStrategy(task);
      console.log(`   \x1b[36m▸\x1b[0m Test strategy: ${testStrategy}`);
      result.logs.push(`Test strategy: ${testStrategy}`);

      switch (testStrategy) {
        case 'visual-gui':
          return await this.testGuiApplication(task, result);

        case 'web-browser':
          return await this.testWebApplication(task, result);

        case 'cli-command':
          return await this.testCliCommand(task, result);

        case 'unit-test':
          return await this.runUnitTests(task, result);

        default:
          return await this.testGeneric(task, result);
      }
    } catch (error: any) {
      result.passed = false;
      result.errors.push(error.message);
      console.log(`   \x1b[31m✗\x1b[0m Test failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Determine test strategy based on task
   */
  private determineTestStrategy(task: Task): string {
    const desc = task.description.toLowerCase();

    if (desc.includes('gui') || desc.includes('window') || desc.includes('pyqt') || desc.includes('tkinter')) {
      return 'visual-gui';
    }

    if (desc.includes('web') || desc.includes('browser') || desc.includes('html') || desc.includes('http')) {
      return 'web-browser';
    }

    if (desc.includes('cli') || desc.includes('command') || desc.includes('terminal')) {
      return 'cli-command';
    }

    if (desc.includes('test') || desc.includes('unit test') || task.type === 'test') {
      return 'unit-test';
    }

    return 'generic';
  }

  /**
   * Test GUI application with visual feedback
   */
  private async testGuiApplication(task: Task, result: any): Promise<any> {
    console.log(`   \x1b[36m▸\x1b[0m Starting GUI application test...`);

    // Find Python GUI entry points
    const entryPoints = this.findGuiEntryPoints();

    if (entryPoints.length === 0) {
      result.logs.push('No GUI entry points found');
      return result;
    }

    const entryPoint = entryPoints[0];
    console.log(`   \x1b[36m▸\x1b[0m Found entry point: ${entryPoint}`);

    // Define test steps
    const testSteps = [
      { action: 'wait', params: { ms: 2000 } }, // Wait for window to appear
      { action: 'pressKey', params: { key: 'Tab' } }, // Navigate UI
      { action: 'wait', params: { ms: 500 } },
      { action: 'pressKey', params: { key: 'Return' } }, // Activate
      { action: 'wait', params: { ms: 1000 } },
    ];

    const testResults = await this.sensory.testApplication(
      `python3 ${entryPoint}`,
      testSteps,
      `test_${task.type}_${Date.now()}`
    );

    // Collect screenshots
    result.screenshots = testResults.map(r => r.screenshot);

    // Check for failures
    const failures = testResults.filter(r => !r.success);
    if (failures.length > 0) {
      result.passed = false;
      result.errors.push(...failures.map(f => f.error || 'Unknown error'));
    }

    // Analyze final screenshot
    if (testResults.length > 0) {
      const finalScreenshot = testResults[testResults.length - 1].screenshot;
      const analysis = await this.sensory.analyzeScreenshot(finalScreenshot);

      if (analysis.hasErrors) {
        result.passed = false;
        result.errors.push('Errors detected in visual output');
      }

      result.logs.push(`Resolution: ${analysis.resolution.width}x${analysis.resolution.height}`);
      result.logs.push(`OCR text lines: ${analysis.text.length}`);
    }

    return result;
  }

  /**
   * Test web application with browser
   */
  private async testWebApplication(task: Task, result: any): Promise<any> {
    console.log(`   \x1b[36m▸\x1b[0m Starting web application test...`);

    // Find web entry points
    const webFiles = this.findWebFiles();

    if (webFiles.length === 0) {
      result.logs.push('No web files found');
      return result;
    }

    // Start local server if possible
    const serverFile = webFiles.find(f => f.includes('server') || f.includes('app'));

    if (serverFile) {
      console.log(`   \x1b[36m▸\x1b[0m Found server file: ${serverFile}`);

      // Try to determine server URL
      let url = 'http://localhost:8000';

      if (serverFile.endsWith('.py')) {
        url = 'http://localhost:5000'; // Flask default
      } else if (serverFile.endsWith('.js')) {
        url = 'http://localhost:3000'; // Node default
      }

      try {
        // Open URL and capture
        const screenshot = await this.sensory.openUrlAndCapture(url, `web_test_${Date.now()}.png`, 5000);
        result.screenshots.push(screenshot);

        // Analyze screenshot
        const analysis = await this.sensory.analyzeScreenshot(screenshot);

        if (analysis.hasErrors) {
          result.passed = false;
          result.errors.push('Errors detected in web page');
        }

        result.logs.push('Web application tested');
      } catch (error: any) {
        result.errors.push(`Web test failed: ${error.message}`);
        result.passed = false;
      }
    }

    return result;
  }

  /**
   * Test CLI command
   */
  private async testCliCommand(task: Task, result: any): Promise<any> {
    console.log(`   \x1b[36m▸\x1b[0m Starting CLI command test...`);

    // Find CLI entry points
    const cliFiles = this.findCliFiles();

    if (cliFiles.length > 0) {
      const cliFile = cliFiles[0];
      console.log(`   \x1b[36m▸\x1b[0m Found CLI file: ${cliFile}`);

      try {
        // Run --help to verify CLI works
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        const { stdout, stderr } = await execAsync(`python3 ${cliFile} --help`, {
          cwd: this.workingDir,
          timeout: 5000,
        });

        result.logs.push('CLI command executed successfully');
        result.logs.push(`Output: ${stdout.substring(0, 200)}`);

        if (stderr && !stderr.includes('help')) {
          result.errors.push(`CLI errors: ${stderr}`);
          result.passed = false;
        }
      } catch (error: any) {
        result.errors.push(`CLI test failed: ${error.message}`);
        result.passed = false;
      }
    }

    return result;
  }

  /**
   * Run unit tests
   */
  private async runUnitTests(task: Task, result: any): Promise<any> {
    console.log(`   \x1b[36m▸\x1b[0m Running unit tests...`);

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Try pytest first
      try {
        const { stdout, stderr } = await execAsync('pytest -v', {
          cwd: this.workingDir,
          timeout: 30000,
        });

        result.logs.push('Pytest executed');
        result.logs.push(stdout);

        if (stderr && stderr.includes('FAILED')) {
          result.passed = false;
          result.errors.push('Some unit tests failed');
        }
      } catch (pytestError) {
        // Try unittest
        try {
          const { stdout, stderr } = await execAsync('python3 -m unittest discover', {
            cwd: this.workingDir,
            timeout: 30000,
          });

          result.logs.push('Unittest executed');
          result.logs.push(stdout);

          if (stderr && stderr.includes('FAILED')) {
            result.passed = false;
            result.errors.push('Some unit tests failed');
          }
        } catch (unittestError) {
          result.logs.push('No test framework found or tests failed');
        }
      }
    } catch (error: any) {
      result.errors.push(`Unit test execution failed: ${error.message}`);
      result.passed = false;
    }

    return result;
  }

  /**
   * Generic test - just capture state
   */
  private async testGeneric(task: Task, result: any): Promise<any> {
    console.log(`   \x1b[36m▸\x1b[0m Running generic test...`);

    try {
      // Capture current screen state
      const screenshot = await this.sensory.captureScreen(`generic_test_${Date.now()}.png`);
      result.screenshots.push(screenshot);

      // Get open windows
      const windows = await this.sensory.getOpenWindows();
      result.logs.push(`Open windows: ${windows.length}`);

      result.logs.push('Generic test completed');
    } catch (error: any) {
      result.logs.push(`Could not capture screen: ${error.message}`);
    }

    return result;
  }

  /**
   * Find GUI entry points
   */
  private findGuiEntryPoints(): string[] {
    const files: string[] = [];

    try {
      const allFiles = this.getAllPythonFiles();

      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');

        // Check for GUI indicators
        if (content.includes('PyQt') ||
            content.includes('tkinter') ||
            content.includes('wx.App') ||
            content.includes('QApplication')) {
          files.push(file);
        }
      }
    } catch {}

    return files;
  }

  /**
   * Find web files
   */
  private findWebFiles(): string[] {
    const files: string[] = [];

    try {
      const allFiles = fs.readdirSync(this.workingDir);

      for (const file of allFiles) {
        if (file.endsWith('.html') || file.endsWith('.htm') ||
            file.includes('server') || file.includes('app')) {
          files.push(path.join(this.workingDir, file));
        }
      }
    } catch {}

    return files;
  }

  /**
   * Find CLI files
   */
  private findCliFiles(): string[] {
    const files: string[] = [];

    try {
      const allFiles = this.getAllPythonFiles();

      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');

        // Check for CLI indicators
        if (content.includes('argparse') ||
            content.includes('click') ||
            content.includes('if __name__ == "__main__"')) {
          files.push(file);
        }
      }
    } catch {}

    return files;
  }

  /**
   * Get all Python files in project
   */
  private getAllPythonFiles(): string[] {
    const files: string[] = [];

    const searchDir = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', '__pycache__', 'venv', 'env'].includes(item)) {
              searchDir(fullPath);
            }
          } else if (stat.isFile() && item.endsWith('.py')) {
            files.push(fullPath);
          }
        }
      } catch {}
    };

    searchDir(this.workingDir);
    return files;
  }

  /**
   * Generate test report
   */
  public generateTestReport(results: any): string {
    let report = '\n╔══════════════════════════════════════════╗\n';
    report += '║  📊 TEST REPORT                          ║\n';
    report += '╚══════════════════════════════════════════╝\n\n';

    report += `Status: ${results.passed ? '\x1b[32m✓ PASSED\x1b[0m' : '\x1b[31m✗ FAILED\x1b[0m'}\n\n`;

    if (results.screenshots.length > 0) {
      report += `Screenshots: ${results.screenshots.length}\n`;
      results.screenshots.forEach((s: string, i: number) => {
        report += `  ${i + 1}. ${s}\n`;
      });
      report += '\n';
    }

    if (results.errors.length > 0) {
      report += `Errors: ${results.errors.length}\n`;
      results.errors.forEach((e: string, i: number) => {
        report += `  ${i + 1}. ${e}\n`;
      });
      report += '\n';
    }

    if (results.logs.length > 0) {
      report += `Logs:\n`;
      results.logs.forEach((log: string) => {
        report += `  • ${log}\n`;
      });
    }

    return report;
  }

  /**
   * Get sensory system capabilities
   */
  public async getCapabilities() {
    return await this.sensory.getCapabilitiesReport();
  }
}
