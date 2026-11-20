import React from 'react';
import { EMPTY, SIZE } from '../sudoku-solver.js';
import SudokuCell from './SudokuCell.jsx';

const SudokuBoard = ({ board, solution, puzzle, checked, onChange }) => (
    <div id="sudoku-board">
        {Array.from({ length: SIZE }, (_, row) => (
            <div className="sudoku-row" key={row}>
                {Array.from({ length: SIZE }, (_, col) => {
                    const prefilled = puzzle[row][col] !== EMPTY;
                    const value = board[row][col];

                    return (
                        <SudokuCell
                            key={col}
                            value={value}
                            prefilled={prefilled}
                            incorrect={checked && !prefilled && value !== solution[row][col]}
                            onChange={digits => onChange(row, col, digits)}
                        />
                    );
                })}
            </div>
        ))}
    </div>
);

export default SudokuBoard;
