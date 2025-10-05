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

    // Read package.json if exists
    const packageJsonPath = path.join(this.workingDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      intent.description = packageJson.description || '';
      intent.language = 'javascript';

      // Detect framework from dependencies
      if (packageJson.dependencies || packageJson.devDependencies) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (deps.react) intent.framework = 'react';
        else if (deps.vue) intent.framework = 'vue';
        else if (deps.angular) intent.framework = 'angular';
        else if (deps.next) intent.framework = 'nextjs';
        else if (deps.express) intent.framework = 'express';
        else if (deps.nest) intent.framework = 'nestjs';

        // Detect type
        if (deps.express || deps.fastify || deps.koa) intent.type = 'backend-api';
        else if (deps.react || deps.vue || deps.angular) intent.type = 'frontend-app';
        else if (packageJson.bin) intent.type = 'cli-tool';
        else if (deps.electron) intent.type = 'desktop-app';

        intent.technologies = Object.keys(deps).slice(0, 10);
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

    // Detect Python projects
    if (fs.existsSync(path.join(this.workingDir, 'requirements.txt')) ||
        fs.existsSync(path.join(this.workingDir, 'setup.py')) ||
        fs.existsSync(path.join(this.workingDir, 'pyproject.toml'))) {
      intent.language = 'python';

      // Check for Flask/Django/FastAPI
      const reqFile = path.join(this.workingDir, 'requirements.txt');
      if (fs.existsSync(reqFile)) {
        const reqs = fs.readFileSync(reqFile, 'utf8');
        if (reqs.includes('flask')) intent.framework = 'flask';
        else if (reqs.includes('django')) intent.framework = 'django';
        else if (reqs.includes('fastapi')) intent.framework = 'fastapi';
      }
    }

    // Detect other languages
    const files = fs.readdirSync(this.workingDir);
    if (files.some(f => f.endsWith('.go'))) intent.language = 'go';
    else if (files.some(f => f.endsWith('.rs'))) intent.language = 'rust';
    else if (files.some(f => f.endsWith('.java'))) intent.language = 'java';
    else if (files.some(f => f.endsWith('.rb'))) intent.language = 'ruby';

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
      }
    }

    return tasks.slice(0, 5); // Return max 5 tasks
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
