import React from 'react';
import { EMPTY, SIZE } from '../sudoku-solver.js';
import { getConflictingCells } from '../sudoku-validator.js';
import SudokuCell from './SudokuCell.jsx';

const SudokuBoard = ({ board, solution, puzzle, hintedCells, checked, completed, onChange }) => {
    const conflictingCells = getConflictingCells(board);

    return (
            <div id="sudoku-board" onChange={onChange}>
                {Array.from({ length: SIZE }, (_, row) => (
                    <div className="sudoku-row" key={row}>
                        {Array.from({ length: SIZE }, (_, col) => {
                            const prefilled = puzzle[row][col] !== EMPTY;
                            const value = board[row][col];
                            const hinted = hintedCells.includes(`${row}-${col}`);

                            return (
                                <SudokuCell
                                    key={col}
                                    row={row}
                                    col={col}
                                    value={value}
                                    prefilled={prefilled}
                                    hinted={hinted}
                                    locked={completed || hinted}
                                    incorrect={!prefilled && (
                                        (!hinted && conflictingCells.has(`${row}-${col}`)) ||
                                        (checked && value !== solution[row][col])
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
    );
};

export default SudokuBoard;
