import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Sensory System - Visual & Interactive Feedback
 * Provides closed-loop feedback with screen capture, keyboard, mouse, and browser control
 */
export class SensorySystem {
  private workingDir: string;
  private screenshotsDir: string;
  private browserControlEnabled: boolean = false;
  private x11DisplayAvailable: boolean = false;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.screenshotsDir = path.join(workingDir, '.softautoevolve', 'screenshots');

    // Ensure screenshots directory exists
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }

    this.detectCapabilities();
  }

  /**
   * Detect available sensory capabilities
   */
  private async detectCapabilities(): Promise<void> {
    try {
      // Check if X11/Xorg display is available
      const display = process.env.DISPLAY;
      if (display) {
        this.x11DisplayAvailable = true;
        console.log(`   \x1b[36m▸\x1b[0m X11 Display detected: ${display}`);
      }

      // Check for browser automation tools
      const browserTools = await this.checkBrowserTools();
      if (browserTools.length > 0) {
        this.browserControlEnabled = true;
        console.log(`   \x1b[36m▸\x1b[0m Browser control: ${browserTools.join(', ')}`);
      }
    } catch (error) {
      // Silent fail - capabilities will be limited
    }
  }

  /**
   * Check for available browser automation tools
   */
  private async checkBrowserTools(): Promise<string[]> {
    const tools: string[] = [];

    try {
      await execAsync('which chromium-browser');
      tools.push('chromium');
    } catch {}

    try {
      await execAsync('which google-chrome');
      tools.push('chrome');
    } catch {}

    try {
      await execAsync('which firefox');
      tools.push('firefox');
    } catch {}

    return tools;
  }

  /**
   * Capture screenshot of current X11 display
   */
  public async captureScreen(filename: string = 'screen.png'): Promise<string> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available for screenshots');
    }

    const screenshotPath = path.join(this.screenshotsDir, filename);

    try {
      // Try using scrot (fast and reliable)
      await execAsync(`scrot "${screenshotPath}"`);
      console.log(`   \x1b[36m▸\x1b[0m Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      try {
        // Fallback to import (ImageMagick)
        await execAsync(`import -window root "${screenshotPath}"`);
        console.log(`   \x1b[36m▸\x1b[0m Screenshot saved: ${screenshotPath}`);
        return screenshotPath;
      } catch (fallbackError) {
        try {
          // Fallback to gnome-screenshot
          await execAsync(`gnome-screenshot -f "${screenshotPath}"`);
          console.log(`   \x1b[36m▸\x1b[0m Screenshot saved: ${screenshotPath}`);
          return screenshotPath;
        } catch (finalError) {
          throw new Error('No screenshot tool available (tried: scrot, import, gnome-screenshot)');
        }
      }
    }
  }

  /**
   * Capture screenshot of specific window
   */
  public async captureWindow(windowName: string, filename: string = 'window.png'): Promise<string> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available');
    }

    const screenshotPath = path.join(this.screenshotsDir, filename);

    try {
      // Find window ID
      const { stdout } = await execAsync(`xdotool search --name "${windowName}" | head -1`);
      const windowId = stdout.trim();

      if (!windowId) {
        throw new Error(`Window not found: ${windowName}`);
      }

      // Capture window
      await execAsync(`import -window ${windowId} "${screenshotPath}"`);
      console.log(`   \x1b[36m▸\x1b[0m Window screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error: any) {
      throw new Error(`Failed to capture window: ${error.message}`);
    }
  }

  /**
   * Simulate mouse click at coordinates
   */
  public async mouseClick(x: number, y: number, button: number = 1): Promise<void> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available');
    }

    try {
      await execAsync(`xdotool mousemove ${x} ${y} click ${button}`);
      console.log(`   \x1b[36m▸\x1b[0m Mouse clicked at (${x}, ${y})`);
    } catch (error: any) {
      throw new Error(`Failed to click mouse: ${error.message}`);
    }
  }

  /**
   * Type text using keyboard
   */
  public async typeText(text: string, delay: number = 50): Promise<void> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available');
    }

    try {
      // Escape special characters
      const escapedText = text.replace(/'/g, "\\'");
      await execAsync(`xdotool type --delay ${delay} '${escapedText}'`);
      console.log(`   \x1b[36m▸\x1b[0m Typed: ${text.substring(0, 50)}...`);
    } catch (error: any) {
      throw new Error(`Failed to type text: ${error.message}`);
    }
  }

  /**
   * Press keyboard key
   */
  public async pressKey(key: string): Promise<void> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available');
    }

    try {
      await execAsync(`xdotool key ${key}`);
      console.log(`   \x1b[36m▸\x1b[0m Key pressed: ${key}`);
    } catch (error: any) {
      throw new Error(`Failed to press key: ${error.message}`);
    }
  }

  /**
   * Open URL in browser and capture screenshot
   */
  public async openUrlAndCapture(url: string, filename: string = 'browser.png', waitTime: number = 3000): Promise<string> {
    if (!this.browserControlEnabled) {
      throw new Error('Browser control not available');
    }

    try {
      // Open URL in default browser
      await execAsync(`xdg-open "${url}"`);
      console.log(`   \x1b[36m▸\x1b[0m Opened URL: ${url}`);

      // Wait for page to load
      await this.sleep(waitTime);

      // Capture screenshot
      return await this.captureScreen(filename);
    } catch (error: any) {
      throw new Error(`Failed to open URL: ${error.message}`);
    }
  }

  /**
   * Get list of open windows
   */
  public async getOpenWindows(): Promise<Array<{ id: string; name: string }>> {
    if (!this.x11DisplayAvailable) {
      return [];
    }

    try {
      const { stdout } = await execAsync('wmctrl -l');
      const windows = stdout.trim().split('\n').map(line => {
        const parts = line.split(/\s+/);
        const id = parts[0];
        const name = parts.slice(3).join(' ');
        return { id, name };
      });

      return windows;
    } catch (error) {
      return [];
    }
  }

  /**
   * Focus on specific window
   */
  public async focusWindow(windowName: string): Promise<void> {
    if (!this.x11DisplayAvailable) {
      throw new Error('X11 display not available');
    }

    try {
      await execAsync(`wmctrl -a "${windowName}"`);
      console.log(`   \x1b[36m▸\x1b[0m Focused window: ${windowName}`);
    } catch (error: any) {
      throw new Error(`Failed to focus window: ${error.message}`);
    }
  }

  /**
   * Run Actiona script for complex automation
   */
  public async runActionaScript(scriptPath: string): Promise<string> {
    const actionaBin = '/home/hemang/Documents/GitHub/actiona/build/bin/actiona';

    if (!fs.existsSync(actionaBin)) {
      throw new Error('Actiona not found. Please build it first.');
    }

    try {
      const { stdout, stderr } = await execAsync(`"${actionaBin}" -e -s "${scriptPath}"`);
      console.log(`   \x1b[36m▸\x1b[0m Actiona script executed: ${scriptPath}`);
      return stdout + stderr;
    } catch (error: any) {
      throw new Error(`Failed to run Actiona script: ${error.message}`);
    }
  }

  /**
   * Test application visually
   */
  public async testApplication(
    appCommand: string,
    testSteps: Array<{ action: string; params: any }>,
    screenshotPrefix: string = 'test'
  ): Promise<Array<{ step: number; screenshot: string; success: boolean; error?: string }>> {
    const results: Array<{ step: number; screenshot: string; success: boolean; error?: string }> = [];

    console.log(`\n   \x1b[36m▸\x1b[0m Starting visual application test...`);
    console.log(`   \x1b[36m▸\x1b[0m Command: ${appCommand}`);

    // Launch application
    const appProcess = spawn(appCommand, { shell: true, detached: true, stdio: 'ignore' });
    await this.sleep(2000); // Wait for app to start

    try {
      // Initial screenshot
      const initialScreenshot = await this.captureScreen(`${screenshotPrefix}_00_initial.png`);
      results.push({ step: 0, screenshot: initialScreenshot, success: true });

      // Execute test steps
      for (let i = 0; i < testSteps.length; i++) {
        const step = testSteps[i];
        console.log(`   \x1b[36m▸\x1b[0m Step ${i + 1}: ${step.action}`);

        try {
          switch (step.action) {
            case 'click':
              await this.mouseClick(step.params.x, step.params.y, step.params.button || 1);
              break;

            case 'type':
              await this.typeText(step.params.text, step.params.delay || 50);
              break;

            case 'pressKey':
              await this.pressKey(step.params.key);
              break;

            case 'wait':
              await this.sleep(step.params.ms || 1000);
              break;

            case 'focusWindow':
              await this.focusWindow(step.params.name);
              break;

            default:
              throw new Error(`Unknown action: ${step.action}`);
          }

          // Screenshot after step
          const screenshot = await this.captureScreen(`${screenshotPrefix}_${String(i + 1).padStart(2, '0')}_${step.action}.png`);
          results.push({ step: i + 1, screenshot, success: true });
        } catch (error: any) {
          const screenshot = await this.captureScreen(`${screenshotPrefix}_${String(i + 1).padStart(2, '0')}_ERROR.png`);
          results.push({ step: i + 1, screenshot, success: false, error: error.message });
          console.log(`   \x1b[31m✗\x1b[0m Step ${i + 1} failed: ${error.message}`);
        }

        await this.sleep(500); // Brief pause between steps
      }
    } finally {
      // Clean up - kill application
      if (appProcess.pid) {
        try {
          process.kill(-appProcess.pid);
        } catch {}
      }
    }

    return results;
  }

  /**
   * Analyze screenshot for UI elements (basic OCR/vision)
   */
  public async analyzeScreenshot(screenshotPath: string): Promise<{
    text: string[];
    hasErrors: boolean;
    resolution: { width: number; height: number };
  }> {
    try {
      // Get image dimensions
      const { stdout } = await execAsync(`identify -format "%wx%h" "${screenshotPath}"`);
      const [width, height] = stdout.trim().split('x').map(Number);

      // Try basic OCR with tesseract if available
      let text: string[] = [];
      let hasErrors = false;

      try {
        const { stdout: ocrOutput } = await execAsync(`tesseract "${screenshotPath}" stdout 2>/dev/null`);
        text = ocrOutput.split('\n').filter(line => line.trim().length > 0);

        // Check for error indicators in text
        const errorKeywords = ['error', 'exception', 'failed', 'warning', 'traceback'];
        hasErrors = text.some(line =>
          errorKeywords.some(keyword => line.toLowerCase().includes(keyword))
        );
      } catch {
        // Tesseract not available or failed
        text = [];
      }

      return {
        text,
        hasErrors,
        resolution: { width, height }
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze screenshot: ${error.message}`);
    }
  }

  /**
   * Get system capabilities report
   */
  public async getCapabilitiesReport(): Promise<{
    x11: boolean;
    browser: boolean;
    screenshot: boolean;
    keyboard: boolean;
    mouse: boolean;
    actiona: boolean;
    ocr: boolean;
  }> {
    const capabilities = {
      x11: this.x11DisplayAvailable,
      browser: this.browserControlEnabled,
      screenshot: false,
      keyboard: false,
      mouse: false,
      actiona: false,
      ocr: false,
    };

    // Check screenshot tools
    try {
      await execAsync('which scrot');
      capabilities.screenshot = true;
    } catch {
      try {
        await execAsync('which gnome-screenshot');
        capabilities.screenshot = true;
      } catch {}
    }

    // Check xdotool for keyboard/mouse
    try {
      await execAsync('which xdotool');
      capabilities.keyboard = true;
      capabilities.mouse = true;
    } catch {}

    // Check Actiona
    const actionaBin = '/home/hemang/Documents/GitHub/actiona/build/bin/actiona';
    capabilities.actiona = fs.existsSync(actionaBin);

    // Check tesseract for OCR
    try {
      await execAsync('which tesseract');
      capabilities.ocr = true;
    } catch {}

    return capabilities;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup screenshots older than specified days
   */
  public async cleanupOldScreenshots(days: number = 7): Promise<number> {
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;
    let deleted = 0;

    try {
      const files = fs.readdirSync(this.screenshotsDir);

      for (const file of files) {
        const filePath = path.join(this.screenshotsDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      }

      if (deleted > 0) {
        console.log(`   \x1b[36m▸\x1b[0m Cleaned up ${deleted} old screenshots`);
      }
    } catch (error) {
      // Silent fail
    }

    return deleted;
  }
}
