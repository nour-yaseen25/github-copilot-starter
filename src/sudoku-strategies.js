import { EMPTY, isSafe, SIZE } from './sudoku-solver.js';

export const getCandidateNumbers = (board, row, col) => {
    if (board[row][col] !== EMPTY) return [];

    return Array.from({ length: SIZE }, (_, index) => index + 1)
        .filter(number => isSafe(board, row, col, number));
};

const getUnits = () => {
    const units = [];
    for (let index = 0; index < SIZE; index++) {
        units.push({
            type: 'row',
            cells: Array.from({ length: SIZE }, (_, offset) => [index, offset])
        });
        units.push({
            type: 'column',
            cells: Array.from({ length: SIZE }, (_, offset) => [offset, index])
        });

        const boxRow = Math.floor(index / 3) * 3;
        const boxCol = (index % 3) * 3;
        const box = [];
        for (let row = boxRow; row < boxRow + 3; row++) {
            for (let col = boxCol; col < boxCol + 3; col++) {
                box.push([row, col]);
            }
        }
        units.push({ type: 'box', cells: box });
    }
    return units;
};

const getPeerCells = (row, col) => {
    const peers = new Set();
    for (let index = 0; index < SIZE; index++) {
        if (index !== col) peers.add(`${row}-${index}`);
        if (index !== row) peers.add(`${index}-${col}`);
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let peerRow = boxRow; peerRow < boxRow + 3; peerRow++) {
        for (let peerCol = boxCol; peerCol < boxCol + 3; peerCol++) {
            if (peerRow !== row || peerCol !== col) {
                peers.add(`${peerRow}-${peerCol}`);
            }
        }
    }
    return [...peers];
};

export const findSmartHint = (board) => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const candidates = getCandidateNumbers(board, row, col);
            if (candidates.length === 1) {
                return {
                    row,
                    col,
                    number: candidates[0],
                    strategy: 'Naked Single',
                    explanation: `Only ${candidates[0]} fits in this cell, making it a Naked Single.`,
                    relatedCells: getPeerCells(row, col)
                };
            }
        }
    }

    for (const unit of getUnits()) {
        for (let number = 1; number <= SIZE; number++) {
            const possibleCells = unit.cells.filter(([row, col]) =>
                board[row][col] === EMPTY &&
                getCandidateNumbers(board, row, col).includes(number));
            if (possibleCells.length === 1) {
                const [row, col] = possibleCells[0];
                return {
                    row,
                    col,
                    number,
                    strategy: 'Hidden Single',
                    explanation: `${number} can go in only this cell in its ${unit.type}, so it is a Hidden Single.`,
                    relatedCells: unit.cells
                        .filter(([peerRow, peerCol]) => peerRow !== row || peerCol !== col)
                        .map(([peerRow, peerCol]) => `${peerRow}-${peerCol}`)
                };
            }
        }
    }

    return null;
};

export const getRemainingNumberCounts = (board) =>
    Array.from({ length: SIZE }, (_, index) => {
        const number = index + 1;
        const placed = board.reduce((total, row) =>
            total + row.filter(value => value === number).length, 0);
        return Math.max(0, SIZE - placed);
    });
