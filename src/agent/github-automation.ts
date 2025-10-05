import { execSync } from 'child_process';
import * as https from 'https';
import * as path from 'path';

/**
 * GitHub Automation
 * Automatically create repos, push/pull changes
 */
export class GitHubAutomation {
  private workingDir: string;
  private token?: string;
  private username?: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.token = process.env.GITHUB_TOKEN;
    this.username = process.env.GITHUB_USERNAME;
  }

  /**
   * Check if GitHub is configured
   */
  public isConfigured(): boolean {
    return !!this.token && !!this.username;
  }

  /**
   * Create GitHub repository
   */
  public async createRepo(repoName: string, description: string = ''): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('⚠ GitHub not configured (GITHUB_TOKEN and GITHUB_USERNAME needed)');
      return false;
    }

    try {
      const data = JSON.stringify({
        name: repoName,
        description: description || `Auto-generated repository for ${repoName}`,
        private: false,
        auto_init: false,
      });

      const result = await this.makeGitHubRequest('POST', '/user/repos', data);

      if (result) {
        console.log(`✓ GitHub repo created: https://github.com/${this.username}/${repoName}`);
        return true;
      }
    } catch (error: any) {
      if (error.message.includes('422')) {
        console.log(`✓ GitHub repo already exists: ${repoName}`);
        return true;
      }
      console.warn(`⚠ Failed to create GitHub repo: ${error.message}`);
    }

    return false;
  }

  /**
   * Push to GitHub
   */
  public async pushToGitHub(repoName: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Check if remote exists
      try {
        execSync('git remote get-url origin', {
          cwd: this.workingDir,
          stdio: 'pipe',
        });
      } catch {
        // Add remote
        const remoteUrl = `https://github.com/${this.username}/${repoName}.git`;
        execSync(`git remote add origin ${remoteUrl}`, {
          cwd: this.workingDir,
          stdio: 'pipe',
        });
      }

      // Push
      execSync('git push -u origin main 2>&1 || git push -u origin master 2>&1', {
        cwd: this.workingDir,
        stdio: 'pipe',
      });

      console.log(`✓ Pushed to GitHub: ${repoName}`);
      return true;
    } catch (error: any) {
      console.warn(`⚠ Push failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Pull from GitHub
   */
  public async pullFromGitHub(): Promise<boolean> {
    try {
      execSync('git pull origin main 2>&1 || git pull origin master 2>&1', {
        cwd: this.workingDir,
        stdio: 'pipe',
      });

      console.log('✓ Pulled latest from GitHub');
      return true;
    } catch (error: any) {
      // Not a problem if nothing to pull
      return true;
    }
  }

  /**
   * Auto-setup GitHub for project
   */
  public async autoSetupGitHub(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    // Get folder name as repo name
    const repoName = path.basename(this.workingDir);

    console.log(`🔧 Setting up GitHub for: ${repoName}`);

    // Create repo
    await this.createRepo(repoName);

    // Push current state
    await this.pushToGitHub(repoName);

    return true;
  }

  /**
   * Make GitHub API request
   */
  private makeGitHubRequest(
    method: string,
    endpoint: string,
    data?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers: any = {
        'User-Agent': 'SoftAutoEvolve',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      if (data) {
        headers['Content-Length'] = Buffer.byteLength(data);
      }

      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: endpoint,
        method: method,
        headers: headers,
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch {
              resolve(responseData);
            }
          } else {
            reject(new Error(`GitHub API error ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(data);
      }

      req.end();
    });
  }
}
