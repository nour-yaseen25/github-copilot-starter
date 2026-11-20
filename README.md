# Sudoku Game with React

This project is a simple Sudoku game built with React and Next.js. It includes
unique puzzle generation, live entry validation, hints, and puzzle completion
tracking.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Dependencies

- Modern web browser (Chrome, Firefox, Edge, etc.)
- Node.js 20.9 or newer
- React and Next.js for the application and development server

### Installation

1. Fork this repository to your GitHub account. Use the "Fork" button on the top right corner of the repository page.
2. Clone your forked repository to your local machine.
3. Install dependencies and start the development server.

```bash
git clone https://github.com/your-username/<<name of your forked repo>>.git
cd <<name of your forked repo>>
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Tests

Run the baseline tests with:

```bash
npm test
```

## Implementation

- Functional React components and hooks
- A valid 9-by-9 puzzle with a unique solution
- Easy (45 clues), Medium (35 clues), and Hard (30 clues) puzzle difficulty selection
- New Game, Hint, and Check Puzzle controls
- Digit-only editable cells
- Live row, column, and box conflict highlighting
- Locked, distinctly highlighted hints and hint usage tracking
- Automatic completion detection with elapsed time and hint count
- Existing application styling in `styles.css`

## Built With

- [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) - Markup for the game interface
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - Styling for the game board and controls
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Game logic and board generation
- [React](https://react.dev/) - Component-based UI and state management
- [Next.js](https://nextjs.org/) - App Router, development server, and production build

## License

[License](LICENSE.txt)
