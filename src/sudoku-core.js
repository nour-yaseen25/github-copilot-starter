import { countSolutions, EMPTY, isSafe, SIZE } from './sudoku-solver.js';

export const deepCopy = board => board.map(row => [...row]);

export const createEmptyBoard = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));

const shuffledNumbers = (random) => {
    const numbers = Array.from({ length: SIZE }, (_, index) => index + 1);
    for (let index = numbers.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(random() * (index + 1));
        [numbers[index], numbers[randomIndex]] = [numbers[randomIndex], numbers[index]];
    }
    return numbers;
};

export const fillBoard = (board, random = Math.random) => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === EMPTY) {
                for (const number of shuffledNumbers(random)) {
                    if (isSafe(board, row, col, number)) {
                        board[row][col] = number;
                        if (fillBoard(board, random)) return true;
                        board[row][col] = EMPTY;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

export const generatePuzzle = (clues = 35, random = Math.random) => {
    const solution = createEmptyBoard();
    fillBoard(solution, random);
    const puzzle = deepCopy(solution);
    const positions = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            positions.push([row, col]);
        }
    }

    for (let index = positions.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(random() * (index + 1));
        [positions[index], positions[randomIndex]] = [positions[randomIndex], positions[index]];
    }

    let remainingClues = SIZE * SIZE;
    for (const [row, col] of positions) {
        if (remainingClues <= clues) break;
        const removedValue = puzzle[row][col];
        puzzle[row][col] = EMPTY;
        if (countSolutions(puzzle, 2) === 1) {
            remainingClues--;
        } else {
            puzzle[row][col] = removedValue;
        }
    }

    return { puzzle, solution };
};
