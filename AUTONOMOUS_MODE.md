# 🤖 Autonomous Development Mode

## Overview

The **Autonomous Mode** is a fully automatic, infinite development loop that builds software without human intervention. It automatically:

- ✅ Generates tasks based on project analysis
- ✅ Creates feature branches for each cycle
- ✅ Implements features using Claude Code
- ✅ Runs evolutionary optimization with ShinkaEvolve
- ✅ Commits changes with descriptive messages
- ✅ Merges completed work to main branch
- ✅ Tracks progress with Git history
- ✅ Runs infinitely until project is complete

## Quick Start

```bash
# Navigate to your project
cd /home/hemang/Documents/GitHub/test

# Start autonomous mode
softautoevolve auto
```

Or use the shortcut:

```bash
sae-auto
```

Or via npm:

```bash
npm run auto
```

## How It Works

### Infinite Development Cycle

```
┌─ Cycle 1 ─────────────────────────────┐
│ 🎯 Generating tasks...                 │
│ ✓ 5 tasks generated                    │
│ 📋 Phase 1: Planning                   │
│ ✓ Created 5 tasks on feature/auto-... │
│ 🔨 Phase 2: Implementation             │
│   → Create package.json                │
│   → Create README.md                   │
│   → Add .gitignore                     │
│ ✓ Completed: 5, Failed: 0              │
│ 🧬 Phase 3: Evolution                  │
│ ✓ Evolution generation 1 complete      │
│ 🔀 Phase 4: Merge & Cleanup            │
│ ✓ Changes merged to main               │
│ 📊 Stats:                              │
│   Cycles: 1 | Evolution: 1             │
│   Commits: 6 | Tasks: 5                │
└────────────────────────────────────────┘

[Automatically starts Cycle 2...]
```

### 4-Phase Workflow

#### Phase 1: Planning
- Analyzes project structure
- Generates 3-5 tasks based on what's missing
- Creates a feature branch
- Adds tasks to queue

#### Phase 2: Implementation
- Executes high-priority tasks sequentially
- Executes medium/low-priority tasks in parallel (2-3 at a time)
- Uses Claude Code for implementation
- Commits after each task completion

#### Phase 3: Evolution
- Creates evolution branch
- Runs ShinkaEvolve on the codebase
- Optimizes for quality, performance, maintainability
- Commits optimized code

#### Phase 4: Merge & Cleanup
- Merges feature branch to main
- Deletes feature branch
- Updates statistics
- Prepares for next cycle

## Task Generation

The autonomous agent intelligently generates tasks based on project analysis:

### Initial Project (Empty)
1. Create initial project structure
2. Add main entry point file
3. Set up basic configuration
4. Create README.md
5. Add .gitignore file

### Existing Project (Missing Tests)
1. Add unit tests for core functionality
2. Add integration tests
3. Add test coverage reporting
4. Set up CI/CD for testing

### Mature Project (Has Code & Tests)
1. Add CLI argument parsing
2. Add configuration file support
3. Add progress indicators
4. Optimize performance
5. Add inline documentation

## Git Automation

### Automatic Branch Management

```
main
 │
 ├─ feature/auto-1633234567890
 │   ├─ ✨ Create package.json
 │   ├─ ✨ Create README.md
 │   ├─ 📝 Add .gitignore
 │   └─ [merged to main]
 │
 ├─ evolution/gen-1-1633234598000
 │   ├─ 🧬 Evolution gen-1: Code optimization
 │   └─ [merged to main]
 │
 └─ feature/auto-1633234620000
     ├─ ✨ Add unit tests
     └─ ...
```

### Commit Message Format

Commits are automatically tagged with emojis:

- ✨ New features
- 🐛 Bug fixes
- ⚡ Performance improvements
- 🧪 Tests
- ♻️ Refactoring
- 📝 General changes
- 🧬 Evolution/optimization

## Statistics Tracking

Each cycle displays comprehensive stats:

```
📊 Stats:
  Cycles: 10           # Total development cycles
  Evolution: 10        # Evolution generations run
  Commits: 73          # Total commits made
  Tasks: 45            # Total tasks generated and completed
```

## Comparison: Interactive vs Autonomous

### Interactive Agent Mode (`softautoevolve agent`)
```bash
💬 You: add task: Create calculator
✅ Task added: task-1
💬 You: execute
🚀 Executing task-1...
✅ Done
💬 You: [waits for next command]
```

**Pros:** Full control, can guide direction
**Cons:** Requires human input for each task

### Autonomous Mode (`softautoevolve auto`)
```bash
🤖 Autonomous Agent Started

┌─ Cycle 1 ────────────────────┐
│ ✓ 5 tasks generated          │
│ ✓ All phases complete        │
└──────────────────────────────┘

┌─ Cycle 2 ────────────────────┐
│ ✓ 4 tasks generated          │
│ ✓ All phases complete        │
└──────────────────────────────┘

[Continues infinitely...]
```

**Pros:** Zero human input, runs infinitely, automatic evolution
**Cons:** Less control over specific direction

## Output Format

### Compact & Focused

The autonomous mode uses a compact output format:

```
✓ Task complete          [Success indicator]
→ Task description       [Current task]
⚠ Warning message        [Non-critical issue]
❌ Error message         [Critical issue]
```

No verbose explanations - just essential information.

## Stopping the Agent

The agent runs infinitely. To stop:

```bash
# Press Ctrl+C
^C
👋 Autonomous agent stopped
```

The agent will:
- Complete the current task
- Commit any uncommitted changes
- Exit gracefully

## Use Cases

### 1. Bootstrap New Projects
```bash
mkdir my-new-project
cd my-new-project
softautoevolve auto
```

The agent will:
- Initialize Git
- Create package.json
- Add README
- Set up basic structure
- Add tests
- Optimize code
- Continue evolving...

### 2. Improve Existing Projects
```bash
cd my-existing-project
softautoevolve auto
```

The agent will:
- Analyze current state
- Add missing tests
- Improve documentation
- Optimize performance
- Refactor for clarity
- Continue evolving...

### 3. Continuous Development
Leave it running overnight:

```bash
nohup softautoevolve auto > development.log 2>&1 &
```

Wake up to a fully evolved, well-tested, documented project!

## Configuration

The autonomous agent respects your `.env` configuration:

```bash
# Evolution settings
DEFAULT_NUM_GENERATIONS=5
DEFAULT_MAX_PARALLEL_JOBS=2
DEFAULT_LLM_MODELS=azure-gpt-4.1-mini

# Git settings
AUTO_COMMIT=true
AUTO_MERGE=true
AUTO_PUSH=false  # Set to true to push to remote
```

## Monitoring Progress

### View Git History
```bash
git log --oneline --graph
```

### Check Statistics
The agent displays stats after each cycle:
- Total cycles run
- Evolution generations completed
- Commits made
- Tasks completed

### Review Code Changes
```bash
git diff HEAD~10  # Last 10 commits
git show <commit-hash>  # Specific commit
```

## Advanced Features

### Automatic Evolution Triggers

Evolution runs automatically when:
1. Implementation phase completes successfully
2. New features are added
3. Code quality drops below threshold

### Parallel Task Execution

Tasks execute based on priority:
- **High priority** (bugs): Sequential (1 at a time)
- **Medium priority** (features): Parallel (2 at a time)
- **Low priority** (cleanup): Parallel (3 at a time)

### Intelligent Tool Selection

The orchestrator automatically selects:
- **Claude Code** for features, bugs, refactoring
- **Spec-Kit** for complex features requiring structure
- **ShinkaEvolve** for optimization and evolution

## Troubleshooting

### Agent Stops Early
**Issue:** Agent says "project complete" after 1-2 cycles
**Solution:** Add initial tasks or features to build upon

### Too Many Tasks Generated
**Issue:** Each cycle generates too many tasks
**Solution:** Tasks are limited to 5 per cycle automatically

### Evolution Fails
**Issue:** Evolution phase reports errors
**Solution:** Ensure ShinkaEvolve is properly configured in `.env`

### Git Conflicts
**Issue:** Merge conflicts occur
**Solution:** Agent creates new branches to avoid conflicts

## Examples

### Example 1: Build a CLI Tool
```bash
mkdir cli-tool
cd cli-tool
echo "# CLI Tool" > README.md
softautoevolve auto
```

Agent will:
1. Create package.json with CLI entry point
2. Add argument parsing
3. Implement core functionality
4. Add tests
5. Add help documentation
6. Optimize performance
7. Continue evolving...

### Example 2: Improve an Existing App
```bash
cd my-app  # Existing project
softautoevolve auto
```

Agent will:
1. Analyze current code
2. Add missing tests
3. Improve error handling
4. Optimize database queries
5. Add logging
6. Refactor for clarity
7. Continue evolving...

## Best Practices

1. **Start with Git** - Initialize Git before running autonomous mode
2. **Set Clear Goals** - Add a README describing the project purpose
3. **Review Progress** - Check commits periodically
4. **Let It Run** - Give it time to evolve (hours, not minutes)
5. **Stop When Satisfied** - Use Ctrl+C when goals are met

## Comparison Chart

| Feature | Interactive Agent | Autonomous Mode |
|---------|------------------|----------------|
| Human Input | Required for each task | Zero |
| Output Verbosity | Verbose | Compact |
| Git Operations | Manual | Automatic |
| Evolution | Manual trigger | Automatic |
| Task Generation | Manual | Automatic |
| Runtime | Until user exits | Infinite |
| Best For | Specific features | Full projects |

## Conclusion

Autonomous mode is the **ultimate lazy developer tool**:

- ✅ No manual task creation
- ✅ No git commands needed
- ✅ Automatic evolution
- ✅ Compact, clean output
- ✅ Runs infinitely
- ✅ Just set it and forget it!

```bash
# One command to rule them all
softautoevolve auto
```

Let the AI build your software while you sleep! 🚀😴
