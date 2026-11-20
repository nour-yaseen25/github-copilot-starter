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

const App = ({ random = Math.random }) => {
    const [difficulty, setDifficulty] = useState('medium');
    const [game, setGame] = useState(() => createGame(random, difficulty));
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState('');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(true);

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
        setElapsedSeconds(0);
        setTimerRunning(true);
    };

    const handleCellChange = (row, col, digits) => {
        const sanitized = String(digits).replace(/[^1-9]/g, '');
        const value = sanitized ? Number.parseInt(sanitized, 10) : EMPTY;

        setGame(current => {
            const board = deepCopy(current.board);
            board[row][col] = value;
            return { ...current, board };
        });
        setChecked(false);
        setMessage('');
    };

    const checkSolution = () => {
        setChecked(true);
        if (matchesSolution(game.board, game.solution)) {
            setMessage('Congratulations! You solved it!');
            setTimerRunning(false);
        } else {
            setMessage('Some cells are incorrect.');
        }
    };

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
                checked={checked}
                onChange={handleCellChange}
            />
            <GameControls
                message={message}
                messageColor={messageColor}
                timer={timer}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                onNewGame={newGame}
                onCheckSolution={checkSolution}
            />
        </>
    );
};

export { createGame };
export default App;
