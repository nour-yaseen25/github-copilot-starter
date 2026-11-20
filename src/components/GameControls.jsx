import React from 'react';

const GameControls = ({
    message,
    messageColor,
    difficulty,
    onDifficultyChange,
    onNewGame,
    onCheckSolution
}) => (
    <div className="controls">
        <label className="difficulty-selector" htmlFor="difficulty">
            Difficulty
            <select
                id="difficulty"
                value={difficulty}
                onChange={event => onDifficultyChange(event.target.value)}
            >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </label>
        <button type="button" onClick={onNewGame}>New Game</button>
        <button type="button" onClick={onCheckSolution}>Check Solution</button>
        <span id="message" style={{ color: messageColor }}>{message}</span>
    </div>
);

export default GameControls;
