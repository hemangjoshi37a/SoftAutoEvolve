# 🧬 SoftAutoEvolve

> **Autonomous AI-Powered Software Development Platform** - Build, Evolve, and Optimize Software Automatically

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-Claude%20%7C%20GPT-orange)](https://www.anthropic.com/)
[![Evolutionary](https://img.shields.io/badge/Evolutionary-Algorithms-purple)](https://github.com/SakanaAI/ShinkaEvolve)

**The world's first fully autonomous AI development agent** that combines Claude Code, Spec-Kit, and ShinkaEvolve to build, test, optimize, and evolve software automatically - while you sleep!

[🚀 Quick Start](#-quick-start) • [📖 Documentation](./docs) • [🤖 Autonomous Mode](#-autonomous-mode-new) • [💡 Examples](#-examples) • [⭐ Star Us](#-star-this-repo)

## 🎉 Latest Updates

### v3.6 - Finally Working Edition (NEW!) ✨
- ✅ **Claude Code Actually Works!** - Complete rewrite using timeout command + pipe
- 🎯 **52% Less Code** - Simplified from 140 lines to 67 lines
- ⚡ **100% Reliable** - No more hanging, no more timeouts, just works!
- 🧹 **Clean Execution** - Simple execAsync with proper error handling
- 🧪 **Tested & Proven** - Working perfectly in CodeScope directory
- 📖 **[Full v3.6 Changelog](./IMPROVEMENTS_v3.6.md)**

### v3.5 - Sensors & Actuators Edition 📥📤
- 🔧 **Fixed Claude Code Hanging** - No more timeouts! Clean 3-second exit with proper signals
- 📥 **Sensors (Input)** - Screen, browser, OCR for perceiving environment
- 📤 **Actuators (Output)** - Keyboard, mouse, window management for changing environment
- ✅ **Fixed Capability Detection** - xdotool, wmctrl, browser all working correctly
- 🎯 **Conceptual Clarity** - Proper robotics terminology for closed-loop system
- 📖 **[Full v3.5 Changelog](./IMPROVEMENTS_v3.5.md)**

### v3.4 - Closed-Loop Sensory Edition 🎮
- 👁️ **Visual Feedback** - Screen capture, window management, and screenshot analysis
- ⌨️🖱️ **Keyboard/Mouse Control** - Full X11/Xorg automation with xdotool
- 🌐 **Browser Automation** - Test web applications with real browser interaction
- 🧪 **Closed-Loop Testing** - Verify implementations with visual feedback
- 🤖 **Actiona Integration** - Complex automation scenarios
- 📊 **OCR Analysis** - Extract and verify text from screenshots
- 💬 **Fixed Claude Code Output** - Now shows all output reliably
- 📖 **[Full v3.4 Changelog](./IMPROVEMENTS_v3.4.md)**

### v3.3 - Stability & Intelligence Edition 🔧
- 🔧 **Critical: Fixed Process Hanging** - Intelligent inactivity detection replaces fixed 5s timeout
- 📺 **Complete Output Capture** - Shows ALL Claude Code output, no more premature cutoffs
- 🐍 **Enhanced Python Detection** - Correctly detects Python projects, frameworks (PyQt6), and entry points
- 🎨 **Filtered Error Output** - Removes noise, shows only real errors
- ✅ **Production Ready** - Tested in CodeScope directory, works flawlessly
- 📖 **[Full v3.3 Changelog](./IMPROVEMENTS_v3.3.md)**

### v3.2 - Cyberpunk Edition 🎮
- 🎨 **Complete Cyberpunk UI** - Terminal aesthetics with neon colors and ASCII art
- 👀 **Real-Time Claude Code Output** - See exactly what Claude is doing, no more blind execution
- 🔄 **Intelligent Branch Resume** - Automatically checks and resumes open branches at startup
- 🌈 **Progress Indicators** - Animated cyberpunk-style progress bars and status displays
- 📖 **[Full v3.2 Changelog](./IMPROVEMENTS_v3.2.md)**

### v3.1 - Quality of Life Improvements
- ✅ **Meaningful Branch Names** - No more `auto-1759651327824`! Now generates `feature-add-user-authentication`
- ✅ **Better Project Detection** - TypeScript projects correctly detected, no more "unknown" type
- ✅ **Enhanced Framework Recognition** - Supports @types packages and scoped npm packages
- 📖 **[Full v3.1 Changelog](./IMPROVEMENTS_v3.1.md)**

### v3.0 - Major Feature Release
- 🐳 Docker containerization for safety
- 🌳 Parallel branch execution (3x faster!)
- 🔔 Native OS notifications
- 📚 Markdown documentation analyzer
- 📖 **[Full v3.0 Changelog](./IMPROVEMENTS_v3.0.md)**

---

## 🌟 What Makes SoftAutoEvolve Special?

### 🤖 **Autonomous Mode** (NEW!)

**The most advanced way to develop software - zero human input required!**

```bash
softautoevolve auto    # Start infinite development loop
```

✅ **Fully Automatic** - Generates tasks, writes code, commits, evolves - all automatically
✅ **Infinite Loop** - Runs continuously until your project is complete
✅ **Git Automation** - Auto-creates branches, commits with emojis, merges to main
✅ **Auto-Evolution** - Triggers ShinkaEvolve optimization automatically
✅ **Compact Output** - Clean, non-verbose progress indicators
✅ **Real Development** - Actually builds software, not simulations

**[📖 Read Autonomous Mode Guide](./AUTONOMOUS_MODE.md)**

---

## 🎯 What is SoftAutoEvolve?

SoftAutoEvolve is a revolutionary **evolutionary software development platform** that integrates three powerful AI and evolutionary tools into one seamless, autonomous workflow:

### 🔧 Integrated Tools

| Tool | Purpose | Capability |
|------|---------|------------|
| **[Claude Code](https://github.com/anthropics/claude-code)** | AI Code Generation | Intelligent code writing, editing, and refactoring |
| **[Spec-Kit](https://github.com/hemangjoshi37a/hjLabs.in-spec-kit)** | Structured Development | Spec-driven workflow, task management, planning |
| **[ShinkaEvolve](https://github.com/SakanaAI/ShinkaEvolve)** | Evolutionary Optimization | LLM-guided code evolution and optimization |

### 💡 The Vision

Develop software that **evolves to be as useful as possible** through:
- 🤖 **AI-powered code generation** with Claude
- 📋 **Structured workflows** with Spec-Kit
- 🧬 **Evolutionary optimization** with ShinkaEvolve
- 🔄 **Continuous improvement** via autonomous loops
- 📊 **Quality tracking** with automatic metrics
- 🌳 **Git automation** for full version control

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** 3.11+
- **uv** (Python package manager)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/hemangjoshi37a/SoftAutoEvolve.git
cd SoftAutoEvolve

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally (optional)
echo "12" | sudo -S npm link  # Replace "12" with your password

# Configure repository paths
cp .env.example .env
# Edit .env with your Claude Code, Spec-Kit, and ShinkaEvolve paths
```

### 🎯 Choose Your Mode

#### 1. 🤖 **Autonomous Mode** (Recommended - Fully Automatic)

```bash
# Navigate to your project
cd /path/to/your/project

# Start autonomous development
softautoevolve auto

# Or use shortcuts
sae-auto
npm run auto
```

**What it does:**
- 🎯 Automatically generates tasks based on project analysis
- 🔨 Implements features using Claude Code
- 🧬 Runs evolutionary optimization with ShinkaEvolve
- 📝 Creates Git branches and commits automatically
- 🔄 Merges to main when cycles complete
- ♾️ Repeats infinitely until project is perfect

#### 2. 🎮 **Interactive Agent Mode** (Task-Based)

```bash
softautoevolve agent

# Then add tasks manually:
add task: Create a calculator function
add task: Add unit tests
execute
```

#### 3. 💬 **Conversational Mode** (Guided)

```bash
softautoevolve chat

# Just describe what you want to build in natural language!
```

#### 4. ⚙️ **Traditional Mode** (Full Control)

```bash
softautoevolve status    # Check integrations
softautoevolve init      # Initialize project
softautoevolve launch    # Launch Claude Code
```

---

## 🤖 Autonomous Mode (NEW!)

### How It Works

The autonomous agent runs a **4-phase workflow** infinitely:

```
┌─ Cycle 1 ─────────────────────────────┐
│ 🎯 Phase 1: Planning                   │
│    → Analyze project structure         │
│    → Generate 5 tasks automatically    │
│    → Create feature branch             │
│                                         │
│ 🔨 Phase 2: Implementation             │
│    → Execute tasks with Claude Code    │
│    → Run Spec-Kit for complex features │
│    → Commit after each task            │
│                                         │
│ 🧬 Phase 3: Evolution (AUTOMATIC!)     │
│    → Create evolution branch           │
│    → Run ShinkaEvolve optimization     │
│    → Commit optimized code             │
│                                         │
│ 🔀 Phase 4: Merge & Cleanup            │
│    → Merge to main branch              │
│    → Delete feature branches           │
│    → Update statistics                 │
│                                         │
│ 📊 Stats:                              │
│    Cycles: 1 | Evolution: 1            │
│    Commits: 6 | Tasks: 5               │
└────────────────────────────────────────┘

[Automatically continues to Cycle 2...]
```

### Features

- ✅ **Zero Configuration** - Works out of the box
- ✅ **Intelligent Task Generation** - Analyzes project and creates relevant tasks
- ✅ **Automatic Git Operations** - Branches, commits, merges handled automatically
- ✅ **Evolution Integration** - ShinkaEvolve runs automatically after implementation
- ✅ **Parallel Execution** - Runs multiple tasks concurrently based on priority
- ✅ **Progress Tracking** - Real-time statistics and commit history
- ✅ **Graceful Exit** - Press Ctrl+C to stop safely

### Use Cases

**Bootstrap New Projects:**
```bash
mkdir my-new-app && cd my-new-app
softautoevolve auto
# Generates package.json, README, code, tests, everything!
```

**Improve Existing Projects:**
```bash
cd my-existing-project
softautoevolve auto
# Adds tests, documentation, optimizations automatically!
```

**Continuous Development:**
```bash
nohup softautoevolve auto > dev.log 2>&1 &
# Let it run overnight and wake up to a fully evolved project!
```

---

## 🌟 Key Features

### 🤖 AI-Powered Development
- **Claude Code Integration** - State-of-the-art AI code generation
- **Natural Language Understanding** - Describe features in plain English
- **Context-Aware Suggestions** - Intelligent code completions
- **Automatic Refactoring** - Code improvements suggested automatically

### 📋 Structured Workflow
- **Spec-Kit Integration** - Proven development methodology
- **Constitution → Specify → Plan → Tasks → Implement** workflow
- **Task Management** - Automatic task generation and prioritization
- **Parallel Execution** - Multiple tasks run concurrently

### 🧬 Evolutionary Optimization
- **ShinkaEvolve Integration** - LLM-guided evolutionary algorithms
- **Multi-Objective Optimization** - Quality, performance, maintainability
- **Automatic Triggers** - Evolution runs when quality drops
- **Sample-Efficient** - Fast convergence to optimal solutions

### 🔄 Autonomous Operation
- **Infinite Development Loop** - Runs until project is complete
- **Automatic Task Generation** - No manual planning needed
- **Git Automation** - Full version control without commands
- **Self-Improving** - Gets better with each cycle

### 📊 Quality Tracking
- **Code Quality Metrics** - Tracks quality score (0-100)
- **Test Coverage** - Monitors test coverage percentage
- **Bug Tracking** - Counts and prioritizes bugs
- **Evolution History** - Tracks optimization generations

---

## 📖 Usage Modes Comparison

| Feature | Autonomous | Interactive Agent | Conversational | Traditional |
|---------|-----------|------------------|----------------|------------|
| **Human Input** | Zero | Task descriptions | Natural language | Full control |
| **Automation Level** | 100% | 80% | 60% | 20% |
| **Git Operations** | Automatic | Manual | Manual | Manual |
| **Evolution** | Automatic | Manual trigger | Manual | Manual |
| **Task Generation** | Automatic | Manual | Semi-automatic | Manual |
| **Best For** | Full projects | Specific tasks | Guided building | Expert users |
| **Output** | Compact | Verbose | Conversational | Technical |

---

## 💡 Examples

### Example 1: Build a CLI Tool (Autonomous)

```bash
mkdir awesome-cli
cd awesome-cli
echo "# Awesome CLI Tool" > README.md
softautoevolve auto
```

**Agent automatically:**
1. Creates `package.json` with CLI configuration
2. Implements argument parsing
3. Adds core functionality
4. Writes unit tests
5. Adds help documentation
6. Optimizes with evolution
7. Continues improving...

### Example 2: Add Features to Existing App (Interactive)

```bash
cd my-web-app
softautoevolve agent

# Add tasks:
add task: Implement user authentication with JWT
add task: Add password reset functionality
add task: Create admin dashboard
add task: Add rate limiting
execute
```

### Example 3: Build from Scratch (Conversational)

```bash
softautoevolve chat

🤖: What would you like to build?
💬: A REST API for a blog with posts, comments, and user management

🤖: What technology stack do you prefer?
💬: Node.js, Express, PostgreSQL, TypeScript

[Agent builds entire API automatically...]
```

### Example 4: Optimize Algorithm (Evolution)

```bash
softautoevolve evolve \
  --initial ./sorting_algorithm.py \
  --eval ./benchmark.py \
  --generations 50 \
  --jobs 8
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         SoftAutoEvolve Platform             │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Autonomous Agent                 │  │
│  │  • Task Generation                   │  │
│  │  • Workflow Orchestration            │  │
│  │  • Git Automation                    │  │
│  └──────────────────────────────────────┘  │
│                     │                       │
│         ┌───────────┼───────────┐           │
│         ▼           ▼           ▼           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Claude  │ │ Spec-Kit │ │  Shinka  │   │
│  │   Code   │ │          │ │  Evolve  │   │
│  │          │ │          │ │          │   │
│  │ AI Code  │ │ Workflow │ │Evolution │   │
│  │Generator │ │ Manager  │ │Optimizer │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│         │           │           │           │
│         └───────────┼───────────┘           │
│                     ▼                       │
│         ┌────────────────────┐              │
│         │  Generated Code    │              │
│         │  + Git History     │              │
│         └────────────────────┘              │
└─────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Repository Paths (required)
CLAUDE_CODE_PATH=/path/to/claude-code
SPEC_KIT_PATH=/path/to/hjLabs.in-spec-kit
SHINKA_EVOLVE_PATH=/path/to/hjLabs.in-ShinkaEvolve

# Python Configuration
PYTHON_PATH=python3
UV_PATH=uv

# Evolution Settings
DEFAULT_NUM_GENERATIONS=10
DEFAULT_MAX_PARALLEL_JOBS=2
DEFAULT_LLM_MODELS=azure-gpt-4.1-mini

# Feature Flags
ENHANCED_MODE=true
AUTO_INSTALL_DEPS=false
VERBOSE=false
```

---

## 📚 Documentation

- **[🤖 Autonomous Mode Guide](./AUTONOMOUS_MODE.md)** - Complete guide to autonomous development
- **[🧠 Intelligent Agent](./docs/INTELLIGENT_AGENT.md)** - Interactive task-based development
- **[💬 Conversational Mode](./docs/CONVERSATIONAL_MODE.md)** - Natural language guided development
- **[📖 Getting Started](./docs/GETTING_STARTED.md)** - Detailed setup instructions
- **[🔧 Configuration](./docs/CONFIGURATION.md)** - Advanced configuration options
- **[📝 API Reference](./docs/API.md)** - Programmatic usage

---

## 🛠️ Development

### Build from Source

```bash
git clone https://github.com/hemangjoshi37a/SoftAutoEvolve.git
cd SoftAutoEvolve
npm install
npm run build
```

### Development Mode

```bash
npm run dev    # TypeScript watch mode
npm run agent  # Test agent mode
npm run auto   # Test autonomous mode
```

### Testing

```bash
npm test
npm run lint
npm run format
```

---

## 🤝 Contributing

We welcome contributions! SoftAutoEvolve is open-source and community-driven.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Areas for Contribution

- 🐛 **Bug Fixes** - Report and fix bugs
- ✨ **New Features** - Add new capabilities
- 📚 **Documentation** - Improve guides and examples
- 🧪 **Testing** - Add test coverage
- 🌐 **Internationalization** - Add language support
- 🎨 **UI/UX** - Improve user experience
- ⚡ **Performance** - Optimize code and workflows

---

## 🗺️ Roadmap

### 2024 Q4
- [x] Autonomous development mode
- [x] Git automation
- [x] Task auto-generation
- [x] Docker containers
- [x] Parallel branch execution
- [x] Native OS notifications
- [x] Meaningful branch names
- [x] Real-time Claude Code output
- [x] Intelligent branch resume
- [x] Cyberpunk UI system
- [ ] CodeScope 3D visualization integration
- [ ] Claude Code extension interface

### 2025 Q1
- [ ] Web UI dashboard (Codubhai integration)
- [ ] Browser automation for web app testing
- [ ] MCP tools for computer control
- [ ] Market trend analysis
- [ ] User feedback integration
- [ ] Cloud deployment
- [ ] CI/CD integration

### 2025 Q2
- [ ] Multi-language support (Python, Go, Rust)
- [ ] Plugin system for extensibility
- [ ] API endpoints for remote control
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Real-time code sharing

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built on the shoulders of giants:

- **[Claude Code](https://github.com/anthropics/claude-code)** by Anthropic - Revolutionary AI coding assistant
- **[Spec-Kit](https://github.com/github/spec-kit)** by GitHub - Spec-driven development framework
- **[ShinkaEvolve](https://github.com/SakanaAI/ShinkaEvolve)** by Sakana AI - Evolutionary program optimization

Special thanks to the open-source community and all contributors!

---

## 📞 Support & Community

- 💬 **[GitHub Discussions](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)** - Ask questions, share ideas
- 🐛 **[Issue Tracker](https://github.com/hemangjoshi37a/SoftAutoEvolve/issues)** - Report bugs, request features
- 📧 **Email** - support@hjlabs.in
- 🌐 **Website** - [hjlabs.in](https://hjlabs.in)
- 🐦 **Twitter** - [@hemangjoshi37a](https://twitter.com/hemangjoshi37a)

---

## ⭐ Star This Repo!

If you find SoftAutoEvolve useful, **please give it a star** ⭐! It helps others discover this tool and motivates us to keep improving it.

[![Star History Chart](https://api.star-history.com/svg?repos=hemangjoshi37a/SoftAutoEvolve&type=Date)](https://star-history.com/#hemangjoshi37a/SoftAutoEvolve&Date)

---

## 🚀 Why Choose SoftAutoEvolve?

| Feature | Traditional Development | With SoftAutoEvolve |
|---------|------------------------|---------------------|
| **Setup Time** | Hours to days | Minutes |
| **Code Generation** | Manual typing | AI-powered automatic |
| **Task Management** | Manual planning | Auto-generated tasks |
| **Optimization** | Manual refactoring | Evolutionary algorithms |
| **Git Operations** | Manual commands | Fully automatic |
| **Testing** | Write yourself | Auto-generated tests |
| **Documentation** | Often neglected | Auto-generated |
| **Continuous Improvement** | Rare | Every cycle |
| **Human Effort** | 100% | 0-20% |

---

## 🔥 Get Started Now!

```bash
# Install
git clone https://github.com/hemangjoshi37a/SoftAutoEvolve.git
cd SoftAutoEvolve && npm install && npm run build

# Run autonomous mode
cd /your/project
softautoevolve auto

# That's it! Your AI team is now working for you 🤖
```

---

<div align="center">

### 🧬 Built with ❤️ for the Future of Software Development

**[⭐ Star](https://github.com/hemangjoshi37a/SoftAutoEvolve)** • **[📖 Docs](./docs)** • **[🤝 Contribute](./CONTRIBUTING.md)** • **[💬 Discuss](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)**

**Let AI build your software while you focus on what matters! 🚀**

</div>

---

## 🏷️ Tags

`ai-development` `autonomous-agent` `claude-code` `evolutionary-algorithms` `code-generation` `software-evolution` `typescript` `nodejs` `automation` `devtools` `productivity` `ai-tools` `machine-learning` `code-optimization` `git-automation` `spec-driven-development` `continuous-improvement` `autonomous-coding` `ai-assistant` `developer-tools`
