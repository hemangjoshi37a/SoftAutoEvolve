# 🗣️ Conversational Mode Guide

SoftAutoEvolve's Conversational Mode provides a natural language interface for software development. Simply describe what you want to build, and the system handles all the complex workflow automation internally.

## What is Conversational Mode?

Instead of learning commands like `/constitution`, `/specify`, `/plan`, `/tasks`, and `/implement`, you can just:

1. **Describe your project** in plain English
2. **Answer clarifying questions** naturally
3. **Review and approve** the plan
4. **Watch it build** automatically

All the complex workflow steps are handled internally and automatically!

## Quick Start

### Launch Conversational Mode

```bash
# In your project directory
softautoevolve chat

# Or specify a directory
softautoevolve chat ./my-new-project

# Or use the short command
sae-chat

# With verbose output
softautoevolve chat --verbose
```

### Alternative: Use npm script

```bash
npm run chat
```

## How It Works

### 1. Welcome & Initial Description

When you start, you'll see a welcome message and be asked:

```
💬 You: What would you like to build today? Tell me about your project idea.
```

Just describe your project naturally:

```
I want to build a recipe sharing app where users can post recipes,
rate them, and save their favorites. It should have a clean mobile-first
design.
```

### 2. Clarifying Questions

The assistant will ask questions to understand your needs better:

```
🤖 Assistant: What kind of user interface are you thinking about?
             (e.g., web app, mobile app, desktop app)
```

Answer naturally:

```
💬 You: A responsive web app that works great on mobile
```

The system will ask about:
- User interface type
- Backend preferences (if needed)
- Key features (3-5 most important)
- Specific constraints or requirements

### 3. Technical Preferences

```
🤖 Assistant: Any specific technologies or frameworks you want to use?
             (or press Enter to let me choose the best fit)
```

You can:
- Specify tech stack: `React, Node.js, MongoDB`
- Let the system decide: Just press Enter
- Provide constraints: `No frameworks, vanilla JavaScript only`

### 4. Plan Review

The system generates a comprehensive plan and shows you a summary:

```
📋 Here's what I'm planning to build:

────────────────────────────────────────────────────────────────────────────────

# Recipe Sharing App

## Core Features
- User authentication and profiles
- Recipe posting with images
- Rating system (1-5 stars)
- Favorites collection
- Mobile-first responsive design

## Technical Stack
- Frontend: React with Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT

## Implementation Phases
1. User authentication system
2. Recipe CRUD operations
3. Rating and favorites
4. Mobile optimization

────────────────────────────────────────────────────────────────────────────────

🤖 Assistant: Does this look good? (yes/no/modify) - Type "modify" to make changes
```

### 5. Automatic Implementation

Once you approve, the system:

```
⚙️  Creating project principles...
⚙️  Generating detailed specification...
⚙️  Creating technical implementation plan...
⚙️  Breaking down into actionable tasks...

📊 Progress: ████████████████████ 75%
   Implementing features...

🤖 Assistant: 🎉 Your project is ready! Check out the generated files
             in your project directory.
```

## During the Conversation

### Available Commands

Type these anytime during the conversation:

- `status` - Show current workflow phase
- `help` - Display help information
- `exit` - Exit conversation mode
- `back` - Go back to previous step (if supported)
- `skip` - Skip current question

### Progress Indicators

The system shows progress in multiple ways:

**System Messages:**
```
⚙️  Creating project principles...
```

**Progress Bars:**
```
📊 Progress: ██████████░░░░░░░░░░ 50%
   Implementing features...
```

**Thinking Indicators:**
```
🤔 Thinking...
```

## Example Conversation

Here's a complete example:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      🧬 SoftAutoEvolve - Conversational Mode                  ║
║         Just tell me what you want to build, and I'll handle the rest!       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

💡 Tips:
   • Describe your project in natural language
   • I'll ask clarifying questions as needed
   • You can provide feedback at any time
   • Type "exit" to quit, "help" for assistance

🤖 Assistant: What would you like to build today? Tell me about your project idea.

💬 You: I want to build a simple calculator web app with a clean design

🤖 Assistant: Got it! Let me understand your requirements better.

🤖 Assistant: What kind of user interface are you thinking about?

💬 You: A clean web interface that works on desktop and mobile

🤖 Assistant: What are the most important features for your users?

💬 You: Basic math operations, keyboard support, clear history, and
       a clean modern design

🤖 Assistant: Any specific constraints or requirements?

💬 You: Should work offline and have no external dependencies

🤖 Assistant: Any specific technologies or frameworks you want to use?

💬 You: Just vanilla HTML, CSS, and JavaScript

⚙️  Creating project principles...
⚙️  Generating detailed specification...
⚙️  Creating technical implementation plan...

📋 Here's what I'm planning to build:

────────────────────────────────────────────────────────────────────────────────
# Calculator Web App

## Features
- Basic operations (+, -, *, /)
- Keyboard input support
- Clear and backspace
- Calculation history
- Offline capable

## Tech Stack
- Vanilla JavaScript (ES6+)
- CSS3 with Grid Layout
- HTML5 with Service Worker

────────────────────────────────────────────────────────────────────────────────

🤖 Assistant: Does this look good? (yes/no/modify)

💬 You: yes

⚙️  Breaking down into actionable tasks...

🤖 Assistant: Great! I'll start implementing now. This may take a few minutes...

📊 Progress: ████████████████████ 100%
   Implementation complete!

🤖 Assistant: 🎉 Your project is ready! Check out the generated files
             in your project directory.

📦 Project Summary
═══════════════════════════════════════════════════════════════════════════════

📁 Generated Files:

   Feature: 001-calculator-app
      ✓ constitution.md
      ✓ spec.md
      ✓ plan.md
      ✓ tasks.md

📝 Implementation Files:
   ✓ index.html
   ✓ styles.css
   ✓ calculator.js
   ✓ service-worker.js

💡 Next Steps:
   1. Review the generated code
   2. Test the application
   3. Make any necessary adjustments
   4. Deploy when ready!

═══════════════════════════════════════════════════════════════════════════════

👋 Thanks for using SoftAutoEvolve! Your project progress has been saved.
```

## What Happens Internally?

While you're having a natural conversation, the system:

1. **Analyzes your input** to extract requirements
2. **Automatically generates** a project constitution
3. **Creates specifications** based on your description
4. **Develops a plan** with your tech preferences
5. **Breaks down into tasks** automatically
6. **Implements everything** using Claude Code
7. **Shows you progress** in real-time

You never need to know about `/constitution`, `/specify`, etc. - it's all automatic!

## Tips for Best Results

### Be Descriptive

**Good:**
```
I want to build a task management app with drag-and-drop boards,
real-time collaboration, and mobile support
```

**Less Good:**
```
I want an app
```

### Answer Questions Thoughtfully

The clarifying questions help refine the requirements. Take time to answer them well.

### Review the Plan Carefully

Before implementation starts, review the plan summary. This is your chance to make changes!

### Use "modify" If Needed

If something in the plan isn't quite right:

```
🤖 Assistant: Does this look good? (yes/no/modify)

💬 You: modify

🤖 Assistant: What would you like to change?

💬 You: I don't need user authentication, keep it simple
```

## Troubleshooting

### "Claude Code not available"

Make sure Claude Code is installed:

```bash
npm install -g @anthropic-ai/claude-code
```

### "Spec-Kit integration not available"

Install uv:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Conversation Stuck

Press Ctrl+C to exit and restart:

```bash
# Exit with Ctrl+C
# Then restart
softautoevolve chat
```

### Want to See More Details

Use verbose mode:

```bash
softautoevolve chat --verbose
```

## Comparison: Traditional vs Conversational

### Traditional Mode

```bash
softautoevolve init
softautoevolve launch
# Then manually run:
/constitution ...
/specify ...
/plan ...
/tasks
/implement
```

### Conversational Mode

```bash
softautoevolve chat
# Just describe what you want!
```

## Advanced Usage

### Continue Existing Project

```bash
cd my-existing-project
softautoevolve chat
```

The system detects existing Spec-Kit setup and continues from there.

### Multiple Sessions

You can exit and return:

```bash
softautoevolve chat
# ... conversation ...
# exit

# Later, continue:
softautoevolve chat
```

### Integration with Evolution

After the conversation generates your project, you can run evolution:

```bash
softautoevolve evolve \
  --initial ./src/main.js \
  --eval ./evaluate.py \
  --generations 10
```

## Next Steps

- Try it: `softautoevolve chat`
- See [Examples](../examples/conversational-examples.md)
- Read [Architecture](./ARCHITECTURE.md)
- Join [Discussions](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)
