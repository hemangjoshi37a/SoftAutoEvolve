# Simple Workflow Example

This example demonstrates the basic SoftAutoEvolve workflow.

## Scenario

Build a simple calculator web application.

## Step-by-Step Guide

### 1. Create Project Directory

```bash
mkdir calculator-app
cd calculator-app
```

### 2. Initialize SoftAutoEvolve

```bash
softautoevolve init
```

### 3. Launch and Create Constitution

```bash
softautoevolve launch
```

In Claude Code:

```
/constitution Focus on simplicity, accessibility, and clean design.
              Emphasize keyboard support and responsive layout.
```

### 4. Specify Requirements

```
/specify Build a web-based calculator with:
- Basic operations: +, -, *, /
- Clear and backspace functions
- Keyboard input support
- Clean, modern UI
- Responsive design for mobile and desktop
- Display current expression and result
```

### 5. Clarify Requirements

```
/clarify
```

Answer questions about:
- Exact keyboard bindings
- Error handling approach
- Visual feedback for operations
- History of calculations (if needed)

### 6. Create Technical Plan

```
/plan Use HTML5, CSS3, and vanilla JavaScript.
      No external dependencies.
      CSS Grid for layout.
      Event delegation for button clicks.
      LocalStorage for calculation history (optional).
```

### 7. Generate Tasks

```
/tasks
```

Review the task breakdown. Should include:
- HTML structure
- CSS styling
- JavaScript logic
- Keyboard event handling
- Testing and validation

### 8. Implement

```
/implement
```

Claude will:
- Create `index.html`
- Create `styles.css`
- Create `calculator.js`
- Set up event handlers
- Implement calculation logic
- Add keyboard support

### 9. Test

```bash
# Open in browser
open index.html

# Try calculations
# Test keyboard input
# Verify responsive design
```

### 10. Iterate (Optional)

If you want to add evolutionary optimization:

```bash
# Exit Claude Code
# SoftAutoEvolve can now run evolution

softautoevolve evolve \
  --initial ./calculator.js \
  --eval ./test-calculator.py \
  --generations 10
```

## Expected Output

```
calculator-app/
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   ├── specs/
│   │   └── 001-calculator/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── tasks.md
│   └── templates/
├── .claude/
│   └── commands/
├── index.html
├── styles.css
└── calculator.js
```

## Tips

1. **Be Specific**: The more specific your requirements, the better the output
2. **Use Clarify**: Don't skip the `/clarify` step - it helps refine the spec
3. **Review Tasks**: Before `/implement`, review the task breakdown
4. **Iterate**: You can always go back and refine specs or plans

## Next Steps

- Add scientific calculator functions
- Implement calculation history
- Add dark/light theme toggle
- Create unit tests
- Deploy to GitHub Pages
