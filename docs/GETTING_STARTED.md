# Getting Started with SoftAutoEvolve

This guide will help you set up and start using SoftAutoEvolve for evolutionary software development.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Your First Workflow](#your-first-workflow)
4. [Understanding the Components](#understanding-the-components)
5. [Troubleshooting](#troubleshooting)

## Installation

### Step 1: Install Prerequisites

#### Node.js (>= 18.0.0)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

#### Python 3.11+

```bash
# Ubuntu/Debian
sudo apt install python3.11 python3.11-venv

# macOS (using Homebrew)
brew install python@3.11

# Verify
python3.11 --version
```

#### uv (Python package manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/hemangjoshi37a/SoftAutoEvolve.git
cd SoftAutoEvolve
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Build TypeScript

```bash
npm run build
```

### Step 5: Clone Required Repositories

You need to clone the three integrated repositories:

```bash
cd ~/Documents/GitHub

# Claude Code
git clone https://github.com/anthropics/claude-code.git

# Spec-Kit
git clone https://github.com/hemangjoshi37a/hjLabs.in-spec-kit.git

# ShinkaEvolve
git clone https://github.com/SakanaAI/ShinkaEvolve.git
```

Alternatively, use your custom paths specified in `.env`.

## Configuration

### Step 1: Create .env File

```bash
cd SoftAutoEvolve
cp .env.example .env
```

### Step 2: Edit Configuration

Edit `.env` with your repository paths:

```bash
CLAUDE_CODE_PATH=/home/your-user/Documents/GitHub/claude-code
SPEC_KIT_PATH=/home/your-user/Documents/GitHub/hjLabs.in-spec-kit
SHINKA_EVOLVE_PATH=/home/your-user/Documents/GitHub/ShinkaEvolve
```

### Step 3: Verify Installation

```bash
npm run cli status
```

This will show you which components are available and provide installation instructions for any missing pieces.

## Your First Workflow

Let's build a simple todo app using the full evolutionary workflow.

### Step 1: Create Project Directory

```bash
mkdir my-todo-app
cd my-todo-app
```

### Step 2: Initialize Spec-Kit

```bash
softautoevolve init
```

This creates the `.specify` and `.claude` directories with all necessary templates.

### Step 3: Launch Claude Code

```bash
softautoevolve launch
```

### Step 4: Create Constitution

In Claude Code, run:

```
/constitution Create principles focused on simplicity, user experience,
              and clean code. Emphasize accessibility and mobile-first design.
```

### Step 5: Specify Requirements

```
/specify Build a todo app with the following features:
- Add, edit, delete tasks
- Mark tasks as complete/incomplete
- Filter by status (all, active, completed)
- Persist data locally
- Clean, minimal UI
- Keyboard shortcuts for power users
```

### Step 6: Clarify (Optional but Recommended)

```
/clarify
```

Answer Claude's questions to refine the specification.

### Step 7: Create Technical Plan

```
/plan Use vanilla JavaScript, HTML5, CSS3. No frameworks.
      Use localStorage for persistence.
      Focus on progressive enhancement and accessibility.
```

### Step 8: Generate Tasks

```
/tasks
```

Review the generated tasks and make any adjustments.

### Step 9: Exit for Evolution

Exit Claude Code (Ctrl+D or type `exit`).

SoftAutoEvolve will now:
- Run evolutionary optimization (if configured)
- Use the generated tasks as fitness criteria
- Evolve better implementation approaches

### Step 10: Implement

Claude Code will launch again. Run:

```
/implement
```

Watch as Claude executes each task systematically.

### Step 11: Test and Iterate

```bash
# Open the app in your browser
open index.html

# If you find issues, return to Claude Code and iterate
softautoevolve launch
```

## Understanding the Components

### Claude Code

- **Purpose**: AI-powered code generation and editing
- **Capabilities**:
  - Understands natural language
  - Generates complete implementations
  - Edits existing code intelligently
  - Runs terminal commands

### Spec-Kit

- **Purpose**: Structured development workflow
- **Capabilities**:
  - Constitution: Project principles
  - Specify: Requirement gathering
  - Plan: Technical architecture
  - Tasks: Actionable breakdown
  - Implement: Execution framework

### ShinkaEvolve

- **Purpose**: Evolutionary program optimization
- **Capabilities**:
  - LLM-guided code mutations
  - Multi-objective fitness evaluation
  - Parallel candidate evaluation
  - Archive of successful solutions

## Troubleshooting

### Claude Code Not Found

**Problem**: `Claude Code not available`

**Solution**:
```bash
npm install -g @anthropic-ai/claude-code
# OR set CLAUDE_CLI_PATH in .env
```

### Spec-Kit Initialization Fails

**Problem**: `uvx not available`

**Solution**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Restart your terminal
```

### ShinkaEvolve Not Detected

**Problem**: `ShinkaEvolve not found`

**Solution**:
```bash
cd ~/Documents/GitHub/ShinkaEvolve
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e .
```

### Module Not Found Errors

**Problem**: TypeScript import errors

**Solution**:
```bash
cd SoftAutoEvolve
npm run build
```

### Permission Errors

**Problem**: Cannot execute `softautoevolve`

**Solution**:
```bash
chmod +x bin/softautoevolve.js
```

## Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md)
- Explore [Examples](../examples/)
- Check out [Advanced Configuration](./CONFIGURATION.md)
- Join our [Community](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)

## Need Help?

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/hemangjoshi37a/SoftAutoEvolve/issues)
- 💬 [Discussions](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)
