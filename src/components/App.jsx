'use client';

import React, { useState } from 'react';
import { EMPTY } from '../sudoku-solver.js';
import { deepCopy, generatePuzzle } from '../sudoku-core.js';
import { matchesSolution } from '../sudoku-validator.js';
import SudokuBoard from './SudokuBoard.jsx';
import GameControls from './GameControls.jsx';

const createGame = random => {
    const generated = generatePuzzle(35, random);
    return {
        board: deepCopy(generated.puzzle),
        puzzle: deepCopy(generated.puzzle),
        solution: deepCopy(generated.solution)
    };
};

const App = ({ random = Math.random }) => {
    const [game, setGame] = useState(() => createGame(random));
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState('');

    const newGame = () => {
        setGame(createGame(random));
        setChecked(false);
        setMessage('');
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
        } else {
            setMessage('Some cells are incorrect.');
        }
    };

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
                onNewGame={newGame}
                onCheckSolution={checkSolution}
            />
        </>
    );
};

export { createGame };
export default App;
