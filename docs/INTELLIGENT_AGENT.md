# 🧠 Intelligent Agent Mode

## Overview

The **Intelligent Agent Mode** is the most advanced way to use SoftAutoEvolve. It runs continuously like Claude Code but automatically orchestrates all three tools (Claude Code, Spec-Kit, ShinkaEvolve) and makes intelligent decisions about development direction.

## What Makes It Intelligent?

### 1. **Continuous Operation**
- Runs forever until you exit (like Claude Code)
- No stopping after each task
- Maintains context throughout the session

### 2. **Automatic Decision Making**
The agent automatically decides:
- ✅ When to use Spec-Kit for structure
- ✅ When to trigger evolution for optimization
- ✅ How to prioritize features vs bugs
- ✅ When to refactor vs rebuild
- ✅ When to add tests
- ✅ When to optimize performance

### 3. **Intent Detection**
Understands what you want from natural language:
- "I want to build..." → New project workflow
- "Add authentication" → Feature development
- "There's a bug in..." → Bug fix with priority
- "Optimize the queries" → Evolution + optimization
- "Add tests" → Quality improvement
- "Refactor this" → Code restructuring

### 4. **Context Awareness**
Tracks project state:
- Code quality score
- Test coverage
- Bug count
- Feature requests
- Last evolution date
- Current development phase

### 5. **Automatic Tool Selection**
Intelligently chooses tools based on:
- Task complexity
- Current project state
- Code quality metrics
- Development phase
- Historical patterns

## How to Use

### Start the Agent

```bash
# Recommended way
softautoevolve agent

# Or use shortcuts
sae-agent
npm run agent

# In specific directory
softautoevolve agent ./my-project

# With verbose output
softautoevolve agent --verbose
```

### Example Session

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║              🧠 SoftAutoEvolve - Intelligent Development Agent 🧠             ║
║                    Continuous AI-Powered Development                         ║
║    I automatically orchestrate Claude Code, Spec-Kit, and ShinkaEvolve      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📁 Project Directory: /home/user/my-project

💡 Quick Tips:
   • Just describe what you want in natural language
   • I'll automatically decide which tools to use
   • Type "status" to see project health
   • Type "help" for more commands
   • Type "exit" to quit

🤖 Intelligent Development Agent Started
   I'll help you build, optimize, and maintain your software.
   Just tell me what you need, and I'll handle the rest.

💬 You: I want to build a task management app

🧠 Agent Decision:
   Intent: new_project
   Action: initialize_project
   Priority: medium
   📋 Using Spec-Kit for structure
   🤖 Using Claude Code for implementation
   💭 Reasoning: Project not initialized - need structured approach

⚙️  Initializing project with structured approach...

🤖 Assistant: ✅ Project initialized! Now let's define what you want to build.

💬 You: It should have drag and drop kanban boards

🧠 Agent Decision:
   Intent: new_feature
   Action: create_specification
   Priority: medium
   📋 Using Spec-Kit for structure
   💭 Reasoning: Complex feature detected - using structured approach

⚙️  Creating structured specification...

🤖 Assistant: I'm creating a detailed specification. Let me ask a few questions...

💬 You: status

📊 Project Status:
   Phase: planning
   Code Quality: 0/100
   Test Coverage: 0%
   Open Bugs: 0
   Feature Requests: 0

💬 You: Add real-time collaboration

🧠 Agent Decision:
   Intent: new_feature
   Action: develop
   Priority: medium
   📋 Using Spec-Kit for structure
   🤖 Using Claude Code for implementation
   💭 Reasoning: Complex feature detected - using structured approach

🤖 Assistant: I understand. Let me help you with that.

✅ Done! The changes have been made.

💬 You: There's a bug in the login

🧠 Agent Decision:
   Intent: bug_fix
   Action: fix_bug
   Priority: high
   🤖 Using Claude Code for implementation
   💭 Reasoning: Bug needs immediate attention

⚙️  Analyzing bug and determining fix strategy...

🤖 Assistant: I'll fix this bug directly.

✅ Done! The bug has been fixed.

💬 You: Optimize the database queries

🧠 Agent Decision:
   Intent: optimize
   Action: optimize_code
   Priority: medium
   🧬 Using Evolution for optimization
   💭 Reasoning: Code optimization benefits from evolutionary approach

⚙️  Running evolutionary optimization...

🤖 Assistant: I'm analyzing your code and evolving optimized versions...

💬 You: exit

🤖 Assistant: 👋 Goodbye! Your progress has been saved.
```

## Commands During Session

### Built-in Commands

```bash
status    # Show project health and metrics
context   # Show current development context
help      # Show all available commands
exit      # Exit the agent (or use quit)
```

### Natural Language Examples

#### Starting a Project
```
"I want to build a recipe sharing app"
"Let's create a blog platform"
"Start a new e-commerce site"
```

#### Adding Features
```
"Add user authentication"
"Implement real-time chat"
"Add payment processing"
"Create an admin dashboard"
```

#### Fixing Bugs
```
"There's a bug in the login page"
"The search isn't working"
"Fix the memory leak"
"The API is returning errors"
```

#### Optimization
```
"Optimize the database queries"
"Make the app faster"
"Improve performance"
"Reduce memory usage"
```

#### Quality Improvements
```
"Add tests"
"Improve test coverage"
"Add documentation"
"Refactor the user module"
```

## Intelligent Behaviors

### Automatic Spec-Kit Usage

The agent uses Spec-Kit when it detects:
- New project initialization
- Complex features (auth, payments, real-time, etc.)
- Multiple related features
- Need for structured planning

### Automatic Evolution Triggers

The agent triggers evolution when:
- Code quality drops below 60%
- Bug count exceeds 5
- Test coverage is below 50%
- 7+ days since last evolution
- User explicitly requests optimization

### Priority System

**High Priority:**
- Security bugs
- Critical bugs
- Production issues
- Data loss risks

**Medium Priority:**
- New features
- Performance issues
- Refactoring
- Test coverage

**Low Priority:**
- Code cleanup
- Documentation
- Minor improvements

## Agent Decision Process

```
User Input
    ↓
Intent Detection
    ↓
Context Analysis
    ↓
Decision Engine
    ├─> Should use Spec-Kit?
    ├─> Should use Evolution?
    ├─> Should use Claude Code?
    └─> What's the priority?
    ↓
Tool Orchestration
    ↓
Execution
    ↓
Continue Loop
```

## Monitoring Project Health

The agent tracks:

### Code Quality (0-100)
- Code organization
- Best practices
- Documentation
- Maintainability

### Test Coverage (0-100%)
- Unit test coverage
- Integration tests
- E2E tests

### Bug Count
- Open bugs
- Critical issues
- Minor issues

### Development Phase
- **Initial**: Starting new project
- **Planning**: Creating specs/plans
- **Implementing**: Active development
- **Optimizing**: Performance work
- **Maintaining**: Bug fixes/improvements

## Advanced Features

### Context Preservation
The agent remembers:
- Your coding style
- Project structure
- Previous decisions
- Feature priorities
- Bug patterns

### Intelligent Suggestions
The agent suggests:
- When to refactor
- When to add tests
- When to optimize
- When to document

### Automatic Quality Gates
The agent ensures:
- Tests pass before features ship
- Code quality stays above threshold
- Security best practices
- Performance benchmarks

## Comparison: Agent vs Other Modes

### Agent Mode (Recommended)
```bash
softautoevolve agent

• Continuous operation
• Automatic decision making
• Intelligent tool selection
• Context awareness
• Priority management
• Quality monitoring
```

### Chat Mode
```bash
softautoevolve chat

• One-time conversation
• Manual approval needed
• Single workflow execution
• Exits when done
```

### Traditional Mode
```bash
softautoevolve launch

• Manual command entry
• Full control
• Requires knowledge of all tools
• No automatic decisions
```

## Tips for Best Results

1. **Be Natural** - Just describe what you want
2. **Trust the Agent** - It makes informed decisions
3. **Check Status** - Use `status` to see health
4. **Provide Feedback** - Tell it when something's wrong
5. **Let It Learn** - The more you use it, the better it gets

## Troubleshooting

### Agent Not Making Good Decisions?

Provide more context:
```
Instead of: "Fix this"
Say: "There's a bug in the login where users can't sign in with Google"
```

### Want to Override a Decision?

Be explicit:
```
"Refactor the user module without using evolution"
"Add tests manually, don't auto-generate"
```

### Agent Too Aggressive with Evolution?

Check your thresholds in `.env`:
```bash
AUTO_EVOLUTION_QUALITY_THRESHOLD=40  # Lower = less aggressive
AUTO_EVOLUTION_BUG_THRESHOLD=10      # Higher = less aggressive
```

## Future Enhancements

Coming soon:
- [ ] Machine learning from your patterns
- [ ] Multi-project context
- [ ] Team collaboration
- [ ] Performance analytics
- [ ] Cost optimization
- [ ] Security scanning
- [ ] Deployment automation

## Examples

See [examples/intelligent-agent-session.md](../examples/intelligent-agent-session.md) for a complete example session.

---

**Ready to try it?**

```bash
softautoevolve agent
```
