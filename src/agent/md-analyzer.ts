import * as fs from 'fs';
import * as path from 'path';

/**
 * MD File Analysis Result
 */
export interface MDAnalysisResult {
  files: MDFileInfo[];
  insights: string[];
  improvements: string[];
  missingDocs: string[];
  inconsistencies: string[];
}

/**
 * MD File Information
 */
export interface MDFileInfo {
  path: string;
  name: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  content: string;
  lineCount: number;
  wordCount: number;
  hasCodeBlocks: boolean;
  hasTOC: boolean;
  sections: string[];
}

/**
 * MD File Analyzer
 * Analyzes all .md files in the project to identify improvement opportunities
 */
export class MDAnalyzer {
  private workingDir: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Analyze all MD files in the project
   */
  public async analyzeAllMDFiles(): Promise<MDAnalysisResult> {
    console.log('📚 Analyzing Markdown documentation...');

    // Find all .md files
    const mdFiles = this.findMDFiles(this.workingDir);
    console.log(`   Found ${mdFiles.length} .md files`);

    // Sort by creation time
    mdFiles.sort((a, b) => {
      const statsA = fs.statSync(a);
      const statsB = fs.statSync(b);
      return statsB.birthtimeMs - statsA.birthtimeMs; // Newest first
    });

    // Read and analyze each file
    const fileInfos: MDFileInfo[] = [];
    for (const filePath of mdFiles) {
      const info = this.analyzeMDFile(filePath);
      fileInfos.push(info);
    }

    // Generate insights and improvement suggestions
    const insights = this.generateInsights(fileInfos);
    const improvements = this.generateImprovements(fileInfos);
    const missingDocs = this.identifyMissingDocumentation(fileInfos);
    const inconsistencies = this.findInconsistencies(fileInfos);

    console.log('✓ Analysis complete');

    return {
      files: fileInfos,
      insights,
      improvements,
      missingDocs,
      inconsistencies,
    };
  }

  /**
   * Find all .md files recursively
   */
  private findMDFiles(dir: string): string[] {
    const mdFiles: string[] = [];

    const searchDir = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules, .git, dist, etc.
            if (!['node_modules', '.git', 'dist', 'build', 'shinka_results', '__pycache__'].includes(item)) {
              searchDir(fullPath);
            }
          } else if (stat.isFile() && item.endsWith('.md')) {
            mdFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir(dir);
    return mdFiles;
  }

  /**
   * Analyze a single MD file
   */
  private analyzeMDFile(filePath: string): MDFileInfo {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stat = fs.statSync(filePath);
    const lines = content.split('\n');

    // Extract sections (headers)
    const sections = lines
      .filter((line) => line.trim().startsWith('#'))
      .map((line) => line.trim());

    return {
      path: filePath,
      name: path.basename(filePath),
      size: stat.size,
      createdAt: stat.birthtime,
      modifiedAt: stat.mtime,
      content,
      lineCount: lines.length,
      wordCount: content.split(/\s+/).length,
      hasCodeBlocks: content.includes('```'),
      hasTOC: content.toLowerCase().includes('table of contents') || content.toLowerCase().includes('## contents'),
      sections,
    };
  }

  /**
   * Generate insights from analyzed files
   */
  private generateInsights(files: MDFileInfo[]): string[] {
    const insights: string[] = [];

    // Documentation coverage
    const hasReadme = files.some((f) => f.name.toLowerCase() === 'readme.md');
    const hasContributing = files.some((f) => f.name.toLowerCase() === 'contributing.md');
    const hasChangelog = files.some((f) => f.name.toLowerCase() === 'changelog.md');
    const hasLicense = files.some((f) => f.name.toLowerCase() === 'license.md');

    insights.push(`Documentation files: ${files.length} total`);
    insights.push(`README.md: ${hasReadme ? '✅' : '❌'}`);
    insights.push(`CONTRIBUTING.md: ${hasContributing ? '✅' : '❌'}`);
    insights.push(`CHANGELOG.md: ${hasChangelog ? '✅' : '❌'}`);
    insights.push(`LICENSE.md: ${hasLicense ? '✅' : '❌'}`);

    // Total documentation size
    const totalWords = files.reduce((sum, f) => sum + f.wordCount, 0);
    insights.push(`Total documentation: ${totalWords.toLocaleString()} words`);

    // Code examples
    const filesWithCode = files.filter((f) => f.hasCodeBlocks).length;
    insights.push(`Files with code examples: ${filesWithCode}/${files.length}`);

    return insights;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(files: MDFileInfo[]): string[] {
    const improvements: string[] = [];

    // Check for README
    const readme = files.find((f) => f.name.toLowerCase() === 'readme.md');
    if (!readme) {
      improvements.push('Add README.md with project overview, installation instructions, and usage examples');
    } else {
      // Check README completeness
      const readmeContent = readme.content.toLowerCase();

      if (!readmeContent.includes('install')) {
        improvements.push('Add installation instructions to README.md');
      }
      if (!readmeContent.includes('usage') && !readmeContent.includes('getting started')) {
        improvements.push('Add usage/getting started section to README.md');
      }
      if (!readmeContent.includes('example')) {
        improvements.push('Add usage examples to README.md');
      }
      if (!readme.hasCodeBlocks) {
        improvements.push('Add code examples to README.md');
      }
      if (!readmeContent.includes('feature')) {
        improvements.push('Add features section to README.md');
      }
      if (!readmeContent.includes('require')) {
        improvements.push('Add requirements/prerequisites section to README.md');
      }
    }

    // Check for CONTRIBUTING.md
    if (!files.some((f) => f.name.toLowerCase() === 'contributing.md')) {
      improvements.push('Add CONTRIBUTING.md with contribution guidelines');
    }

    // Check for CHANGELOG.md
    if (!files.some((f) => f.name.toLowerCase() === 'changelog.md')) {
      improvements.push('Add CHANGELOG.md to track version changes');
    }

    // Check for LICENSE
    if (!files.some((f) => f.name.toLowerCase() === 'license.md' || f.name.toLowerCase() === 'license')) {
      improvements.push('Add LICENSE file to specify project license');
    }

    // Check for API documentation
    const hasApiDocs = files.some(
      (f) => f.name.toLowerCase().includes('api') || f.content.toLowerCase().includes('api documentation')
    );
    if (!hasApiDocs) {
      improvements.push('Add API documentation for developers');
    }

    // Check for troubleshooting docs
    const hasTroubleshooting = files.some(
      (f) => f.name.toLowerCase().includes('troubleshoot') || f.content.toLowerCase().includes('troubleshooting')
    );
    if (!hasTroubleshooting) {
      improvements.push('Add troubleshooting guide for common issues');
    }

    // Check for architecture docs
    const hasArchitecture = files.some(
      (f) => f.name.toLowerCase().includes('architecture') || f.content.toLowerCase().includes('architecture')
    );
    if (!hasArchitecture) {
      improvements.push('Add architecture documentation explaining system design');
    }

    return improvements;
  }

  /**
   * Identify missing documentation
   */
  private identifyMissingDocumentation(files: MDFileInfo[]): string[] {
    const missing: string[] = [];

    const standardDocs = [
      { name: 'README.md', purpose: 'Project overview and getting started' },
      { name: 'CONTRIBUTING.md', purpose: 'Contribution guidelines' },
      { name: 'CHANGELOG.md', purpose: 'Version history and changes' },
      { name: 'LICENSE', purpose: 'Software license' },
      { name: 'ARCHITECTURE.md', purpose: 'System architecture and design' },
      { name: 'API.md', purpose: 'API reference documentation' },
      { name: 'TROUBLESHOOTING.md', purpose: 'Common issues and solutions' },
      { name: 'SECURITY.md', purpose: 'Security policies and reporting' },
    ];

    for (const doc of standardDocs) {
      const exists = files.some((f) => f.name.toLowerCase() === doc.name.toLowerCase());
      if (!exists) {
        missing.push(`${doc.name}: ${doc.purpose}`);
      }
    }

    return missing;
  }

  /**
   * Find inconsistencies in documentation
   */
  private findInconsistencies(files: MDFileInfo[]): string[] {
    const inconsistencies: string[] = [];

    // Check for different naming conventions
    const namingStyles = new Set<string>();
    for (const file of files) {
      if (file.name.includes('-')) namingStyles.add('kebab-case');
      if (file.name.includes('_')) namingStyles.add('snake_case');
      if (/[A-Z]/.test(file.name)) namingStyles.add('PascalCase');
    }

    if (namingStyles.size > 1) {
      inconsistencies.push(`Mixed naming conventions: ${Array.from(namingStyles).join(', ')}`);
    }

    // Check for files without proper headers
    const filesWithoutMainHeader = files.filter((f) => !f.content.trim().startsWith('#'));
    if (filesWithoutMainHeader.length > 0) {
      inconsistencies.push(
        `${filesWithoutMainHeader.length} file(s) missing main header: ${filesWithoutMainHeader.map((f) => f.name).join(', ')}`
      );
    }

    // Check for very short documentation files
    const tooShortFiles = files.filter((f) => f.wordCount < 50 && f.name.toLowerCase() !== 'license');
    if (tooShortFiles.length > 0) {
      inconsistencies.push(
        `${tooShortFiles.length} file(s) are very short (< 50 words): ${tooShortFiles.map((f) => f.name).join(', ')}`
      );
    }

    return inconsistencies;
  }

  /**
   * Get a formatted summary
   */
  public formatSummary(result: MDAnalysisResult): string {
    let summary = '\n📚 Markdown Documentation Analysis\n';
    summary += '═'.repeat(50) + '\n\n';

    summary += '📊 Insights:\n';
    for (const insight of result.insights) {
      summary += `   ${insight}\n`;
    }

    if (result.improvements.length > 0) {
      summary += '\n💡 Suggested Improvements:\n';
      for (let i = 0; i < result.improvements.length; i++) {
        summary += `   ${i + 1}. ${result.improvements[i]}\n`;
      }
    }

    if (result.missingDocs.length > 0) {
      summary += '\n❌ Missing Documentation:\n';
      for (const missing of result.missingDocs) {
        summary += `   • ${missing}\n`;
      }
    }

    if (result.inconsistencies.length > 0) {
      summary += '\n⚠️  Inconsistencies:\n';
      for (const inconsistency of result.inconsistencies) {
        summary += `   • ${inconsistency}\n`;
      }
    }

    summary += '\n' + '═'.repeat(50) + '\n';

    return summary;
  }

  /**
   * Generate actionable tasks from analysis
   */
  public generateTasks(result: MDAnalysisResult): string[] {
    const tasks: string[] = [];

    // Prioritize improvements
    for (const improvement of result.improvements.slice(0, 5)) {
      tasks.push(improvement);
    }

    // Add tasks for missing critical docs
    const criticalDocs = result.missingDocs.filter((doc) =>
      doc.includes('README') || doc.includes('CONTRIBUTING') || doc.includes('LICENSE')
    );
    for (const doc of criticalDocs) {
      if (!tasks.some((t) => t.toLowerCase().includes(doc.split(':')[0].toLowerCase()))) {
        tasks.push(doc.split(':')[0]);
      }
    }

    return tasks;
  }
}
