import React from 'react';

const GameControls = ({ message, messageColor, onNewGame, onCheckSolution }) => (
    <div className="controls">
        <button type="button" onClick={onNewGame}>New Game</button>
        <button type="button" onClick={onCheckSolution}>Check Solution</button>
        <span id="message" style={{ color: messageColor }}>{message}</span>
    </div>
);

export default GameControls;
