import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { DIFFICULTY_CLUES, generatePuzzle } from '../src/sudoku-core.js';
import { countSolutions, solveBoard } from '../src/sudoku-solver.js';
import {
    findSmartHint,
    getCandidateNumbers,
    getRemainingNumberCounts
} from '../src/sudoku-strategies.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { default: App } = await import('../src/components/App.jsx');
const renderers = [];

afterEach(() => {
    for (const renderer of renderers) {
        act(() => renderer.unmount());
    }
    renderers.length = 0;
});

const expectedDifficultyClues = {
    easy: 45,
    medium: 35,
    hard: 30
};

function createDeterministicRandom(initialSeed = 123456789) {
    let seed = initialSeed;
    return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}

function createGame() {
    let renderer;
    act(() => {
        renderer = TestRenderer.create(
            React.createElement(App, { random: createDeterministicRandom() })
        );
    });
    renderers.push(renderer);
    return renderer;
}

test('generated puzzles have exactly one solution', () => {
    for (const seed of [1, 42, 123456789, 987654321]) {
        const { puzzle, solution } = generatePuzzle(35, createDeterministicRandom(seed));

        assert.equal(countSolutions(puzzle, 2), 1, `seed ${seed} should produce a unique puzzle`);
        assert.ok(puzzle.every((row, rowIndex) =>
            row.every((value, colIndex) =>
                value === 0 || value === solution[rowIndex][colIndex])));
    }
});

test('difficulty selector supports Easy, Medium, and Hard', () => {
    const renderer = createGame();
    const options = getDifficultySelect(renderer)
        .findAllByType('option')
        .map(option => option.props.value);

    assert.deepEqual(DIFFICULTY_CLUES, expectedDifficultyClues);
    assert.deepEqual(options, Object.keys(expectedDifficultyClues));
});

test('each difficulty generates its expected clue count and one solution', () => {
    for (const [difficulty, clues] of Object.entries(expectedDifficultyClues)) {
        const { puzzle } = generatePuzzle(clues, createDeterministicRandom(42));

        assert.equal(puzzle.flat().filter(Boolean).length, clues, `${difficulty} clue count`);
        assert.equal(countSolutions(puzzle, 2), 1, `${difficulty} should have one solution`);
    }
});

function getCells(renderer) {
    return renderer.root.findAllByType('input');
}

function getRows(renderer) {
    return renderer.root.findAllByProps({ className: 'sudoku-row' });
}

function getBoard(renderer) {
    return renderer.root.findByProps({ id: 'sudoku-board' });
}

function enterCell(renderer, index, value) {
    const cell = getCells(renderer)[index];
    act(() => getBoard(renderer).props.onChange({
        target: {
            dataset: {
                row: cell.props['data-row'],
                col: cell.props['data-col']
            },
            value: String(value)
        }
    }));
}

function getMessage(renderer) {
    return renderer.root.findByProps({ id: 'message' }).children.join('');
}

function getTimer(renderer) {
    return renderer.root.findByProps({ id: 'timer' }).children.join('');
}

function getMessageStyle(renderer) {
    return renderer.root.findByProps({ id: 'message' }).props.style.color;
}

function clickButton(renderer, label) {
    const button = renderer.root.findAllByType('button')
        .find(element => element.children.join('') === label);
    act(() => button.props.onClick());
}

function getDifficultySelect(renderer) {
    return renderer.root.findByProps({ id: 'difficulty' });
}

function assertCluesAreConsistent(cells) {
    const rows = [];
    for (let row = 0; row < 9; row++) {
        rows.push(cells.slice(row * 9, row * 9 + 9));
    }

    const groups = [];
    for (let index = 0; index < 9; index++) {
        groups.push(rows[index]);
        groups.push(rows.map(row => row[index]));
        const box = [];
        const boxRow = Math.floor(index / 3) * 3;
        const boxCol = (index % 3) * 3;
        for (let row = boxRow; row < boxRow + 3; row++) {
            for (let col = boxCol; col < boxCol + 3; col++) {
                box.push(rows[row][col]);
            }
        }
        groups.push(box);
    }

    for (const group of groups) {
        const clues = group
            .map(cell => cell.props.value)
            .filter(Boolean);
        assert.equal(new Set(clues).size, clues.length);
    }
}

test('new game renders a valid 9-by-9 puzzle with 35 clues', () => {
    const renderer = createGame();
    const rows = getRows(renderer);
    const cells = getCells(renderer);

    assert.equal(rows.length, 9);
    assert.equal(cells.length, 81);
    assert.equal(cells.filter(cell => cell.props.disabled).length, 35);
    assert.ok(cells.filter(cell => cell.props.disabled)
        .every(cell => /^[1-9]$/.test(cell.props.value)));
    assert.equal(getMessage(renderer), '');
    assertCluesAreConsistent(cells);

    clickButton(renderer, 'Check Puzzle');
    assert.equal(getMessage(renderer), 'Some cells are incorrect.');
    assert.equal(getMessageStyle(renderer), '#d32f2f');

    clickButton(renderer, 'New Game');
    assert.equal(getCells(renderer).length, 81);
    assert.equal(getMessage(renderer), '');
});

test('new game uses the selected difficulty', () => {
    const renderer = createGame();
    const select = getDifficultySelect(renderer);

    assert.equal(select.props.value, 'medium');
    act(() => select.props.onChange({ target: { value: 'hard' } }));
    clickButton(renderer, 'New Game');

    assert.equal(getDifficultySelect(renderer).props.value, 'hard');
    assert.equal(getCells(renderer).filter(cell => cell.props.disabled).length, 30);
});

test('timer starts, displays elapsed time, resets for a new game, and stops on completion', t => {
    t.mock.timers.enable({ apis: ['setInterval'] });
    const renderer = createGame();

    assert.equal(getTimer(renderer), '00:00');
    act(() => t.mock.timers.tick(61000));
    assert.equal(getTimer(renderer), '01:01');

    clickButton(renderer, 'New Game');
    assert.equal(getTimer(renderer), '00:00');

    act(() => t.mock.timers.tick(1000));
    assert.equal(getTimer(renderer), '00:01');

    const editableCells = getCells(renderer).filter(cell => !cell.props.disabled);
    for (const originalCell of editableCells) {
        const originalIndex = getCells(renderer).indexOf(originalCell);
        for (let value = 1; value <= 9; value++) {
            enterCell(renderer, originalIndex, value);
            clickButton(renderer, 'Check Puzzle');
            if (getCells(renderer)[originalIndex].props.className === 'sudoku-cell') {
                break;
            }
        }
    }

    assert.match(getMessage(renderer), /^Congratulations! You solved it! Time: 00:01\. Hints used: 0\.$/);
    const completedTime = getTimer(renderer);
    act(() => t.mock.timers.tick(3000));
    assert.equal(getTimer(renderer), completedTime);
});

test('editable cells accept only digits 1 through 9 and mark empty cells incorrect', () => {
    const renderer = createGame();
    let editableCell = getCells(renderer).find(cell => !cell.props.disabled);

    enterCell(renderer, getCells(renderer).indexOf(editableCell), 'a0x7');
    editableCell = getCells(renderer).find(cell => !cell.props.disabled);
    assert.equal(editableCell.props.value, '7');

    enterCell(renderer, getCells(renderer).indexOf(editableCell), '0');
    editableCell = getCells(renderer).find(cell => !cell.props.disabled);
    assert.equal(editableCell.props.value, '');

    clickButton(renderer, 'Check Puzzle');
    editableCell = getCells(renderer).find(cell => !cell.props.disabled);
    assert.equal(editableCell.props.className, 'sudoku-cell incorrect');
});

test('check solution congratulates the player when all cells match the solution', () => {
    const renderer = createGame();
    let editableCells = getCells(renderer).filter(cell => !cell.props.disabled);

    for (const originalCell of editableCells) {
        const originalIndex = getCells(renderer).indexOf(originalCell);
        let foundCorrectValue = false;

        for (let value = 1; value <= 9; value++) {
            enterCell(renderer, originalIndex, value);
            clickButton(renderer, 'Check Puzzle');

            const updatedCell = getCells(renderer)[originalIndex];
            if (updatedCell.props.className === 'sudoku-cell') {
                foundCorrectValue = true;
                break;
            }
        }

        assert.ok(foundCorrectValue, 'each editable cell should have a matching solution value');
    }

    clickButton(renderer, 'Check Puzzle');
    assert.match(getMessage(renderer), /^Congratulations! You solved it! Time: \d{2}:\d{2}\. Hints used: 0\.$/);
    assert.equal(getMessageStyle(renderer), '#388e3c');
});

test('board-level input delegation sanitizes edits and highlights row, column, and box conflicts live', () => {
    for (const conflictType of ['row', 'column', 'box']) {
        const renderer = createGame();
        const cells = getCells(renderer);
        const targetIndex = cells.findIndex((cell, index) => {
            if (cell.props.disabled) return false;
            const row = Math.floor(index / 9);
            const col = index % 9;
            return cells.some((peer, peerIndex) => {
                if (!peer.props.disabled || !peer.props.value) return false;
                const peerRow = Math.floor(peerIndex / 9);
                const peerCol = peerIndex % 9;
                if (conflictType === 'row') return peerRow === row;
                if (conflictType === 'column') return peerCol === col;
                return Math.floor(peerRow / 3) === Math.floor(row / 3) &&
                    Math.floor(peerCol / 3) === Math.floor(col / 3);
            });
        });
        const row = Math.floor(targetIndex / 9);
        const col = targetIndex % 9;
        const peer = cells.find((cell, peerIndex) => {
            if (!cell.props.disabled || !cell.props.value) return false;
            const peerRow = Math.floor(peerIndex / 9);
            const peerCol = peerIndex % 9;
            if (conflictType === 'row') return peerRow === row;
            if (conflictType === 'column') return peerCol === col;
            return Math.floor(peerRow / 3) === Math.floor(row / 3) &&
                Math.floor(peerCol / 3) === Math.floor(col / 3);
        });

        assert.equal(typeof cells[targetIndex].props.onChange, 'function');
        assert.equal(typeof getBoard(renderer).props.onChange, 'function');
        enterCell(renderer, targetIndex, peer.props.value);
        assert.match(getCells(renderer)[targetIndex].props.className, /incorrect/);

        enterCell(renderer, targetIndex, '');
        assert.doesNotMatch(getCells(renderer)[targetIndex].props.className, /incorrect/);
    }
});

test('editable input changes are handled by the board while prefilled and hinted cells stay locked', () => {
    const renderer = createGame();
    const cells = getCells(renderer);
    const editableIndex = cells.findIndex(cell => !cell.props.disabled);
    const prefilledIndex = cells.findIndex(cell => cell.props.disabled);

    assert.equal(typeof cells[editableIndex].props.onChange, 'function');
    assert.equal(typeof getBoard(renderer).props.onChange, 'function');
    enterCell(renderer, editableIndex, '7');
    assert.equal(getCells(renderer)[editableIndex].props.value, '7');

    clickButton(renderer, 'Hint');
    const hintedIndex = getCells(renderer).findIndex(cell =>
        cell.props.className.includes('hinted'));
    assert.notEqual(hintedIndex, -1);
    assert.equal(getCells(renderer)[hintedIndex].props.disabled, true);

    const lockedValues = [prefilledIndex, hintedIndex].map(index => getCells(renderer)[index].props.value);
    enterCell(renderer, prefilledIndex, '1');
    enterCell(renderer, hintedIndex, '1');
    assert.equal(getCells(renderer)[prefilledIndex].props.value, lockedValues[0]);
    assert.equal(getCells(renderer)[hintedIndex].props.value, lockedValues[1]);
});

test('hint fills and locks a correct editable cell, tracks usage, and resets for a new game', () => {
    const renderer = createGame();
    const editableIndex = getCells(renderer).findIndex(cell => !cell.props.disabled);

    const solution = getCells(renderer).map(cell => Number(cell.props.value) || 0);
    const solutionBoard = Array.from({ length: 9 }, (_, row) =>
        solution.slice(row * 9, row * 9 + 9));
    assert.equal(solveBoard(solutionBoard), true);

    clickButton(renderer, 'Hint');

    let hintedCell = getCells(renderer)[editableIndex];
    assert.match(hintedCell.props.className, /hinted/);
    assert.equal(hintedCell.props.disabled, true);
    assert.match(hintedCell.props.value, /^[1-9]$/);
    assert.equal(renderer.root.findByProps({ id: 'hints-used' }).children.join(''), '1');

    const secondEditableIndex = getCells(renderer).findIndex(cell => !cell.props.disabled);
    const correctValue = solutionBoard[Math.floor(secondEditableIndex / 9)][secondEditableIndex % 9];
    const wrongValue = Array.from({ length: 9 }, (_, index) => String(index + 1))
        .find(value => Number(value) !== correctValue);
    enterCell(renderer, secondEditableIndex, wrongValue);
    clickButton(renderer, 'Hint');

    hintedCell = getCells(renderer)[secondEditableIndex];
    assert.equal(hintedCell.props.value, String(correctValue));
    assert.equal(hintedCell.props.disabled, true);
    assert.equal(renderer.root.findByProps({ id: 'hints-used' }).children.join(''), '2');

    clickButton(renderer, 'Check Puzzle');
    hintedCell = getCells(renderer)[editableIndex];
    assert.doesNotMatch(hintedCell.props.className, /incorrect/);

    clickButton(renderer, 'New Game');
    assert.equal(renderer.root.findByProps({ id: 'hints-used' }).children.join(''), '0');
    assert.equal(getCells(renderer).filter(cell => cell.props.disabled).length, 35);
});

test('correctly completing the board automatically displays completion time and hints used', () => {
    const renderer = createGame();
    const solution = getCells(renderer).map(cell => Number(cell.props.value) || 0);
    const solutionBoard = Array.from({ length: 9 }, (_, row) =>
        solution.slice(row * 9, row * 9 + 9));
    assert.equal(solveBoard(solutionBoard), true);

    const firstEditable = getCells(renderer).findIndex(cell => !cell.props.disabled);
    clickButton(renderer, 'Hint');
    assert.match(getMessage(renderer), /^$/);

    for (const [index, cell] of getCells(renderer).entries()) {
        if (cell.props.disabled) continue;
        enterCell(renderer, index, solutionBoard[Math.floor(index / 9)][index % 9]);
    }

    assert.match(
        getMessage(renderer),
        /^Congratulations! You solved it! Time: \d{2}:\d{2}\. Hints used: 1\.$/
    );
    assert.equal(getCells(renderer)[firstEditable].props.disabled, true);
});

test('candidate helpers find Naked Singles, Hidden Singles, and remaining counts', () => {
    const solvedBoard = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    const nakedBoard = solvedBoard.map(row => [...row]);
    nakedBoard[0][0] = 0;

    assert.deepEqual(getCandidateNumbers(nakedBoard, 0, 0), [5]);
    const nakedHint = findSmartHint(nakedBoard);
    assert.equal(nakedHint.row, 0);
    assert.equal(nakedHint.col, 0);
    assert.equal(nakedHint.number, 5);
    assert.equal(nakedHint.strategy, 'Naked Single');
    assert.equal(nakedHint.explanation, 'Only 5 fits in this cell, making it a Naked Single.');
    assert.equal(nakedHint.relatedCells.length, 20);

    const hiddenBoard = [
        [5, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 7, 2, 0, 0, 5, 0, 0, 8],
        [1, 0, 8, 0, 0, 0, 0, 0, 0],
        [0, 0, 9, 7, 6, 1, 0, 2, 3],
        [0, 0, 6, 0, 0, 0, 0, 9, 0],
        [7, 0, 0, 0, 0, 0, 0, 5, 0],
        [0, 0, 0, 5, 0, 7, 0, 0, 0],
        [0, 0, 0, 0, 1, 9, 0, 3, 0],
        [3, 0, 0, 0, 8, 6, 0, 7, 0]
    ];

    const hiddenHint = findSmartHint(hiddenBoard);
    assert.equal(hiddenHint.strategy, 'Hidden Single');
    assert.match(hiddenHint.explanation, /Hidden Single/);
    assert.ok(hiddenHint.relatedCells.length > 0);
    assert.deepEqual(getRemainingNumberCounts(solvedBoard), Array(9).fill(0));
    assert.deepEqual(getRemainingNumberCounts(nakedBoard), [0, 0, 0, 0, 1, 0, 0, 0, 0]);
});

test('note mode toggles valid candidates without changing the board and number selection highlights matches', () => {
    const renderer = createGame();
    const cells = getCells(renderer);
    const targetIndex = cells.findIndex(cell => !cell.props.disabled);
    const row = Number(cells[targetIndex].props['data-row']);
    const col = Number(cells[targetIndex].props['data-col']);
    const candidates = getCandidateNumbers(
        Array.from({ length: 9 }, (_, rowIndex) =>
            cells.slice(rowIndex * 9, rowIndex * 9 + 9)
                .map(cell => Number(cell.props.value) || 0)),
        row,
        col
    );
    const candidate = candidates[0];
    const initialValue = cells[targetIndex].props.value;
    const remainingCounts = getRemainingNumberCounts(Array.from({ length: 9 }, (_, rowIndex) =>
        cells.slice(rowIndex * 9, rowIndex * 9 + 9)
            .map(cell => Number(cell.props.value) || 0)));
    assert.deepEqual(
        renderer.root.findAllByType('button')
            .filter(button => button.props['aria-label']?.startsWith('Number '))
            .map(button => button.props['aria-label']),
        remainingCounts.map((count, index) => `Number ${index + 1}, ${count} remaining`)
    );

    clickButton(renderer, 'Note Mode: Off');
    act(() => getBoard(renderer).props.onClick({
        target: { dataset: { row: String(row), col: String(col) } }
    }));
    const numberButton = number => renderer.root.findAllByType('button')
        .find(button => button.props['aria-label']?.startsWith(`Number ${number},`));
    act(() => numberButton(candidate).props.onClick());
    act(() => numberButton(candidates[1]).props.onClick());

    let notes = renderer.root.findByProps({ className: 'cell-notes' });
    assert.equal(notes.props['aria-label'], `Notes: ${candidate}, ${candidates[1]}`);
    const displayedNotes = notes.findAllByType('span')
        .map(note => note.children.join(''));
    assert.equal(displayedNotes.length, 9);
    assert.equal(displayedNotes[candidate - 1], String(candidate));
    assert.equal(displayedNotes[candidates[1] - 1], String(candidates[1]));
    assert.equal(notes.findAllByProps({ className: 'candidate-highlighted' }).length, 1);
    assert.equal(getCells(renderer)[targetIndex].props.value, initialValue);

    act(() => numberButton(candidate).props.onClick());
    notes = renderer.root.findByProps({ className: 'cell-notes' });
    assert.equal(notes.props['aria-label'], `Notes: ${candidates[1]}`);
    act(() => numberButton(candidates[1]).props.onClick());
    assert.equal(renderer.root.findAllByProps({ className: 'cell-notes' }).length, 0);

    enterCell(renderer, targetIndex, String(candidate));
    notes = renderer.root.findByProps({ className: 'cell-notes' });
    assert.equal(notes.props['aria-label'], `Notes: ${candidate}`);
    assert.equal(getCells(renderer)[targetIndex].props.value, initialValue);
    enterCell(renderer, targetIndex, String(candidate));
    assert.equal(renderer.root.findAllByProps({ className: 'cell-notes' }).length, 0);

    const filledCell = getCells(renderer).find(cell => cell.props.value !== '');
    const selectedNumber = Number(filledCell.props.value);
    const highlightButton = renderer.root.findAllByType('button')
        .find(button => button.props['aria-label']?.startsWith(`Number ${selectedNumber},`));
    act(() => highlightButton.props.onClick());
    assert.equal(highlightButton.props['aria-pressed'], true);
    assert.ok(getCells(renderer)
        .filter(cell => cell.props.value === String(selectedNumber))
        .every(cell => cell.props.className.includes('number-highlighted')));
    assert.ok(getCells(renderer)
        .filter(cell => cell.props.value === String(selectedNumber))
        .length > 1);
});

test('Smart Hint applies a logical single and explains its strategy', () => {
    const renderer = createGame();

    clickButton(renderer, 'Smart Hint');

    assert.match(
        renderer.root.findByProps({ id: 'hint-explanation' }).children.join(''),
        /(Naked|Hidden) Single/
    );
    assert.equal(renderer.root.findByProps({ id: 'hints-used' }).children.join(''), '1');
    assert.equal(getCells(renderer).filter(cell => cell.props.className.includes('hinted')).length, 1);
    assert.equal(getCells(renderer).filter(cell => cell.props.className.includes('hint-target')).length, 1);
    assert.ok(getCells(renderer).some(cell => cell.props.className.includes('hint-related')));
});

test('controls are grouped into game, number, pencil mark, and hint sections', () => {
    const renderer = createGame();
    const sectionTitles = renderer.root.findAllByType('h2')
        .map(title => title.children.join(''));

    assert.deepEqual(sectionTitles, ['Your puzzle', 'Game', 'Number guide', 'Pencil marks', 'Need a nudge?']);
    assert.ok(renderer.root.findAllByType('button')
        .every(button => !/Solver/.test(button.children.join(''))));
});
