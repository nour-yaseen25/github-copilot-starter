import React from 'react';

const SudokuCell = ({
    value,
    prefilled,
    incorrect,
    onChange
}) => {
    const classNames = ['sudoku-cell'];
    if (prefilled) classNames.push('prefilled');
    if (incorrect) classNames.push('incorrect');

    return React.createElement('input', {
        type: 'text',
        maxLength: 1,
        className: classNames.join(' '),
        value: prefilled ? (value === 0 ? '' : String(value)) : (value === 0 ? '' : String(value)),
        disabled: prefilled,
        onChange: prefilled ? undefined : event => onChange(event.target.value)
    });
};

export default SudokuCell;
