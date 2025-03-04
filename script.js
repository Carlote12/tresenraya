const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X';
let gameMode = 'player';
let difficulty = 'easy'; // Default difficulty
let scoreX = 0;
let scoreO = 0;
let draws = 0;
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const startScreen = document.getElementById('startScreen');
const difficultyScreen = document.getElementById('difficultyScreen');
const gameScreen = document.getElementById('gameScreen');
const messageElement = document.getElementById('message');
const vsBotButton = document.getElementById('vsBot');
const vsPlayerButton = document.getElementById('vsPlayer');
const easyButton = document.getElementById('easy');
const mediumButton = document.getElementById('medium');
const hardButton = document.getElementById('hard');
const expertButton = document.getElementById('expert');
const impossibleButton = document.getElementById('impossible');

vsBotButton.addEventListener('click', () => showDifficultyScreen());
vsPlayerButton.addEventListener('click', () => startGame('player'));
easyButton.addEventListener('click', () => startGame('bot', 'easy'));
mediumButton.addEventListener('click', () => startGame('bot', 'medium'));
hardButton.addEventListener('click', () => startGame('bot', 'hard'));
expertButton.addEventListener('click', () => startGame('bot', 'expert'));
impossibleButton.addEventListener('click', () => startGame('bot', 'impossible'));

function showDifficultyScreen() {
    startScreen.style.display = 'none';
    difficultyScreen.style.display = 'flex';
}

function startGame(mode, level) {
    gameMode = mode;
    difficulty = level || 'easy'; // Default to 'easy' if level is not provided
    startScreen.style.display = 'none';
    difficultyScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.addEventListener('click', handleClick, { once: true });
    });
    messageElement.textContent = ''; // Reset the message
}

function handleClick(event) {
    const cell = event.target;
    if (cell.textContent !== '') {
        return; // Exit if the cell is already occupied
    }
    cell.textContent = currentPlayer;
    if (checkWin(currentPlayer)) {
        showMessage(`${currentPlayer} gana!`);
        if (currentPlayer === 'X') {
            scoreX++;
        } else {
            scoreO++;
        }
        setTimeout(() => {
            resetBoard();
            updateScoreboard();
        }, 2000);
    } else if (isDraw()) {
        showMessage('¡Es un empate!');
        draws++;
        setTimeout(() => {
            resetBoard();
            updateScoreboard();
        }, 2000);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (gameMode === 'bot' && currentPlayer === 'O') {
            setTimeout(botMove, 500); // Delay for bot's move
        }
    }
}

function botMove() {
    if (difficulty === 'easy') {
        makeRandomMove();
    } else if (difficulty === 'medium') {
        if (!blockPlayerWin()) {
            makeRandomMove();
        }
    } else if (difficulty === 'hard') {
        makeOptimalMove();
    } else if (difficulty === 'expert') {
        makeOptimalMove(); // Reutilizar lógica de 'hard' o mejorarla
    } else if (difficulty === 'impossible') {
        makeImpossibleMove(); // Implementar lógica más avanzada
    }

    if (checkWin(currentPlayer)) {
        showMessage(`${currentPlayer} gana!`);
        setTimeout(resetBoard, 2000); // Wait 2 seconds before resetting the board
    } else if (isDraw()) {
        showMessage('¡Es un empate!');
        setTimeout(resetBoard, 2000); // Wait 2 seconds before resetting the board
    } else {
        currentPlayer = 'X';
    }
}

function makeRandomMove() {
    const emptyCells = [...cells].filter(cell => cell.textContent === '');
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.textContent = currentPlayer;
    }
}

function blockPlayerWin() {
    return winningCombos.some(combo => {
        const [a, b, c] = combo;
        const values = [cells[a].textContent, cells[b].textContent, cells[c].textContent];
        if (values.filter(value => value === 'X').length === 2 && values.includes('')) {
            const emptyCellIndex = combo[values.indexOf('')];
            cells[emptyCellIndex].textContent = currentPlayer;
            return true;
        }
        return false;
    });
}

function makeOptimalMove() {
    const bestMove = findBestMove();
    cells[bestMove].textContent = currentPlayer;
}

function makeImpossibleMove() {
    const bestMove = findBestMove();
    cells[bestMove].textContent = currentPlayer;
}

function findBestMove() {
    let bestVal = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].textContent === '') {
            cells[i].textContent = currentPlayer;
            let moveVal = minimax(0, false);
            cells[i].textContent = '';
            if (moveVal > bestVal) {
                bestMove = i;
                bestVal = moveVal;
            }
        }
    }
    return bestMove;
}

function minimax(depth, isMax) {
    let score = evaluate();
    if (score === 10) return score;
    if (score === -10) return score;
    if (isDraw()) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent === '') {
                cells[i].textContent = currentPlayer;
                best = Math.max(best, minimax(depth + 1, !isMax));
                cells[i].textContent = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent === '') {
                cells[i].textContent = 'X';
                best = Math.min(best, minimax(depth + 1, !isMax));
                cells[i].textContent = '';
            }
        }
        return best;
    }
}

function evaluate() {
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (cells[a].textContent === cells[b].textContent &&
            cells[b].textContent === cells[c].textContent) {
            if (cells[a].textContent === 'O') return 10;
            else if (cells[a].textContent === 'X') return -10;
        }
    }
    return 0;
}

function checkWin(player) {
    return winningCombos.some(combo => {
        return combo.every(index => {
            return cells[index].textContent === player;
        });
    });
}

function isDraw() {
    return [...cells].every(cell => cell.textContent !== '');
}

function resetBoard() {
    cells.forEach(cell => {
        cell.textContent = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    currentPlayer = 'X';
    messageElement.textContent = ''; // Clear the message after reset
}

function showMessage(message) {
    messageElement.textContent = message;
}

function updateScoreboard() {
    document.getElementById('scoreX').textContent = scoreX;
    document.getElementById('scoreO').textContent = scoreO;
    document.getElementById('draws').textContent = draws;
}
