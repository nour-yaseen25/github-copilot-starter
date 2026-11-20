import assert from 'node:assert/strict';
import { test } from 'node:test';

const { createSudokuApp } = await import('../src/sudoku-ui.js');

class Element {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.style = {};
        this.value = '';
        this.disabled = false;
        this.className = '';
    }

    set innerHTML(value) {
        this._innerHTML = value;
        this.children = [];
    }

    get innerHTML() {
        return this._innerHTML || '';
    }

    appendChild(child) {
        this.children.push(child);
    }

    getElementsByTagName(tagName) {
        const matchingElements = [];
        for (const child of this.children) {
            if (child.tagName === tagName) matchingElements.push(child);
            matchingElements.push(...child.getElementsByTagName(tagName));
        }
        return matchingElements;
    }
}

function createGame() {
    const elements = {
        'sudoku-board': new Element('div'),
        message: new Element('span')
    };
    const document = {
        getElementById(id) {
            return elements[id];
        },
        createElement(tagName) {
            return new Element(tagName);
        }
    };
    let seed = 123456789;
    const deterministicMath = Object.create(Math);
    deterministicMath.random = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
    const window = {};

    createSudokuApp({ document, window, random: deterministicMath.random });

    return { board: elements['sudoku-board'], message: elements.message, window };
}

function getRows(board) {
    return board.children.map(row => row.children);
}

function assertCluesAreConsistent(rows) {
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
        const clues = group.map(cell => cell.value).filter(Boolean);
        assert.equal(new Set(clues).size, clues.length);
    }
}

test('new game renders a valid 9-by-9 puzzle with 35 clues', () => {
    const { board, message, window } = createGame();
    const rows = getRows(board);
    const cells = board.getElementsByTagName('input');

    assert.equal(rows.length, 9);
    assert.ok(rows.every(row => row.length === 9));
    assert.equal(cells.length, 81);
    assert.equal(cells.filter(cell => cell.disabled).length, 35);
    assert.ok(cells.filter(cell => cell.disabled).every(cell => /^[1-9]$/.test(cell.value)));
    assert.equal(message.innerHTML, '');
    assertCluesAreConsistent(rows);

    window.checkSolution();
    assert.equal(message.innerHTML, 'Some cells are incorrect.');
    assert.equal(message.style.color, '#d32f2f');

    window.newGame();
    assert.equal(board.getElementsByTagName('input').length, 81);
    assert.equal(message.innerHTML, '');
});

test('editable cells accept only digits 1 through 9 and mark empty cells incorrect', () => {
    const { board, window } = createGame();
    const editableCell = board.getElementsByTagName('input').find(cell => !cell.disabled);

    editableCell.value = 'a0x7';
    editableCell.oninput();
    assert.equal(editableCell.value, '7');

    editableCell.value = '0';
    editableCell.oninput();
    assert.equal(editableCell.value, '');

    window.checkSolution();
    assert.equal(editableCell.className, 'sudoku-cell incorrect');
});

test('check solution congratulates the player when all cells match the solution', () => {
    const { board, message, window } = createGame();
    const editableCells = board.getElementsByTagName('input').filter(cell => !cell.disabled);

    for (const cell of editableCells) {
        let foundCorrectValue = false;
        for (let value = 1; value <= 9; value++) {
            cell.value = String(value);
            cell.oninput();
            window.checkSolution();
            if (cell.className === 'sudoku-cell') {
                foundCorrectValue = true;
                break;
            }
        }
        assert.ok(foundCorrectValue, 'each editable cell should have a matching solution value');
    }

    window.checkSolution();
    assert.equal(message.innerHTML, 'Congratulations! You solved it!');
    assert.equal(message.style.color, '#388e3c');
});
