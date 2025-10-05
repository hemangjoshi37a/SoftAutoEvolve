# Critical Fixes Needed

## 1. Claude Code Not Actually Developing ❌
**Problem:** Creating/deleting `.claude-prompt` files but no actual code changes
**Root Cause:** Prompt is being piped via `echo` but Claude Code may not be receiving it properly
**Fix:** Use proper interactive mode or file-based input

## 2. Spec-Kit Skipped Instead of Used Smartly ❌
**Problem:** Just skipping Spec-Kit when not initialized
**Need:** Auto-initialize with AI-generated project goals
**Fix:** Generate project constitution/spec from git history + AI analysis

## 3. Branch Naming Still Uses Timestamps ❌
**Problem:** `feature-add-set-cicd-pipeline-1759664121758` - not descriptive
**Need:** `feature/cicd-github-actions` or `feature/testing-framework`
**Fix:** Use AI to analyze task list and generate semantic branch name

## 4. Repeating Same Tasks ❌
**Problem:** "Set up CI/CD pipeline" appears in cycles 1, 2, 3
**Need:** Check if task is actually complete before repeating
**Fix:** Enhanced git history checking + file existence verification

## 5. No Visibility Into Claude Code ❌
**Problem:** Just shows spinner, no actual output
**Need:** Stream Claude Code's thinking and actions in real-time
**Fix:** Proper stdout streaming instead of buffering

## Solutions

### Fix 1: Make Claude Code Actually Work
```typescript
// Instead of: echo "prompt" | claude
// Use: claude with proper TTY and streaming

const claude = spawn('claude', ['--dangerously-skip-permissions'], {
  cwd: this.workingDir,
  stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr for visibility
});

// Write prompt
claude.stdin.write(prompt + '\n');
claude.stdin.write('/exit\n'); // Auto-exit after task

// Stream output in real-time
claude.stdout.on('data', (data) => {
  process.stdout.write(data); // Show live
  output += data;
});
```

### Fix 2: Smart Spec-Kit Integration
```typescript
// Auto-generate project constitution from analysis
async initializeSpecKitWithAI() {
  // 1. Analyze current project state
  const projectAnalysis = await this.analyzeProject();

  // 2. Generate constitution via Claude Code
  const constitution = await this.generateConstitution(projectAnalysis);

  // 3. Initialize spec-kit with it
  await this.runSpecKit('init', { constitution });

  // 4. Generate initial specs
  await this.runSpecKit('/specify', 'Based on current codebase...');
}
```

### Fix 3: AI-Powered Branch Naming
```typescript
// Ask Claude Code to generate branch name
async generateSmartBranchName(tasks: string[]): Promise<string> {
  const prompt = `Generate a git branch name for these tasks:
${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Requirements:
- Format: type/description (e.g., feature/user-auth, fix/login-bug)
- Max 50 characters
- Use kebab-case
- Be descriptive and semantic
- Type must be one of: feature, fix, refactor, docs, test

Output only the branch name, nothing else.`;

  const branchName = await askClaudeCode(prompt);
  return branchName.trim();
}
```

### Fix 4: Proper Task Completion Detection
```typescript
async isTaskActuallyComplete(task: string): Promise<boolean> {
  // Check multiple signals
  const checks = {
    inGitHistory: await this.checkGitHistory(task),
    filesExist: await this.checkExpectedFiles(task),
    testsPass: await this.runRelevantTests(task),
    featureWorks: await this.verifyFeature(task)
  };

  // Task is complete if 3/4 checks pass
  const passCount = Object.values(checks).filter(Boolean).length;
  return passCount >= 3;
}
```

### Fix 5: Real-Time Claude Code Streaming
```typescript
// Show what Claude is thinking/doing
private async runClaudeWithRealTimeOutput(prompt: string) {
  console.log('\n┌─ Claude Code ─────────────────────────────────┐');
  console.log('│ 💭 Thinking...');

  const claude = spawn('claude', ['--dangerously-skip-permissions'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: this.workingDir
  });

  // Stream output line by line
  const readline = require('readline');
  const rl = readline.createInterface({
    input: claude.stdout,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    if (line.includes('Reading') || line.includes('Writing')) {
      console.log('│ 📝', line.substring(0, 60));
    } else if (line.includes('Error')) {
      console.log('│ ❌', line.substring(0, 60));
    } else if (line.trim()) {
      console.log('│  ', line.substring(0, 60));
    }
  });

  claude.stdin.write(prompt + '\n');

  // Wait for completion
  await new Promise(resolve => claude.on('close', resolve));

  console.log('└───────────────────────────────────────────────┘\n');
}
```

## Implementation Order

1. **Fix Claude Code execution first** - Most critical
2. **Add real-time streaming** - For visibility
3. **Improve task completion detection** - Stop repeating
4. **Add AI branch naming** - Better organization
5. **Smart Spec-Kit integration** - Enhanced planning

## Testing Plan

1. Run in `/home/hemang/Documents/GitHub/image2cpp`
2. Verify actual code changes happen
3. Check branch names are semantic
4. Ensure tasks don't repeat
5. Confirm CI/CD actually gets set up
