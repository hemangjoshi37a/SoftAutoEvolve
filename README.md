# 🧬 SoftAutoEvolve

**Evolutionary Software Development Platform**

An abstraction layer that harmoniously integrates three powerful tools to create an autonomous, evolutionary software development workflow driven by user feedback and market trends.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

---

## 🎯 What is SoftAutoEvolve?

SoftAutoEvolve is an abstraction layer that integrates three complementary repositories into one seamless workflow:

1. **[Claude Code](https://github.com/anthropics/claude-code)** - AI-powered CLI for code generation and editing
2. **[Spec-Kit](https://github.com/hemangjoshi37a/hjLabs.in-spec-kit)** - Spec-driven development framework for structured task management
3. **[ShinkaEvolve](https://github.com/SakanaAI/ShinkaEvolve)** - Evolutionary algorithms for program optimization

### The Vision

Develop software that evolves to be **as useful as possible** for a given domain with:
- ✅ Stable and working features
- 🎨 Appropriate UI/UX
- 📊 User feedback integration
- 📈 Market trend analysis
- 🧬 Evolutionary optimization

### How It Works

```
┌──────────────┐
│ User Input   │
│ Market Data  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   ShinkaEvolve       │  ◄─── Evolution direction decision
│   (Evolution Logic)  │       based on feedback & trends
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Spec-Kit           │  ◄─── Convert to executable tasks
│   (Task Management)  │       Parallel task handling
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Claude Code        │  ◄─── Actual code implementation
│   (Code Generation)  │       Application interface & edits
└──────────────────────┘
       │
       ▼
   Evolved Software
```

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

# Configure your repository paths
cp .env.example .env
# Edit .env with your repository paths

# Check status
npm run cli status
```

### Repository Setup

You need to have the three integrated repositories cloned. Update your `.env` file:

```bash
# .env
CLAUDE_CODE_PATH=/home/your-user/Documents/GitHub/claude-code
SPEC_KIT_PATH=/home/your-user/Documents/GitHub/hjLabs.in-spec-kit
SHINKA_EVOLVE_PATH=/home/your-user/Documents/GitHub/hjLabs.in-ShinkaEvolve
```

---

## 📖 Usage

### 🗣️ Conversational Mode (Recommended)

The easiest way to use SoftAutoEvolve! Just describe what you want to build in natural language:

```bash
# Start conversational mode
softautoevolve chat

# Or in a specific directory
softautoevolve chat ./my-project

# Or use the shortcut
sae-chat
```

Example conversation:

```
🤖 Assistant: What would you like to build today?

💬 You: I want to build a todo app with drag and drop

🤖 Assistant: What kind of user interface are you thinking about?

💬 You: A modern web app that works on mobile

🤖 Assistant: What are the most important features for your users?

💬 You: Add/delete tasks, mark complete, drag to reorder, sync across devices

... (more questions) ...

📋 Here's what I'm planning to build:
[Shows complete plan]

🤖 Assistant: Does this look good? (yes/no/modify)

💬 You: yes

⚙️  Creating project...
📊 Progress: ████████████████████ 100%

🎉 Your project is ready!
```

**All `/constitution`, `/specify`, `/plan`, `/tasks`, and `/implement` commands are handled automatically!**

[📖 Read the Conversational Mode Guide](./docs/CONVERSATIONAL_MODE.md)

---

### Traditional Mode

For more control, you can use individual commands:

#### Check Integration Status

```bash
softautoevolve status
```

This displays:
- ✅ Which integrations are available
- 📦 Installation status
- 💡 Instructions for missing components

#### Launch Claude Code

```bash
softautoevolve launch
```

#### Initialize Spec-Kit

```bash
# In current directory
softautoevolve init

# Or create new project
softautoevolve init my-awesome-project
```

### Run Full Evolutionary Workflow

```bash
softautoevolve workflow \
  --description "Build a photo gallery app with AI tagging" \
  --tech "React, TypeScript, TailwindCSS, Supabase" \
  --generations 10 \
  --jobs 4
```

This will:
1. Initialize Spec-Kit (if needed)
2. Launch Claude Code for `/constitution`, `/specify`, `/plan`, `/tasks`
3. Run evolutionary optimization with ShinkaEvolve
4. Launch Claude Code for `/implement`

### Run Spec-Kit Workflow Only

```bash
softautoevolve spec-workflow
```

### Run Evolution Only

```bash
softautoevolve evolve \
  --initial ./src/algorithm.py \
  --eval ./evaluate.py \
  --generations 20 \
  --models "gpt-4o-mini,claude-3-sonnet"
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```bash
# Repository Paths
CLAUDE_CODE_PATH=/path/to/claude-code
SPEC_KIT_PATH=/path/to/hjLabs.in-spec-kit
SPEC_KIT_REPO_URL=git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit
SHINKA_EVOLVE_PATH=/path/to/hjLabs.in-ShinkaEvolve

# Python Configuration
PYTHON_PATH=python3
UV_PATH=uv

# Evolution Defaults
DEFAULT_NUM_GENERATIONS=10
DEFAULT_MAX_PARALLEL_JOBS=2
DEFAULT_LLM_MODELS=azure-gpt-4.1-mini

# Feature Flags
ENHANCED_MODE=true
AUTO_INSTALL_DEPS=false
VERBOSE=false
EXPERIMENTAL=false
```

### Configuration Priority

1. Environment variables (`.env` file)
2. System defaults
3. Auto-detection

---

## 🎓 How to Use the Full Workflow

### Step 1: Project Initialization

```bash
cd your-project-directory
softautoevolve init
```

### Step 2: Define Your Vision

When Claude Code launches, use:

```
/constitution Create principles focused on user experience,
              performance, and maintainability
```

### Step 3: Specify Requirements

```
/specify Build a task management app with drag-and-drop kanban boards,
         real-time collaboration, and mobile support
```

### Step 4: Technical Planning

```
/plan Use Next.js 14, React, TypeScript, Prisma, PostgreSQL,
      TailwindCSS, and WebSockets for real-time features
```

### Step 5: Generate Tasks

```
/tasks
```

### Step 6: Let Evolution Guide Implementation

Exit Claude Code, and SoftAutoEvolve will:
- Run evolutionary optimization on your implementation
- Use user feedback and market trends to guide evolution
- Optimize for your specific domain requirements

### Step 7: Implement

Claude Code will launch again for:

```
/implement
```

---

## 🏗️ Architecture

### Directory Structure

```
SoftAutoEvolve/
├── bin/
│   └── softautoevolve.js       # CLI entry point
├── src/
│   ├── config/
│   │   └── config.ts           # Configuration management
│   ├── integrations/
│   │   ├── claude-code-integration.ts
│   │   ├── spec-kit-integration.ts
│   │   ├── shinka-evolve-integration.ts
│   │   └── integration-manager.ts
│   └── index.ts                # Public API exports
├── examples/                   # Usage examples
├── docs/                       # Documentation
├── .env.example               # Example configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Integration Architecture

```typescript
IntegrationManager
├── ClaudeCodeIntegration
│   ├── Auto-detects installation
│   ├── Launches CLI
│   └── Executes commands
├── SpecKitIntegration
│   ├── Manages spec-driven workflow
│   ├── Initializes projects
│   └── Provides slash commands
└── ShinkaEvolveIntegration
    ├── Runs evolutionary algorithms
    ├── Integrates with Spec-Kit tasks
    └── Optimizes implementations
```

---

## 🌟 Features

### 🤖 AI-Powered Development
- Claude Code provides intelligent code generation
- Context-aware suggestions
- Natural language to code

### 📋 Structured Workflow
- Spec-Kit's proven methodology
- Constitution → Specify → Plan → Tasks → Implement
- Clear separation of concerns

### 🧬 Evolutionary Optimization
- ShinkaEvolve's LLM-guided mutations
- Multi-objective optimization
- Parallel evaluation
- Sample-efficient evolution

### 🔗 Seamless Integration
- Automatic repository detection
- Configurable paths
- Status checking
- Installation guidance

### 🎯 Domain-Specific Evolution
- User feedback integration
- Market trend analysis
- Adaptive feature prioritization
- Continuous improvement

---

## 📚 Examples

### Example 1: Photo Gallery App

```bash
softautoevolve workflow \
  --description "Build a photo gallery with AI tagging, albums, and sharing" \
  --tech "Vue 3, Vite, TailwindCSS, Supabase, OpenAI Vision API"
```

### Example 2: E-commerce Platform

```bash
softautoevolve init ecommerce-platform
cd ecommerce-platform
softautoevolve spec-workflow
```

Then in Claude Code:
```
/constitution Focus on security, scalability, and user trust
/specify Complete e-commerce platform with products, cart, checkout, payments
/plan Next.js, Stripe, Prisma, PostgreSQL, Redis
/tasks
/implement
```

### Example 3: Algorithm Optimization

```bash
softautoevolve evolve \
  --initial ./sorting_algorithm.py \
  --eval ./benchmark.py \
  --generations 50 \
  --jobs 8
```

---

## 🛠️ Development

### Build from Source

```bash
git clone https://github.com/hemangjoshi37a/SoftAutoEvolve.git
cd SoftAutoEvolve
npm install
npm run build
```

### Run in Development Mode

```bash
npm run dev  # TypeScript watch mode
```

### Testing

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome! This project aims to create the best abstraction layer for evolutionary software development.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- 🐛 Bug fixes
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization
- 🔌 New integration options

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This project builds upon and integrates:

- **[Claude Code](https://github.com/anthropics/claude-code)** by Anthropic - Revolutionary AI coding assistant
- **[Spec-Kit](https://github.com/github/spec-kit)** by GitHub - Spec-driven development framework
- **[ShinkaEvolve](https://github.com/SakanaAI/ShinkaEvolve)** by Sakana AI - Evolutionary program optimization

Special thanks to:
- The reference implementation in `hjLabs.in-claude-code` that inspired this abstraction
- The open-source community for these incredible tools

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hemangjoshi37a/SoftAutoEvolve/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hemangjoshi37a/SoftAutoEvolve/discussions)
- **Email**: support@hjlabs.in

---

## 🗺️ Roadmap

- [ ] Web UI for workflow visualization
- [ ] Automated market trend analysis
- [ ] User feedback collection system
- [ ] Multi-domain evolution templates
- [ ] Integration with additional AI models
- [ ] Cloud deployment options
- [ ] Collaborative evolution features
- [ ] Analytics and metrics dashboard

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! It helps others discover this tool.

---

<div align="center">

**Built with ❤️ for the future of software development**

[Website](https://hjlabs.in) • [GitHub](https://github.com/hemangjoshi37a/SoftAutoEvolve) • [Documentation](./docs)

</div>