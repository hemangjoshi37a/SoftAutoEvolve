/**
 * Cyberpunk UI
 * Provides cyberpunk-styled terminal UI elements with ASCII art and animations
 */

export class CyberpunkUI {
  private frames: string[] = [];
  private currentFrame: number = 0;
  private interval: NodeJS.Timeout | null = null;

  /**
   * Color codes
   */
  private static colors = {
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    brightCyan: '\x1b[96m',
    brightMagenta: '\x1b[95m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
  };

  /**
   * Cyberpunk progress frames (animated)
   */
  private static progressFrames = [
    '▰▱▱▱▱▱▱▱▱▱',
    '▰▰▱▱▱▱▱▱▱▱',
    '▰▰▰▱▱▱▱▱▱▱',
    '▰▰▰▰▱▱▱▱▱▱',
    '▰▰▰▰▰▱▱▱▱▱',
    '▰▰▰▰▰▰▱▱▱▱',
    '▰▰▰▰▰▰▰▱▱▱',
    '▰▰▰▰▰▰▰▰▱▱',
    '▰▰▰▰▰▰▰▰▰▱',
    '▰▰▰▰▰▰▰▰▰▰',
  ];

  /**
   * Matrix-style falling characters
   */
  private static matrixFrames = [
    '╔═╗',
    '║▓║',
    '╚═╝',
  ];

  /**
   * Spinner frames
   */
  private static spinnerFrames = [
    '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'
  ];

  /**
   * Create a progress bar
   */
  public static progressBar(current: number, total: number, width: number = 40): string {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    const bar = this.colors.cyan +
                '▰'.repeat(filled) +
                this.colors.gray +
                '▱'.repeat(empty) +
                this.colors.reset;

    const percentText = `${percentage.toFixed(0)}%`;

    return `${bar} ${this.colors.brightCyan}${percentText}${this.colors.reset}`;
  }

  /**
   * Create a cyberpunk header
   */
  public static header(text: string): string {
    const width = text.length + 4;
    const border = '═'.repeat(width);

    return `${this.colors.cyan}╔${border}╗
║  ${this.colors.brightCyan}${text}${this.colors.cyan}  ║
╚${border}╝${this.colors.reset}`;
  }

  /**
   * Create a status box
   */
  public static statusBox(title: string, content: string[]): string {
    const maxLen = Math.max(title.length, ...content.map(c => c.length)) + 4;
    const border = '─'.repeat(maxLen);

    let box = `${this.colors.cyan}┌${border}┐\n`;
    box += `│ ${this.colors.brightCyan}${title}${' '.repeat(maxLen - title.length - 1)}${this.colors.cyan}│\n`;
    box += `├${border}┤\n`;

    for (const line of content) {
      const padding = ' '.repeat(maxLen - line.length - 1);
      box += `│ ${this.colors.white}${line}${padding}${this.colors.cyan}│\n`;
    }

    box += `└${border}┘${this.colors.reset}`;

    return box;
  }

  /**
   * Create a task list
   */
  public static taskList(tasks: Array<{text: string, status: 'pending' | 'active' | 'done' | 'failed'}>): string {
    let output = '';

    for (const task of tasks) {
      let icon = '';
      let color = '';

      switch (task.status) {
        case 'pending':
          icon = '○';
          color = this.colors.gray;
          break;
        case 'active':
          icon = '◉';
          color = this.colors.cyan;
          break;
        case 'done':
          icon = '✓';
          color = this.colors.green;
          break;
        case 'failed':
          icon = '✗';
          color = this.colors.red;
          break;
      }

      output += `${color}${icon}${this.colors.reset} ${task.text}\n`;
    }

    return output;
  }

  /**
   * Create an animated spinner
   */
  public startSpinner(message: string): void {
    let i = 0;

    this.interval = setInterval(() => {
      const frame = CyberpunkUI.spinnerFrames[i % CyberpunkUI.spinnerFrames.length];
      process.stdout.write(`\r${CyberpunkUI.colors.cyan}${frame}${CyberpunkUI.colors.reset} ${message}`);
      i++;
    }, 80);
  }

  /**
   * Stop the spinner
   */
  public stopSpinner(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write('\r\x1b[K'); // Clear line
    }
  }

  /**
   * Create a cyberpunk divider
   */
  public static divider(width: number = 50): string {
    return `${this.colors.cyan}${'─'.repeat(width)}${this.colors.reset}`;
  }

  /**
   * Create a glitch effect text
   */
  public static glitch(text: string): string {
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let glitched = '';

    for (let i = 0; i < text.length; i++) {
      if (Math.random() > 0.9) {
        glitched += this.colors.brightMagenta +
                    chars[Math.floor(Math.random() * chars.length)] +
                    this.colors.reset;
      } else {
        glitched += text[i];
      }
    }

    return glitched;
  }

  /**
   * Create an info message
   */
  public static info(message: string): string {
    return `${this.colors.cyan}▸${this.colors.reset} ${message}`;
  }

  /**
   * Create a success message
   */
  public static success(message: string): string {
    return `${this.colors.green}✓${this.colors.reset} ${message}`;
  }

  /**
   * Create an error message
   */
  public static error(message: string): string {
    return `${this.colors.red}✗${this.colors.reset} ${message}`;
  }

  /**
   * Create a warning message
   */
  public static warning(message: string): string {
    return `${this.colors.yellow}⚠${this.colors.reset} ${message}`;
  }

  /**
   * Create an animated progress display
   */
  public static animatedProgress(step: number, total: number, label: string): string {
    const frame = this.progressFrames[Math.min(step, this.progressFrames.length - 1)];
    const percentage = Math.floor((step / total) * 100);

    return `${this.colors.cyan}${frame}${this.colors.reset} ${label} ${this.colors.brightCyan}${percentage}%${this.colors.reset}`;
  }

  /**
   * Create a data stream effect
   */
  public static dataStream(lines: string[]): string {
    return lines.map(line =>
      `${this.colors.green}>${this.colors.brightCyan}> ${this.colors.reset}${line}`
    ).join('\n');
  }

  /**
   * Create a hex dump style display
   */
  public static hexDump(data: string): string {
    let output = '';
    const bytes = data.split('');

    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = chunk.map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
      const ascii = chunk.map(c => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126) ? c : '.').join('');

      output += `${this.colors.gray}${i.toString(16).padStart(8, '0')}${this.colors.reset}  ${this.colors.cyan}${hex}${this.colors.reset}  ${this.colors.white}${ascii}${this.colors.reset}\n`;
    }

    return output;
  }

  /**
   * Create a matrix-style title
   */
  public static matrixTitle(text: string): string {
    let output = '\n';

    // Top border
    output += `${this.colors.green}╔${'═'.repeat(text.length + 2)}╗${this.colors.reset}\n`;

    // Text
    output += `${this.colors.green}║${this.colors.reset} ${this.colors.brightCyan}${text}${this.colors.reset} ${this.colors.green}║${this.colors.reset}\n`;

    // Bottom border
    output += `${this.colors.green}╚${'═'.repeat(text.length + 2)}╝${this.colors.reset}\n`;

    return output;
  }

  /**
   * Create a file tree display
   */
  public static fileTree(files: Array<{name: string, indent: number, isLast: boolean}>): string {
    let output = '';

    for (const file of files) {
      const indent = '  '.repeat(file.indent);
      const branch = file.isLast ? '└─' : '├─';
      output += `${this.colors.cyan}${indent}${branch}${this.colors.reset} ${this.colors.white}${file.name}${this.colors.reset}\n`;
    }

    return output;
  }

  /**
   * Create a cyberpunk banner
   */
  public static banner(lines: string[]): string {
    const maxLen = Math.max(...lines.map(l => l.length));
    const border = '═'.repeat(maxLen + 4);

    let banner = `\n${this.colors.cyan}╔${border}╗${this.colors.reset}\n`;

    for (const line of lines) {
      const padding = ' '.repeat(maxLen - line.length);
      banner += `${this.colors.cyan}║${this.colors.reset}  ${this.colors.brightCyan}${line}${padding}${this.colors.reset}  ${this.colors.cyan}║${this.colors.reset}\n`;
    }

    banner += `${this.colors.cyan}╚${border}╝${this.colors.reset}\n`;

    return banner;
  }

  /**
   * Real-time progress indicator with percentage
   */
  public static liveProgress(completed: number, total: number, currentTask: string): string {
    const percentage = Math.floor((completed / total) * 100);
    const bar = this.progressBar(completed, total, 30);

    return `\r${bar} ${this.colors.brightCyan}${currentTask.substring(0, 40).padEnd(40)}${this.colors.reset}`;
  }

  /**
   * Show system stats in cyberpunk style
   */
  public static systemStats(stats: {[key: string]: string | number}): string {
    let output = `${this.colors.cyan}┌─ SYSTEM STATUS ─────────────────────┐${this.colors.reset}\n`;

    for (const [key, value] of Object.entries(stats)) {
      const label = key.padEnd(20);
      output += `${this.colors.cyan}│${this.colors.reset} ${this.colors.white}${label}${this.colors.reset} ${this.colors.brightCyan}${value}${this.colors.reset}\n`;
    }

    output += `${this.colors.cyan}└─────────────────────────────────────┘${this.colors.reset}`;

    return output;
  }
}
