import * as fs from 'fs';
import * as path from 'path';

/**
 * Project Analyzer
 * Analyzes existing project files to understand intent and purpose
 */
export class ProjectAnalyzer {
  private workingDir: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Analyze project and determine intent
   */
  public async analyzeProject(): Promise<ProjectIntent> {
    const intent: ProjectIntent = {
      type: 'unknown',
      language: 'unknown',
      framework: 'none',
      purpose: '',
      hasTests: false,
      hasDocs: false,
      hasCI: false,
      technologies: [],
      entryPoints: [],
      description: '',
    };

    // First, detect language by checking for key files (most reliable)
    // Python detection (highest priority for language)
    if (fs.existsSync(path.join(this.workingDir, 'requirements.txt')) ||
        fs.existsSync(path.join(this.workingDir, 'setup.py')) ||
        fs.existsSync(path.join(this.workingDir, 'pyproject.toml'))) {
      intent.language = 'python';

      // Check for Flask/Django/FastAPI
      const reqFile = path.join(this.workingDir, 'requirements.txt');
      if (fs.existsSync(reqFile)) {
        const reqs = fs.readFileSync(reqFile, 'utf8').toLowerCase();
        if (reqs.includes('flask')) {
          intent.framework = 'flask';
          intent.type = 'backend-api';
        } else if (reqs.includes('django')) {
          intent.framework = 'django';
          intent.type = 'backend-api';
        } else if (reqs.includes('fastapi')) {
          intent.framework = 'fastapi';
          intent.type = 'backend-api';
        } else if (reqs.includes('pyqt6') || reqs.includes('pyqt5') || reqs.includes('tkinter')) {
          intent.framework = 'pyqt6';
          intent.type = 'desktop-app';
        }

        // Extract technologies from requirements
        const reqLines = reqs.split('\n')
          .map(l => l.split('==')[0].split('>=')[0].trim())
          .filter(l => l && !l.startsWith('#'));
        intent.technologies = reqLines.slice(0, 10);
      }

      // Check main Python files for entry points
      const files = fs.readdirSync(this.workingDir);
      const pyFiles = files.filter(f => f.endsWith('.py'));
      if (pyFiles.includes('app.py')) intent.entryPoints.push('app.py');
      if (pyFiles.includes('main.py')) intent.entryPoints.push('main.py');
      if (pyFiles.includes('__main__.py')) intent.entryPoints.push('__main__.py');
    }

    // TypeScript/JavaScript detection
    else if (fs.existsSync(path.join(this.workingDir, 'package.json'))) {
      const packageJsonPath = path.join(this.workingDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      intent.description = packageJson.description || '';

      // Check for TypeScript
      if (fs.existsSync(path.join(this.workingDir, 'tsconfig.json'))) {
        intent.language = 'typescript';
      } else {
        intent.language = 'javascript';
      }

      // Detect framework from dependencies
      if (packageJson.dependencies || packageJson.devDependencies) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Framework detection
        if (deps.react || deps['@types/react']) intent.framework = 'react';
        else if (deps.vue) intent.framework = 'vue';
        else if (deps.angular || deps['@angular/core']) intent.framework = 'angular';
        else if (deps.next || deps['next']) intent.framework = 'nextjs';
        else if (deps.express || deps['@types/express']) intent.framework = 'express';
        else if (deps['@nestjs/core']) intent.framework = 'nestjs';
        else if (deps.fastify) intent.framework = 'fastify';
        else if (deps.koa) intent.framework = 'koa';

        // Detect type
        if (deps.express || deps.fastify || deps.koa || deps['@nestjs/core'] ||
            deps['@types/express']) {
          intent.type = 'backend-api';
        }
        else if (deps.react || deps.vue || deps.angular || deps['@types/react'] ||
                 deps['@angular/core']) {
          intent.type = 'frontend-app';
        }
        else if (packageJson.bin) {
          intent.type = 'cli-tool';
        }
        else if (deps.electron) {
          intent.type = 'desktop-app';
        }
        else if (deps.typescript || deps['@types/node']) {
          // Has TypeScript but no clear framework - likely a library or tool
          intent.type = 'library';
        }

        intent.technologies = Object.keys(deps).slice(0, 10);
      }
    }

    // Detect other languages by file extensions
    else {
      const files = fs.readdirSync(this.workingDir);
      if (files.some(f => f.endsWith('.go'))) intent.language = 'go';
      else if (files.some(f => f.endsWith('.rs'))) intent.language = 'rust';
      else if (files.some(f => f.endsWith('.java'))) intent.language = 'java';
      else if (files.some(f => f.endsWith('.rb'))) intent.language = 'ruby';
      else if (files.some(f => f.endsWith('.py'))) {
        intent.language = 'python';
        // Check if it's a desktop app based on file names
        if (files.some(f => f.toLowerCase().includes('app.py') || f.toLowerCase().includes('main.py'))) {
          intent.type = 'desktop-app';
        }
      }
    }

    // Read README to understand purpose
    const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'README'];
    for (const readme of readmeFiles) {
      const readmePath = path.join(this.workingDir, readme);
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        intent.purpose = this.extractPurposeFromReadme(content);
        intent.hasDocs = true;
        break;
      }
    }

    // Check for tests
    intent.hasTests = this.hasTestDirectory();

    // Check for CI/CD
    intent.hasCI = fs.existsSync(path.join(this.workingDir, '.github', 'workflows')) ||
                   fs.existsSync(path.join(this.workingDir, '.gitlab-ci.yml')) ||
                   fs.existsSync(path.join(this.workingDir, 'Jenkinsfile'));

    // Find entry points
    intent.entryPoints = this.findEntryPoints();

    return intent;
  }

  /**
   * Extract purpose from README content
   */
  private extractPurposeFromReadme(content: string): string {
    // Get first paragraph after title
    const lines = content.split('\n').filter(l => l.trim());
    let purpose = '';

    for (let i = 0; i < lines.length && i < 5; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('#') && !line.startsWith('!')) {
        purpose += line + ' ';
        if (purpose.length > 50) break;
      }
    }

    return purpose.trim().substring(0, 200);
  }

  /**
   * Check if project has test directory
   */
  private hasTestDirectory(): boolean {
    const testDirs = ['test', 'tests', '__tests__', 'spec', 'specs'];
    return testDirs.some(dir => fs.existsSync(path.join(this.workingDir, dir)));
  }

  /**
   * Find entry point files
   */
  private findEntryPoints(): string[] {
    const entryPoints: string[] = [];
    const commonEntries = [
      'index.js', 'index.ts', 'main.js', 'main.ts',
      'app.js', 'app.ts', 'server.js', 'server.ts',
      'index.py', 'main.py', 'app.py', '__main__.py',
      'main.go', 'main.rs', 'Main.java',
    ];

    for (const entry of commonEntries) {
      const entryPath = path.join(this.workingDir, entry);
      if (fs.existsSync(entryPath)) {
        entryPoints.push(entry);
      }

      // Check in src/
      const srcPath = path.join(this.workingDir, 'src', entry);
      if (fs.existsSync(srcPath)) {
        entryPoints.push(path.join('src', entry));
      }
    }

    return entryPoints;
  }

  /**
   * Generate development plan based on intent
   */
  public generateDevelopmentPlan(intent: ProjectIntent): string[] {
    const tasks: string[] = [];

    // Based on project type, generate appropriate tasks
    if (intent.type === 'unknown' || intent.entryPoints.length === 0) {
      // Empty or new project
      tasks.push(`Create ${intent.framework !== 'none' ? intent.framework : intent.language} project structure`);
      tasks.push('Create README.md with project description');
      tasks.push('Add package.json/setup configuration');
      tasks.push('Create main entry point file');
      tasks.push('Add initial functionality');
    } else {
      // Existing project - improve it
      if (!intent.hasTests) {
        tasks.push('Add unit tests for core functionality');
        tasks.push('Set up testing framework');
      }

      if (!intent.hasDocs) {
        tasks.push('Create comprehensive documentation');
        tasks.push('Add code comments and API docs');
      }

      if (!intent.hasCI) {
        tasks.push('Set up CI/CD pipeline');
      }

      // Type-specific tasks
      if (intent.type === 'frontend-app') {
        tasks.push('Add responsive design improvements');
        tasks.push('Optimize bundle size and performance');
        tasks.push('Add accessibility features');
      } else if (intent.type === 'backend-api') {
        tasks.push('Add API documentation (Swagger/OpenAPI)');
        tasks.push('Implement rate limiting and security');
        tasks.push('Add database connection pooling');
      } else if (intent.type === 'cli-tool') {
        tasks.push('Add help documentation and examples');
        tasks.push('Improve CLI argument parsing');
        tasks.push('Add progress indicators');
      } else if (intent.type === 'desktop-app') {
        tasks.push('Add new feature: settings/preferences panel');
        tasks.push('Improve user interface responsiveness');
        tasks.push('Add keyboard shortcuts');
        tasks.push('Optimize performance and memory usage');
      } else if (intent.type === 'library' || intent.type === 'web-app') {
        tasks.push('Add new page/route for additional functionality');
        tasks.push('Improve mobile responsiveness');
        tasks.push('Add loading states and error handling');
      }

      // Always add general improvement tasks if nothing else
      if (tasks.length === 0) {
        tasks.push('Refactor code for better maintainability');
        tasks.push('Add error handling and logging');
        tasks.push('Optimize performance');
        tasks.push('Add new feature based on project purpose');
      }
    }

    return tasks.slice(0, 3); // Return max 3 tasks for better focus
  }

  /**
   * Get project summary for display
   */
  public getSummary(intent: ProjectIntent): string {
    let summary = `📊 Project Analysis:\n`;
    summary += `   Type: ${intent.type}\n`;
    summary += `   Language: ${intent.language}\n`;
    if (intent.framework !== 'none') summary += `   Framework: ${intent.framework}\n`;
    if (intent.purpose) summary += `   Purpose: ${intent.purpose.substring(0, 60)}...\n`;
    summary += `   Tests: ${intent.hasTests ? '✅' : '❌'}\n`;
    summary += `   Docs: ${intent.hasDocs ? '✅' : '❌'}\n`;
    summary += `   CI/CD: ${intent.hasCI ? '✅' : '❌'}\n`;
    if (intent.entryPoints.length > 0) {
      summary += `   Entry: ${intent.entryPoints[0]}\n`;
    }
    return summary;
  }
}

export interface ProjectIntent {
  type: 'frontend-app' | 'backend-api' | 'cli-tool' | 'desktop-app' | 'library' | 'unknown';
  language: 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'ruby' | 'unknown';
  framework: string;
  purpose: string;
  hasTests: boolean;
  hasDocs: boolean;
  hasCI: boolean;
  technologies: string[];
  entryPoints: string[];
  description: string;
}
