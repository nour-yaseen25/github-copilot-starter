import { createSudokuApp } from './src/sudoku-ui.js';

if (typeof document !== 'undefined') {
    createSudokuApp({ document, window });
}

export { createSudokuApp };