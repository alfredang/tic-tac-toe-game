// Game State
const SQUARES = [
    { id: 0, value: '' }, { id: 1, value: '' }, { id: 2, value: '' },
    { id: 3, value: '' }, { id: 4, value: '' }, { id: 5, value: '' },
    { id: 6, value: '' }, { id: 7, value: '' }, { id: 8, value: '' },
];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let isProcessingAI = false;
let scoreX = 0;
let scoreO = 0;
let scoreTie = 0;

// Winning Combinations
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM Elements
const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turn-indicator');
const turnIcon = turnIndicator.querySelector('.turn-icon');
const modalOverlay = document.getElementById('modal-overlay');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-icon');
const resetBtn = document.getElementById('reset-btn');
const nextRoundBtn = document.getElementById('next-round-btn');
const quitBtn = document.getElementById('quit-btn');

// Mode Selectors
const modePvpBtn = document.getElementById('mode-pvp');
const modeAiBtn = document.getElementById('mode-ai');

// Sounds
const sounds = {
    clickX: document.getElementById('sound-click-x'),
    clickO: document.getElementById('sound-click-o'),
    win: document.getElementById('sound-win'),
    draw: document.getElementById('sound-draw'),
    restart: document.getElementById('sound-restart')
};

function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed (user interaction needed first):', e));
    }
}

// Initialize Game
function initGame() {
    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'win-x', 'win-o');
        cell.innerText = '';
        cell.removeEventListener('click', handleCellClick); // Prevent duplicates
        cell.addEventListener('click', handleCellClick);
    });

    // Reset internal state
    SQUARES.forEach(sq => sq.value = '');
    currentPlayer = 'X';
    gameActive = true;
    isProcessingAI = false;
    updateTurnIndicator();
    modalOverlay.classList.remove('active');
}

function switchMode(mode) {
    gameMode = mode;
    // Update UI
    if (mode === 'pvp') {
        modePvpBtn.classList.add('active');
        modeAiBtn.classList.remove('active');
    } else {
        modeAiBtn.classList.add('active');
        modePvpBtn.classList.remove('active');
    }
    // Reset game completely on mode switch
    startNewGameFullReset();
}

function handleCellClick(e) {
    if (!gameActive || isProcessingAI) return;

    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (SQUARES[index].value !== '') return; // Occupied

    // Player Move
    makeMove(index, currentPlayer);

    // AI Turn Trigger
    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        isProcessingAI = true;
        setTimeout(() => {
            makeAIMove();
            isProcessingAI = false;
        }, 600); // Delay for realism
    }
}

function makeMove(index, player) {
    // Update State
    SQUARES[index].value = player;

    // Update UI
    const cell = cells[index];
    cell.classList.add(player.toLowerCase());
    cell.innerText = player;
    playSound(player === 'X' ? 'clickX' : 'clickO');

    // Check Win/Draw
    if (checkWin(player)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurn();
    }
}

function makeAIMove() {
    const bestIndex = getBestMove();
    if (bestIndex !== -1) {
        makeMove(bestIndex, 'O');
    }
}

/* --- Minimax AI Logic --- */

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;

    // Simple improvement: Center preference if empty (optimization)
    if (SQUARES[4].value === '') return 4;

    for (let i = 0; i < 9; i++) {
        if (SQUARES[i].value === '') {
            SQUARES[i].value = 'O';
            let score = minimax(SQUARES, 0, false);
            SQUARES[i].value = ''; // Undo

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWinForMinimax(board, 'O')) return 10 - depth;
    if (checkWinForMinimax(board, 'X')) return depth - 10;
    if (board.every(sq => sq.value !== '')) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i].value === '') {
                board[i].value = 'O';
                let score = minimax(board, depth + 1, false);
                board[i].value = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i].value === '') {
                board[i].value = 'X';
                let score = minimax(board, depth + 1, true);
                board[i].value = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForMinimax(board, player) {
    return WINNING_COMBINATIONS.some(combination => {
        const [a, b, c] = combination;
        return (
            board[a].value === player &&
            board[b].value === player &&
            board[c].value === player
        );
    });
}

/* --- End AI Logic --- */

function swapTurn() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

function updateTurnIndicator() {
    turnIcon.innerText = currentPlayer;
    turnIcon.className = `turn-icon ${currentPlayer === 'X' ? 'x-mark' : 'o-mark'}`;
}

function checkWin(player) {
    return WINNING_COMBINATIONS.some(combination => {
        const [a, b, c] = combination;
        if (
            SQUARES[a].value === player &&
            SQUARES[b].value === player &&
            SQUARES[c].value === player
        ) {
            highlightWin(combination, player);
            return true;
        }
        return false;
    });
}

function highlightWin(combination, player) {
    combination.forEach(index => {
        cells[index].classList.add(player === 'X' ? 'win-x' : 'win-o');
    });
}

function isDraw() {
    return SQUARES.every(sq => sq.value !== '');
}

function endGame(draw) {
    gameActive = false;

    setTimeout(() => {
        modalOverlay.classList.add('active');
        if (draw) {
            modalMessage.innerText = 'ROUND TIED';
            modalIcon.innerHTML = '';
            modalMessage.style.color = '#a8bec9';
            playSound('draw');
            scoreTie++;
            document.getElementById('score-tie').innerText = scoreTie;
        } else {
            modalMessage.innerText = currentPlayer === 'X' ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
            if (gameMode === 'ai' && currentPlayer === 'O') {
                modalMessage.innerText = 'CPU WINS!';
            }

            modalIcon.innerHTML = `<span class="${currentPlayer === 'X' ? 'x-win' : 'o-win'}">${currentPlayer}</span> TAKES THE ROUND`;
            modalMessage.style.color = currentPlayer === 'X' ? 'var(--color-x)' : 'var(--color-o)';
            playSound('win');
            if (currentPlayer === 'X') {
                scoreX++;
                document.getElementById('score-x').innerText = scoreX;
            } else {
                scoreO++;
                document.getElementById('score-o').innerText = scoreO;
            }
        }
    }, 500);
}

// Event Listeners
resetBtn.addEventListener('click', () => {
    playSound('restart');
    initGame();
});

nextRoundBtn.addEventListener('click', () => {
    playSound('restart');
    initGame();
});

quitBtn.addEventListener('click', () => {
    startNewGameFullReset();
});

modePvpBtn.addEventListener('click', () => switchMode('pvp'));
modeAiBtn.addEventListener('click', () => switchMode('ai'));

function startNewGameFullReset() {
    scoreX = 0;
    scoreO = 0;
    scoreTie = 0;
    document.getElementById('score-x').innerText = 0;
    document.getElementById('score-o').innerText = 0;
    document.getElementById('score-tie').innerText = 0;
    playSound('restart');
    initGame();
}

// Start
initGame();
