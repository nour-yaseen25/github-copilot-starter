import React from 'react';
import { EMPTY, SIZE } from '../sudoku-solver.js';
import SudokuCell from './SudokuCell.js';

const SudokuBoard = ({ board, solution, puzzle, checked, onChange }) => (
    React.createElement(
        'div',
        { id: 'sudoku-board' },
        Array.from({ length: SIZE }, (_, row) =>
            React.createElement(
                'div',
                { className: 'sudoku-row', key: row },
                Array.from({ length: SIZE }, (_, col) => {
                    const prefilled = puzzle[row][col] !== EMPTY;
                    const value = board[row][col];

                    return React.createElement(SudokuCell, {
                        key: col,
                        value,
                        prefilled,
                        incorrect: checked && !prefilled && value !== solution[row][col],
                        onChange: digits => onChange(row, col, digits)
                    });
                })
            )
        )
    )
);

export default SudokuBoard;
