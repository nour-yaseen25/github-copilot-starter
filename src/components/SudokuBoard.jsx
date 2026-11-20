import React from 'react';
import { EMPTY, SIZE } from '../sudoku-solver.js';
import { getConflictingCells } from '../sudoku-validator.js';
import SudokuCell from './SudokuCell.jsx';

const SudokuBoard = ({
    board,
    solution,
    puzzle,
    hintedCells,
    notes,
    selectedNumber,
    hintTarget,
    hintRelatedCells,
    checked,
    completed,
    onChange,
    onSelect
}) => {
    const conflictingCells = getConflictingCells(board);

    return (
        <div id="sudoku-board" onChange={onChange} onClick={onSelect} onFocus={onSelect}>
            {Array.from({ length: SIZE }, (_, row) => (
                <div className="sudoku-row" key={row}>
                    {Array.from({ length: SIZE }, (_, col) => {
                        const cellKey = `${row}-${col}`;
                        const prefilled = puzzle[row][col] !== EMPTY;
                        const value = board[row][col];
                        const hinted = hintedCells.includes(cellKey);

                        return (
                            <SudokuCell
                                key={col}
                                row={row}
                                col={col}
                                value={value}
                                notes={notes[cellKey] ?? []}
                                selectedNumber={selectedNumber}
                                prefilled={prefilled}
                                hinted={hinted}
                                hintTarget={hintTarget === cellKey}
                                hintRelated={hintRelatedCells.includes(cellKey)}
                                highlighted={value !== EMPTY && value === selectedNumber}
                                locked={completed || hinted}
                                incorrect={!prefilled && (
                                    (!hinted && conflictingCells.has(cellKey)) ||
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
