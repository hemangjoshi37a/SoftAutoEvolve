import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Notification Type
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Notification System
 * Provides native OS notifications and sound alerts
 */
export class NotificationSystem {
  private enabled: boolean = true;
  private soundEnabled: boolean = true;
  private platform: string = process.platform;

  constructor() {
    this.detectNotificationSupport();
  }

  /**
   * Detect if notification support is available
   */
  private async detectNotificationSupport(): Promise<void> {
    try {
      if (this.platform === 'linux') {
        // Check for notify-send (Ubuntu/Debian)
        await execAsync('which notify-send');
      } else if (this.platform === 'darwin') {
        // macOS has osascript by default
        this.enabled = true;
      } else if (this.platform === 'win32') {
        // Windows has PowerShell notifications
        this.enabled = true;
      }
    } catch (error) {
      console.warn('⚠️  Native notifications not available');
      this.enabled = false;
    }
  }

  /**
   * Send a notification
   */
  public async notify(
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      if (this.platform === 'linux') {
        await this.notifyLinux(title, message, type);
      } else if (this.platform === 'darwin') {
        await this.notifyMacOS(title, message, type);
      } else if (this.platform === 'win32') {
        await this.notifyWindows(title, message, type);
      }

      // Play sound for important notifications
      if (this.soundEnabled && (type === NotificationType.SUCCESS || type === NotificationType.ERROR)) {
        await this.playSound(type);
      }
    } catch (error: any) {
      // Fail silently - notifications are not critical
      console.warn(`⚠️  Notification failed: ${error.message}`);
    }
  }

  /**
   * Send Linux notification (Ubuntu/Debian)
   */
  private async notifyLinux(
    title: string,
    message: string,
    type: NotificationType
  ): Promise<void> {
    const urgency = type === NotificationType.ERROR ? 'critical' : 'normal';
    const icon = this.getIcon(type);

    const command = `notify-send "${title}" "${message}" --urgency=${urgency} --icon=${icon}`;
    await execAsync(command);
  }

  /**
   * Send macOS notification
   */
  private async notifyMacOS(
    title: string,
    message: string,
    type: NotificationType
  ): Promise<void> {
    const script = `display notification "${message}" with title "${title}"`;
    await execAsync(`osascript -e '${script}'`);
  }

  /**
   * Send Windows notification
   */
  private async notifyWindows(
    title: string,
    message: string,
    type: NotificationType
  ): Promise<void> {
    const script = `
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
      $Template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
      $RawXml = [xml] $Template.GetXml()
      ($RawXml.toast.visual.binding.text|where {$_.id -eq "1"}).AppendChild($RawXml.CreateTextNode("${title}")) > $null
      ($RawXml.toast.visual.binding.text|where {$_.id -eq "2"}).AppendChild($RawXml.CreateTextNode("${message}")) > $null
      $SerializedXml = New-Object Windows.Data.Xml.Dom.XmlDocument
      $SerializedXml.LoadXml($RawXml.OuterXml)
      $Toast = [Windows.UI.Notifications.ToastNotification]::new($SerializedXml)
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("SoftAutoEvolve").Show($Toast)
    `;
    await execAsync(`powershell -Command "${script}"`);
  }

  /**
   * Get icon for notification type
   */
  private getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'dialog-information';
      case NotificationType.WARNING:
        return 'dialog-warning';
      case NotificationType.ERROR:
        return 'dialog-error';
      default:
        return 'dialog-information';
    }
  }

  /**
   * Play notification sound
   */
  private async playSound(type: NotificationType): Promise<void> {
    if (!this.soundEnabled) {
      return;
    }

    try {
      if (this.platform === 'linux') {
        // Try multiple sound systems
        await this.playSoundLinux(type);
      } else if (this.platform === 'darwin') {
        await this.playSoundMacOS(type);
      } else if (this.platform === 'win32') {
        await this.playSoundWindows(type);
      }
    } catch (error) {
      // Sound playback is optional - fail silently
    }
  }

  /**
   * Play sound on Linux
   */
  private async playSoundLinux(type: NotificationType): Promise<void> {
    const soundName = type === NotificationType.SUCCESS ? 'complete' : 'dialog-error';

    try {
      // Try paplay (PulseAudio) first
      await execAsync(`paplay /usr/share/sounds/freedesktop/stereo/${soundName}.oga 2>/dev/null`);
    } catch {
      try {
        // Try aplay (ALSA) as fallback
        await execAsync('aplay /usr/share/sounds/sound-icons/percussion-10.wav 2>/dev/null');
      } catch {
        try {
          // Last resort: system beep
          await execAsync('beep');
        } catch {
          // No sound available
        }
      }
    }
  }

  /**
   * Play sound on macOS
   */
  private async playSoundMacOS(type: NotificationType): Promise<void> {
    const sound = type === NotificationType.SUCCESS ? 'Glass' : 'Basso';
    await execAsync(`afplay /System/Library/Sounds/${sound}.aiff`);
  }

  /**
   * Play sound on Windows
   */
  private async playSoundWindows(type: NotificationType): Promise<void> {
    const sound = type === NotificationType.SUCCESS ? 'SystemNotification' : 'SystemHand';
    await execAsync(`powershell -c (New-Object Media.SoundPlayer "C:\\Windows\\Media\\${sound}.wav").PlaySync()`);
  }

  /**
   * Notify cycle completion
   */
  public async notifyCycleComplete(
    cycleNumber: number,
    tasksCompleted: number,
    taskDescriptions?: string[]
  ): Promise<void> {
    let message = `Cycle ${cycleNumber} finished successfully!\nCompleted ${tasksCompleted} tasks.`;

    // Add task details if provided
    if (taskDescriptions && taskDescriptions.length > 0) {
      message += '\n\nAccomplishments:';
      for (let i = 0; i < Math.min(3, taskDescriptions.length); i++) {
        const task = taskDescriptions[i];
        // Truncate long task descriptions
        const truncated = task.length > 50 ? task.substring(0, 47) + '...' : task;
        message += `\n• ${truncated}`;
      }
      if (taskDescriptions.length > 3) {
        message += `\n+ ${taskDescriptions.length - 3} more`;
      }
    }

    await this.notify(
      '🤖 Development Cycle Complete',
      message,
      NotificationType.SUCCESS
    );
  }

  /**
   * Notify cycle error
   */
  public async notifyCycleError(cycleNumber: number, error: string): Promise<void> {
    await this.notify(
      '❌ Development Cycle Failed',
      `Cycle ${cycleNumber} encountered an error:\n${error}`,
      NotificationType.ERROR
    );
  }

  /**
   * Notify project completion
   */
  public async notifyProjectComplete(): Promise<void> {
    await this.notify(
      '🎉 Project Complete!',
      'All development tasks have been completed.',
      NotificationType.SUCCESS
    );
  }

  /**
   * Notify evolution complete
   */
  public async notifyEvolutionComplete(generation: number): Promise<void> {
    await this.notify(
      '🧬 Evolution Complete',
      `Generation ${generation} optimization finished.`,
      NotificationType.INFO
    );
  }

  /**
   * Notify GitHub push
   */
  public async notifyGitHubPush(repoName: string): Promise<void> {
    await this.notify(
      '📤 Pushed to GitHub',
      `Changes pushed to ${repoName}`,
      NotificationType.INFO
    );
  }

  /**
   * Enable/disable notifications
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable/disable sound
   */
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Check if notifications are enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if sound is enabled
   */
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}
