# Sudoku Project Instructions

## Coding Standards
- Use modern JavaScript (ES6+), including arrow functions, destructuring, modules, const, and let.
- Write clean, simple, readable, and maintainable code.
- Follow the DRY and Single Responsibility principles.
- Use meaningful variable and function names.
- Avoid unnecessary complexity and dependencies.
- Add comments only when they explain important or complex logic.

## Architecture
- Use React and Next.js.
- Use functional React components and hooks.
- Separate game logic from UI components.
- Prefer reusable components.
- Use React state instead of direct DOM manipulation.
- Use the `use client` directive only where necessary.

## Game Logic
- Ensure every generated Sudoku puzzle has exactly one solution.
- Keep puzzle generation, solving, and validation separate from the UI.
- Preserve existing functionality during refactoring.
- Handle errors gracefully with clear user messages.

## Testing
- Set up baseline tests before refactoring the legacy code.
- Run existing tests after every major change.
- Do not remove or modify tests just to make them pass.
- Consider edge cases when implementing new features.

## Styling
- Use CSS Modules or another consistent styling approach.
- Support responsive layouts, light mode, and dark mode.
- Use accessible colors and readable controls.

## Development Workflow
- Work on one task at a time.
- Explain the proposed changes before major modifications.
- Avoid modifying unrelated files.
- Explain important implementation decisions.
- Do not implement additional features unless requested.
- Follow the Udacity project requirements.
