# SoftAutoEvolve Architecture

## Core Philosophy: Balanced Autonomy

### The Hardcoded vs AI Decision Framework

**Key Principle:** Hardcode the process, let AI decide the content.

#### What Should Be Hardcoded (Process/Structure):
1. **Workflow Steps** - The sequence of analyze → plan → implement → test → commit
2. **Safety Checks** - Git operations, file permissions, error handling
3. **Tool Selection Logic** - When to use Claude Code vs terminal vs tests
4. **Branch Management** - Creation, merging, cleanup strategies
5. **Progress Tracking** - UI updates, notifications, logging
6. **Timeout Management** - Prevent infinite loops
7. **Resource Limits** - Max parallel tasks, memory limits

#### What Should Be AI-Decided (Content/Strategy):
1. **Task Descriptions** - What features/bugs to work on
2. **Implementation Details** - How to write the code
3. **Test Strategies** - What tests to write
4. **Refactoring Decisions** - How to improve code
5. **Architecture Choices** - Design patterns to use
6. **Library Selection** - Which dependencies to add
7. **Documentation Content** - What to document and how

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AUTONOMOUS AGENT                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. ANALYZE (Hardcoded Process)                  │  │
│  │     ├─ Read git history                          │  │
│  │     ├─ Check file structure                      │  │
│  │     ├─ Detect project type                       │  │
│  │     └─ Generate project intent (AI)              │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  2. PLAN (Mixed: Hardcoded + AI)                 │  │
│  │     ├─ Check completed tasks from git (Hardcoded)│  │
│  │     ├─ Generate task list (AI)                   │  │
│  │     ├─ Prioritize tasks (Hardcoded logic)        │  │
│  │     └─ Create branches (Hardcoded naming)        │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  3. IMPLEMENT (Hardcoded orchestration)          │  │
│  │     ├─ Build context prompt (Hardcoded)          │  │
│  │     ├─ Execute Claude Code (AI)                  │  │
│  │     ├─ Stream output (Hardcoded)                 │  │
│  │     └─ Capture changes (Hardcoded)               │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  4. TEST (Hardcoded execution)                   │  │
│  │     ├─ Run test suite (Hardcoded)                │  │
│  │     ├─ Check syntax (Hardcoded)                  │  │
│  │     ├─ Try running app (Hardcoded)               │  │
│  │     └─ Analyze results (Mixed)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  5. FEEDBACK (Hardcoded loop)                    │  │
│  │     ├─ Compare before/after state (Hardcoded)    │  │
│  │     ├─ Check for errors (Hardcoded)              │  │
│  │     ├─ Decide if iteration needed (Hardcoded)    │  │
│  │     └─ Loop back if needed (Hardcoded)           │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  6. COMMIT (Hardcoded git operations)            │  │
│  │     ├─ Stage changes (Hardcoded)                 │  │
│  │     ├─ Generate commit message (AI)              │  │
│  │     ├─ Create commit (Hardcoded)                 │  │
│  │     └─ Merge/cleanup (Hardcoded)                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### 1. AutonomousAgent (Main Orchestrator)
- **Hardcoded:** Workflow loop, cycle management, state tracking
- **AI-Driven:** None (pure orchestration)

### 2. ProjectAnalyzer
- **Hardcoded:** File detection, structure analysis
- **AI-Driven:** Project intent interpretation

### 3. TaskGenerator
- **Hardcoded:** Check git history, filter completed tasks
- **AI-Driven:** Generate new task ideas (via MD analyzer)

### 4. TaskExecutor
- **Hardcoded:** Tool selection, timeout management, output capture
- **AI-Driven:** Code implementation via Claude Code

### 5. ClosedLoopOrchestrator
- **Hardcoded:** State gathering, test execution, feedback analysis
- **AI-Driven:** None (measurement and orchestration)

### 6. GitAutomation
- **Hardcoded:** All git operations (100% hardcoded for safety)
- **AI-Driven:** Commit message generation only

---

## Decision Matrix

| Decision Type | Hardcoded | AI-Decided | Reason |
|---------------|-----------|------------|---------|
| When to commit | ✅ | ❌ | Safety: avoid accidental commits |
| What to commit | ❌ | ✅ | Content: AI writes the code |
| Branch naming | ✅ | ❌ | Structure: consistent naming |
| Task priority | ✅ | ❌ | Process: based on dependencies |
| Code style | ❌ | ✅ | Content: AI adapts to project |
| Test execution | ✅ | ❌ | Process: run all tests |
| Test content | ❌ | ✅ | Content: AI writes tests |
| Error recovery | ✅ | ❌ | Safety: predefined strategies |
| Feature design | ❌ | ✅ | Content: AI architects |
| Merge strategy | ✅ | ❌ | Safety: fast-forward only |
| File operations | ✅ | ❌ | Safety: controlled by system |
| Documentation | ❌ | ✅ | Content: AI explains code |

---

## Why This Balance Works

### Advantages of Hardcoded Process:
1. **Predictable** - Always follows same workflow
2. **Safe** - Git operations can't go wrong
3. **Fast** - No AI overhead for structure
4. **Debuggable** - Clear execution path
5. **Reliable** - No hallucinations in critical paths

### Advantages of AI Content:
1. **Flexible** - Adapts to any project
2. **Creative** - Finds innovative solutions
3. **Context-Aware** - Understands project specifics
4. **Learning** - Improves with better prompts
5. **Comprehensive** - Can handle complex logic

### The Sweet Spot:
- **Process = Hardcoded** → Ensures system stability
- **Content = AI** → Enables true autonomy
- **Feedback Loop = Hardcoded** → Guarantees learning happens

---

## Integration Points

### Claude Code (AI Content Generator)
- **Input:** Context-rich prompts (hardcoded format)
- **Process:** AI implementation
- **Output:** Code changes (captured by hardcoded system)

### ShinkaEvolve (AI Optimizer)
- **Input:** Code files + evaluation script (hardcoded)
- **Process:** Evolutionary optimization (AI-guided mutations)
- **Output:** Improved code (merged by hardcoded system)

### Spec-Kit (Optional: Semi-AI)
- **Input:** Project goals (AI or human)
- **Process:** Structured requirements (hardcoded templates + AI content)
- **Output:** Task breakdown (used by hardcoded orchestrator)

### Sensors/Actuators (Hardcoded I/O)
- **Sensors:** Git, files, terminal, screenshots (100% hardcoded)
- **Actuators:** File writes, git commits, tests (100% hardcoded)
- **Processing:** AI decides what to do with sensor data

---

## Error Handling Strategy

### Hardcoded Error Recovery:
1. **Git conflicts** → Abort and retry with clean state
2. **Test failures** → Capture output, iterate once, then move on
3. **Timeout** → Kill process, mark as attempted, continue
4. **Missing files** → Skip gracefully, log warning
5. **Syntax errors** → Report to AI in next iteration

### AI-Driven Error Recovery:
1. **Logic bugs** → AI analyzes test output and fixes
2. **Missing features** → AI implements based on requirements
3. **Performance issues** → AI optimizes based on profiling
4. **Documentation gaps** → AI fills in missing docs

---

## Future Enhancements

### More Hardcoded (Process):
- Dependency management automation
- Security vulnerability scanning
- Code style enforcement
- Performance benchmarking
- Resource usage monitoring

### More AI-Driven (Content):
- Multi-agent collaboration (multiple AI instances)
- Web research for best practices
- API documentation generation
- Automated code review comments
- Smart test case generation

---

**Key Takeaway:** The system's reliability comes from hardcoded process orchestration, while its power comes from AI-generated content within that framework.
