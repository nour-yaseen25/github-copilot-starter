export const SIZE = 9;
export const EMPTY = 0;

export const isSafe = (board, row, col, number) => {
    for (let index = 0; index < SIZE; index++) {
        if (board[row][index] === number || board[index][col] === number) {
            return false;
        }
    }

    const boxRow = row - (row % 3);
    const boxCol = col - (col % 3);
    for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
        for (let colOffset = 0; colOffset < 3; colOffset++) {
            if (board[boxRow + rowOffset][boxCol + colOffset] === number) {
                return false;
            }
        }
    }

    return true;
};

export const solveBoard = (board) => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === EMPTY) {
                for (let number = 1; number <= SIZE; number++) {
                    if (isSafe(board, row, col, number)) {
                        board[row][col] = number;
                        if (solveBoard(board)) return true;
                        board[row][col] = EMPTY;
                    }
                }
                return false;
            }
        }
    }

    return true;
};

export const countSolutions = (board, limit = 2) => {
    const boardCopy = board.map(row => [...row]);
    let count = 0;

    const search = () => {
        if (count >= limit) return;

        let targetRow = -1;
        let targetCol = -1;
        let smallestCandidates = null;

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (boardCopy[row][col] !== EMPTY) continue;

                const candidates = [];
                for (let number = 1; number <= SIZE; number++) {
                    if (isSafe(boardCopy, row, col, number)) {
                        candidates.push(number);
                    }
                }

                if (candidates.length === 0) return;
                if (smallestCandidates === null || candidates.length < smallestCandidates.length) {
                    targetRow = row;
                    targetCol = col;
                    smallestCandidates = candidates;
                }
            }
        }

        if (targetRow === -1) {
            count++;
            return;
        }

        for (const number of smallestCandidates) {
            boardCopy[targetRow][targetCol] = number;
            search();
            boardCopy[targetRow][targetCol] = EMPTY;
            if (count >= limit) return;
        }
    };

    search();
    return count;
};
