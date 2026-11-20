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

export const getConflictingCells = (board) => {
    const conflictingCells = new Set();
    const groups = [];

    for (let index = 0; index < SIZE; index++) {
        groups.push(board[index].map((value, col) => ({ value, row: index, col })));
        groups.push(board.map((row, rowIndex) => ({
            value: row[index],
            row: rowIndex,
            col: index
        })));

        const box = [];
        const boxRow = Math.floor(index / 3) * 3;
        const boxCol = (index % 3) * 3;
        for (let row = boxRow; row < boxRow + 3; row++) {
            for (let col = boxCol; col < boxCol + 3; col++) {
                box.push({ value: board[row][col], row, col });
            }
        }
        groups.push(box);
    }

    for (const group of groups) {
        const cellsByValue = new Map();
        for (const cell of group) {
            if (cell.value === EMPTY) continue;
            const cells = cellsByValue.get(cell.value) ?? [];
            cells.push(cell);
            cellsByValue.set(cell.value, cells);
        }

        for (const cells of cellsByValue.values()) {
            if (cells.length < 2) continue;
            for (const { row, col } of cells) {
                conflictingCells.add(`${row}-${col}`);
            }
        }
    }

    return conflictingCells;
};
