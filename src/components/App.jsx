'use client';

import React, { useEffect, useState } from 'react';
import { EMPTY } from '../sudoku-solver.js';
import { deepCopy, DIFFICULTY_CLUES, generatePuzzle } from '../sudoku-core.js';
import { matchesSolution } from '../sudoku-validator.js';
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
    const [hintedCells, setHintedCells] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
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
        setHintedCells([]);
        setHintsUsed(0);
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
        const value = sanitized ? Number.parseInt(sanitized, 10) : EMPTY;
        const board = deepCopy(game.board);
        board[row][col] = value;
        setGame(current => ({ ...current, board }));
        setChecked(false);
        setMessage('');
        if (matchesSolution(board, game.solution)) {
            completeGame(hintsUsed);
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

                const board = deepCopy(game.board);
                board[row][col] = game.solution[row][col];
                const nextHintCount = hintsUsed + 1;
                setGame(current => ({ ...current, board }));
                setHintedCells(current => [...current, `${row}-${col}`]);
                setHintsUsed(nextHintCount);
                setChecked(false);
                setMessage('');
                if (matchesSolution(board, game.solution)) {
                    completeGame(nextHintCount);
                }
                return;
            }
        }
    };

    const checkPuzzle = () => {
        setChecked(true);
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
        <>
            <h1>Sudoku Game</h1>
            <SudokuBoard
                board={game.board}
                solution={game.solution}
                puzzle={game.puzzle}
                hintedCells={hintedCells}
                checked={checked}
                completed={completed}
                onChange={handleCellChange}
            />
            <GameControls
                message={message}
                messageColor={messageColor}
                timer={timer}
                hintsUsed={hintsUsed}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                onNewGame={newGame}
                onHint={hint}
                onCheckPuzzle={checkPuzzle}
            />
        </>
    );
};

export { createGame };
export default App;
