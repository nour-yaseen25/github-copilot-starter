import { EMPTY, SIZE } from './sudoku-solver.js';
import { deepCopy, generatePuzzle } from './sudoku-core.js';
import { isCellCorrect } from './sudoku-validator.js';

export const createSudokuApp = ({ document, window, random = Math.random }) => {
    let board = [];
    let solution = [];

    const renderBoard = () => {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < SIZE; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'sudoku-row';

            for (let col = 0; col < SIZE; col++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.className = 'sudoku-cell';

                if (board[row][col] !== EMPTY) {
                    input.value = board[row][col];
                    input.disabled = true;
                    input.className += ' prefilled';
                } else {
                    input.value = '';
                    input.oninput = () => {
                        const digits = input.value.replace(/[^1-9]/g, '');
                        input.value = digits;
                        board[row][col] = digits ? Number.parseInt(digits, 10) : EMPTY;
                        input.className = 'sudoku-cell';
                    };
                }

                rowElement.appendChild(input);
            }

            boardElement.appendChild(rowElement);
        }
    };

    const checkSolution = () => {
        let correct = true;
        const boardElement = document.getElementById('sudoku-board');
        const cells = boardElement.getElementsByTagName('input');

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = (row * SIZE) + col;
                if (!isCellCorrect(board, solution, row, col)) {
                    cells[index].className = 'sudoku-cell incorrect';
                    correct = false;
                } else if (!cells[index].disabled) {
                    cells[index].className = 'sudoku-cell';
                }
            }
        }

        const message = document.getElementById('message');
        if (correct) {
            message.style.color = '#388e3c';
            message.innerHTML = 'Congratulations! You solved it!';
        } else {
            message.style.color = '#d32f2f';
            message.innerHTML = 'Some cells are incorrect.';
        }
    };

    const newGame = () => {
        const generated = generatePuzzle(35, random);
        board = deepCopy(generated.puzzle);
        solution = deepCopy(generated.solution);
        renderBoard();
        document.getElementById('message').innerHTML = '';
    };

    if (window) {
        window.newGame = newGame;
        window.checkSolution = checkSolution;
    }

    newGame();
    return { newGame, checkSolution };
};
