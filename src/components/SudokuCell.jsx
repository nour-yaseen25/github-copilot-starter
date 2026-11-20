import React from 'react';

// The board's bubbled handler owns updates; this prevents React's controlled-input warning.
const handleDelegatedChange = () => {};

const SudokuCell = ({
    value,
    notes,
    selectedNumber,
    prefilled,
    incorrect,
    hinted,
    highlighted,
    hintTarget,
    hintRelated,
    locked,
    row,
    col
}) => {
    const classNames = ['sudoku-cell'];
    if (prefilled) classNames.push('prefilled');
    if (hinted) classNames.push('hinted');
    if (incorrect) classNames.push('incorrect');
    if (highlighted) classNames.push('number-highlighted');
    if (notes.length > 0) classNames.push('notes-visible');
    if (hintTarget) classNames.push('hint-target');
    if (hintRelated) classNames.push('hint-related');

    return (
        <div className="sudoku-cell-wrapper">
            {value === 0 && notes.length > 0 && (
                <div className="cell-notes" aria-label={`Notes: ${notes.join(', ')}`}>
                    {Array.from({ length: 9 }, (_, index) => (
                        <span
                            key={index}
                            className={
                                notes.includes(index + 1) && selectedNumber === index + 1
                                    ? 'candidate-highlighted'
                                    : ''
                            }
                            aria-hidden="true"
                        >
                            {notes.includes(index + 1) ? index + 1 : ''}
                        </span>
                    ))}
                </div>
            )}
            <input
                type="text"
                maxLength={1}
                className={classNames.join(' ')}
                value={value === 0 ? '' : String(value)}
                disabled={prefilled || locked}
                onChange={prefilled || locked ? undefined : handleDelegatedChange}
                data-row={row}
                data-col={col}
                aria-label={`Row ${row + 1}, column ${col + 1}`}
            />
        </div>
    );
};

export default SudokuCell;
