import React from 'react';

// The board's bubbled handler owns updates; this prevents React's controlled-input warning.
const handleDelegatedChange = () => {};

const SudokuCell = ({
    value,
    prefilled,
    incorrect,
    hinted,
    locked,
    row,
    col
}) => {
    const classNames = ['sudoku-cell'];
    if (prefilled) classNames.push('prefilled');
    if (hinted) classNames.push('hinted');
    if (incorrect) classNames.push('incorrect');

    return (
        <input
            type="text"
            maxLength={1}
            className={classNames.join(' ')}
            value={value === 0 ? '' : String(value)}
            disabled={prefilled || locked}
            onChange={prefilled || locked ? undefined : handleDelegatedChange}
            data-row={row}
            data-col={col}
        />
    );
};

export default SudokuCell;
