import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { DIFFICULTY_CLUES, generatePuzzle } from '../src/sudoku-core.js';
import { countSolutions } from '../src/sudoku-solver.js';

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

    clickButton(renderer, 'Check Solution');
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
            act(() => getCells(renderer)[originalIndex].props.onChange({
                target: { value: String(value) }
            }));
            clickButton(renderer, 'Check Solution');
            if (getCells(renderer)[originalIndex].props.className === 'sudoku-cell') {
                break;
            }
        }
    }

    assert.equal(getMessage(renderer), 'Congratulations! You solved it!');
    const completedTime = getTimer(renderer);
    act(() => t.mock.timers.tick(3000));
    assert.equal(getTimer(renderer), completedTime);
});

test('editable cells accept only digits 1 through 9 and mark empty cells incorrect', () => {
    const renderer = createGame();
    let editableCell = getCells(renderer).find(cell => !cell.props.disabled);

    act(() => editableCell.props.onChange({ target: { value: 'a0x7' } }));
    editableCell = getCells(renderer).find(cell => !cell.props.disabled);
    assert.equal(editableCell.props.value, '7');

    act(() => editableCell.props.onChange({ target: { value: '0' } }));
    editableCell = getCells(renderer).find(cell => !cell.props.disabled);
    assert.equal(editableCell.props.value, '');

    clickButton(renderer, 'Check Solution');
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
            act(() => getCells(renderer)[originalIndex].props.onChange({
                target: { value: String(value) }
            }));
            clickButton(renderer, 'Check Solution');

            const updatedCell = getCells(renderer)[originalIndex];
            if (updatedCell.props.className === 'sudoku-cell') {
                foundCorrectValue = true;
                break;
            }
        }

        assert.ok(foundCorrectValue, 'each editable cell should have a matching solution value');
    }

    clickButton(renderer, 'Check Solution');
    assert.equal(getMessage(renderer), 'Congratulations! You solved it!');
    assert.equal(getMessageStyle(renderer), '#388e3c');
});
