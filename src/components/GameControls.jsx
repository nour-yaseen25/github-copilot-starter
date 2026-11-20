import React from 'react';
import { getRemainingNumberCounts } from '../sudoku-strategies.js';

const GameControls = ({
    message,
    messageColor,
    hintExplanation,
    hintStrategy,
    timer,
    hintsUsed,
    difficulty,
    board,
    selectedNumber,
    noteMode,
    completed,
    onDifficultyChange,
    onNewGame,
    onHint,
    onSmartHint,
    onCheckPuzzle,
    onToggleNoteMode,
    onNumberSelect
}) => {
    const remainingCounts = getRemainingNumberCounts(board);

    return (
        <aside className="game-controls" aria-label="Game controls">
            <section className="status-card" aria-label="Game status">
                <div className="status-metric">
                    <span className="metric-label">Time</span>
                    <strong id="timer" aria-label="Elapsed time">{timer}</strong>
                </div>
                <div className="status-divider" />
                <div className="status-metric">
                    <span className="metric-label">Hints used</span>
                    <strong id="hints-used">{hintsUsed}</strong>
                </div>
            </section>

            <section className="control-section" aria-labelledby="game-section-title">
                <div className="section-heading">
                    <div>
                        <h2 id="game-section-title">Game</h2>
                        <p>Set up or check your puzzle.</p>
                    </div>
                </div>
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
                <div className="button-row">
                    <button className="button-primary" type="button" onClick={onNewGame}>
                        New Game
                    </button>
                    <button className="button-secondary" type="button" onClick={onCheckPuzzle}>
                        Check Puzzle
                    </button>
                </div>
                <p id="message" className="game-message" style={{ color: messageColor }} role="status">
                    {message}
                </p>
            </section>

            <section className="control-section number-tools" aria-labelledby="number-section-title">
                <div className="section-heading">
                    <div>
                        <h2 id="number-section-title">Number guide</h2>
                        <p>Choose a digit to highlight it and see how many remain.</p>
                    </div>
                </div>
                <div className="number-selector" aria-label="Number highlighting and remaining counts">
                    {remainingCounts.map((count, index) => {
                        const number = index + 1;
                        const complete = count === 0;
                        return (
                            <button
                                type="button"
                                key={number}
                                className={[
                                    'number-option',
                                    selectedNumber === number ? 'selected-number' : '',
                                    complete ? 'number-complete' : ''
                                ].filter(Boolean).join(' ')}
                                aria-label={`Number ${number}, ${count} remaining`}
                                aria-pressed={selectedNumber === number}
                                onClick={() => onNumberSelect(number)}
                            >
                                <span className="number-value">{number}</span>
                                <span className="number-count">{complete ? 'Complete' : `${count} left`}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="control-section note-tools" aria-labelledby="notes-section-title">
                <div className="section-heading">
                    <div>
                        <h2 id="notes-section-title">Pencil marks</h2>
                        <p>Select an empty cell, then enter or choose candidates.</p>
                    </div>
                </div>
                <button
                    className={`button-secondary note-toggle${noteMode ? ' is-active' : ''}`}
                    type="button"
                    onClick={onToggleNoteMode}
                    aria-pressed={noteMode}
                    disabled={completed}
                >
                    {noteMode ? 'Note Mode: On' : 'Note Mode: Off'}
                </button>
            </section>

            <section className="control-section hint-tools" aria-labelledby="hints-section-title">
                <div className="section-heading">
                    <div>
                        <h2 id="hints-section-title">Need a nudge?</h2>
                        <p>Get a quick answer or a strategy-based hint.</p>
                    </div>
                </div>
                <div className="button-row">
                    <button className="button-secondary" type="button" onClick={onHint} disabled={completed}>
                        Hint
                    </button>
                    <button className="button-primary" type="button" onClick={onSmartHint} disabled={completed}>
                        Smart Hint
                    </button>
                </div>
                {hintExplanation && (
                    <div className="hint-explanation" role="status">
                        <span className="strategy-pill">{hintStrategy}</span>
                        <p id="hint-explanation" data-strategy={hintStrategy}>
                            {hintExplanation}
                        </p>
                    </div>
                )}
            </section>
        </aside>
    );
};

export default GameControls;
