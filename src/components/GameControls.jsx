import React from 'react';

const GameControls = ({
    message,
    messageColor,
    timer,
    hintsUsed,
    difficulty,
    onDifficultyChange,
    onNewGame,
    onHint,
    onCheckPuzzle
}) => (
    <div className="controls">
        <span id="timer" aria-label="Elapsed time">{timer}</span>
        <span id="hints-used">Hints used: {hintsUsed}</span>
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
        <button type="button" onClick={onHint}>Hint</button>
        <button type="button" onClick={onCheckPuzzle}>Check Puzzle</button>
        <span id="message" style={{ color: messageColor }}>{message}</span>
    </div>
);

export default GameControls;
