'use client';

import React, { useEffect, useState } from 'react';
import { EMPTY } from '../sudoku-solver.js';
import { deepCopy, DIFFICULTY_CLUES, generatePuzzle } from '../sudoku-core.js';
import { matchesSolution } from '../sudoku-validator.js';
import { findSmartHint, getCandidateNumbers } from '../sudoku-strategies.js';
import SudokuBoard from './SudokuBoard.jsx';
import GameControls from './GameControls.jsx';

const createGame = (random, difficulty = 'medium') => {
    const generated = generatePuzzle(DIFFICULTY_CLUES[difficulty], random);
    return {
        board: deepCopy(generated.puzzle),
        puzzle: deepCopy(generated.puzzle),
        solution: deepCopy(generated.solution)
    };
};

const formatTime = elapsedSeconds => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const App = ({ random = Math.random }) => {
    const [difficulty, setDifficulty] = useState('medium');
    const [game, setGame] = useState(() => createGame(random, difficulty));
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState('');
    const [hintExplanation, setHintExplanation] = useState('');
    const [hintedCells, setHintedCells] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [notes, setNotes] = useState({});
    const [noteMode, setNoteMode] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [hintStrategy, setHintStrategy] = useState('');
    const [hintTarget, setHintTarget] = useState(null);
    const [hintRelatedCells, setHintRelatedCells] = useState([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(true);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!timerRunning) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            setElapsedSeconds(current => current + 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timerRunning]);

    const newGame = () => {
        setGame(createGame(random, difficulty));
        setChecked(false);
        setMessage('');
        setHintExplanation('');
        setHintedCells([]);
        setHintsUsed(0);
        setNotes({});
        setNoteMode(false);
        setSelectedNumber(null);
        setSelectedCell(null);
        setHintStrategy('');
        setHintTarget(null);
        setHintRelatedCells([]);
        setElapsedSeconds(0);
        setTimerRunning(true);
        setCompleted(false);
    };

    const completeGame = hintCount => {
        setCompleted(true);
        setTimerRunning(false);
        setMessage(
            `Congratulations! You solved it! Time: ${formatTime(elapsedSeconds)}. ` +
            `Hints used: ${hintCount}.`
        );
    };

    const toggleNote = (row, col, number) => {
        if (game.puzzle[row][col] !== EMPTY || game.board[row][col] !== EMPTY ||
            completed) {
            return;
        }

        const key = `${row}-${col}`;
        setNotes(current => {
            const cellNotes = current[key] ?? [];
            const hasNote = cellNotes.includes(number);
            if (!hasNote && !getCandidateNumbers(game.board, row, col).includes(number)) {
                return current;
            }

            const nextCellNotes = hasNote
                ? cellNotes.filter(value => value !== number)
                : [...cellNotes, number].sort((first, second) => first - second);
            const nextNotes = { ...current };
            if (nextCellNotes.length) {
                nextNotes[key] = nextCellNotes;
            } else {
                delete nextNotes[key];
            }
            return nextNotes;
        });
    };

    const handleCellChange = event => {
        const { target } = event;
        const row = Number(target.dataset.row);
        const col = Number(target.dataset.col);
        if (!Number.isInteger(row) || !Number.isInteger(col) ||
            row < 0 || row > 8 || col < 0 || col > 8 ||
            game.puzzle[row][col] !== EMPTY || completed ||
            hintedCells.includes(`${row}-${col}`)) {
            return;
        }

        const digits = target.value;
        const sanitized = String(digits).replace(/[^1-9]/g, '');
        if (noteMode) {
            if (sanitized) toggleNote(row, col, Number.parseInt(sanitized, 10));
            return;
        }

        const value = sanitized ? Number.parseInt(sanitized, 10) : EMPTY;
        const board = deepCopy(game.board);
        board[row][col] = value;
        setGame(current => ({ ...current, board }));
        setNotes(current => {
            const nextNotes = { ...current };
            delete nextNotes[`${row}-${col}`];
            return nextNotes;
        });
        setChecked(false);
        setMessage('');
        setHintExplanation('');
        setHintStrategy('');
        setHintTarget(null);
        setHintRelatedCells([]);
        if (matchesSolution(board, game.solution)) {
            completeGame(hintsUsed);
        }
    };

    const handleCellSelect = event => {
        const { target } = event;
        const row = Number(target.dataset.row);
        const col = Number(target.dataset.col);
        if (!Number.isInteger(row) || !Number.isInteger(col) ||
            row < 0 || row > 8 || col < 0 || col > 8) {
            return;
        }

        setSelectedCell({ row, col });
        if (game.board[row][col] !== EMPTY) {
            setSelectedNumber(game.board[row][col]);
        }
    };

    const handleNumberSelect = number => {
        setSelectedNumber(number);
        if (noteMode && selectedCell) {
            toggleNote(selectedCell.row, selectedCell.col, number);
        }
    };

    const applyHint = (row, col, number, explanation, strategy, relatedCells = []) => {
        const board = deepCopy(game.board);
        board[row][col] = number;
        const nextHintCount = hintsUsed + 1;
        setGame(current => ({ ...current, board }));
        setHintedCells(current => [...current, `${row}-${col}`]);
        setNotes(current => {
            const nextNotes = { ...current };
            delete nextNotes[`${row}-${col}`];
            return nextNotes;
        });
        setHintsUsed(nextHintCount);
        setHintExplanation(explanation);
        setHintStrategy(strategy);
        setHintTarget(`${row}-${col}`);
        setHintRelatedCells(relatedCells);
        setSelectedNumber(number);
        setChecked(false);
        setMessage('');
        if (matchesSolution(board, game.solution)) {
            completeGame(nextHintCount);
        }
    };

    const hint = () => {
        if (completed) return;

        for (let row = 0; row < game.board.length; row++) {
            for (let col = 0; col < game.board[row].length; col++) {
                if (game.puzzle[row][col] !== EMPTY ||
                    game.board[row][col] === game.solution[row][col]) {
                    continue;
                }
                applyHint(
                    row,
                    col,
                    game.solution[row][col],
                    'This reveals the next solution value.',
                    'Quick Hint'
                );
                return;
            }
        }
    };

    const smartHint = () => {
        if (completed) return;

        let nextMove = findSmartHint(game.board);
        if (!nextMove) {
            for (let row = 0; row < game.board.length && !nextMove; row++) {
                for (let col = 0; col < game.board[row].length; col++) {
                    if (game.puzzle[row][col] === EMPTY &&
                        game.board[row][col] !== game.solution[row][col]) {
                        nextMove = {
                            row,
                            col,
                            number: game.solution[row][col],
                            strategy: 'Solution Reveal',
                            explanation: 'No Naked or Hidden Single is available. This reveals the next solution value.',
                            relatedCells: []
                        };
                        break;
                    }
                }
            }
        }

        if (!nextMove) return;
        applyHint(
            nextMove.row,
            nextMove.col,
            nextMove.number,
            nextMove.explanation,
            nextMove.strategy,
            nextMove.relatedCells
        );
    };

    const checkPuzzle = () => {
        setChecked(true);
        setHintExplanation('');
        setHintStrategy('');
        setHintTarget(null);
        setHintRelatedCells([]);
        if (matchesSolution(game.board, game.solution)) {
            completeGame(hintsUsed);
        } else {
            setMessage('Some cells are incorrect.');
        }
    };

    const timer = formatTime(elapsedSeconds);
    const messageColor = message.startsWith('Congratulations')
        ? '#388e3c'
        : message
            ? '#d32f2f'
            : undefined;

    return (
        <main className="app-shell">
            <header className="app-header">
                <div>
                    <p className="eyebrow">Daily brain training</p>
                    <h1>Sudoku</h1>
                    <p className="app-subtitle">A little focus goes a long way.</p>
                </div>
                <div className="header-chip" aria-label={`${difficulty} difficulty selected`}>
                    <span className="status-dot" />
                    {difficulty} selected
                </div>
            </header>
            <div className="game-layout">
                <section className="board-panel" aria-label="Sudoku puzzle">
                    <div className="panel-heading">
                        <div>
                            <h2>Your puzzle</h2>
                            <p>Select a number to highlight it across the board.</p>
                        </div>
                        <span className="board-size-label">9 × 9</span>
                    </div>
                    <SudokuBoard
                        board={game.board}
                        solution={game.solution}
                        puzzle={game.puzzle}
                        hintedCells={hintedCells}
                        notes={notes}
                        selectedNumber={selectedNumber}
                        hintTarget={hintTarget}
                        hintRelatedCells={hintRelatedCells}
                        checked={checked}
                        completed={completed}
                        onChange={handleCellChange}
                        onSelect={handleCellSelect}
                    />
                </section>
                <GameControls
                    message={message}
                    messageColor={messageColor}
                    hintExplanation={hintExplanation}
                    hintStrategy={hintStrategy}
                    timer={timer}
                    hintsUsed={hintsUsed}
                    difficulty={difficulty}
                    board={game.board}
                    selectedNumber={selectedNumber}
                    noteMode={noteMode}
                    completed={completed}
                    onDifficultyChange={setDifficulty}
                    onNewGame={newGame}
                    onHint={hint}
                    onSmartHint={smartHint}
                    onCheckPuzzle={checkPuzzle}
                    onToggleNoteMode={() => setNoteMode(current => !current)}
                    onNumberSelect={handleNumberSelect}
                />
            </div>
        </main>
    );
};

export { createGame };
export default App;
