import React from 'react';

const GameControls = ({ message, messageColor, onNewGame, onCheckSolution }) => (
    React.createElement(
        'div',
        { className: 'controls' },
        React.createElement('button', { type: 'button', onClick: onNewGame }, 'New Game'),
        React.createElement('button', { type: 'button', onClick: onCheckSolution }, 'Check Solution'),
        React.createElement('span', { id: 'message', style: { color: messageColor } }, message)
    )
);

export default GameControls;
