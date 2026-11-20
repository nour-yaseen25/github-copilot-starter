import { EMPTY, SIZE } from './sudoku-solver.js';

export const isBoardComplete = board =>
    board.every(row => row.every(value => value !== EMPTY));

export const matchesSolution = (board, solution) =>
    board.every((row, rowIndex) =>
        row.every((value, colIndex) => value === solution[rowIndex][colIndex]));

export const isCellCorrect = (board, solution, row, col) =>
    board[row][col] === solution[row][col];

export const hasValidRowsColumnsAndBoxes = (board) => {
    const groups = [];
    for (let index = 0; index < SIZE; index++) {
        groups.push(board[index]);
        groups.push(board.map(row => row[index]));

        const box = [];
        const boxRow = Math.floor(index / 3) * 3;
        const boxCol = (index % 3) * 3;
        for (let row = boxRow; row < boxRow + 3; row++) {
            for (let col = boxCol; col < boxCol + 3; col++) {
                box.push(board[row][col]);
            }
        }
        groups.push(box);
    }

    return groups.every(group => {
        const filled = group.filter(value => value !== EMPTY);
        return new Set(filled).size === filled.length;
    });
};
