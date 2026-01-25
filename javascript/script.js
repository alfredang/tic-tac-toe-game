// Game State
const SQUARES = [
    { id: 0, value: '' }, { id: 1, value: '' }, { id: 2, value: '' },
    { id: 3, value: '' }, { id: 4, value: '' }, { id: 5, value: '' },
    { id: 6, value: '' }, { id: 7, value: '' }, { id: 8, value: '' },
];
let currentPlayer = 'X';
let gameActive = true;
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
        cell.addEventListener('click', handleCellClick, { once: true });
    });
    
    // Reset internal state
    SQUARES.forEach(sq => sq.value = '');
    currentPlayer = 'X';
    gameActive = true;
    updateTurnIndicator();
    modalOverlay.classList.remove('active');
}

function handleCellClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    // Update State
    SQUARES[index].value = currentPlayer;
    
    // Update UI
    cell.classList.add(currentPlayer.toLowerCase());
    cell.innerText = currentPlayer;
    playSound(currentPlayer === 'X' ? 'clickX' : 'clickO');

    // Check Win/Draw
    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurn();
    }
}

function swapTurn() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

function updateTurnIndicator() {
    turnIcon.innerText = currentPlayer;
    turnIcon.className = `turn-icon ${currentPlayer === 'X' ? 'x-mark' : 'o-mark'}`; // Optional: color the turn icon
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
    }, 500); // Slight delay before modal
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
    // For now, just reset. In a larger app, this might go to a menu.
    startNewGameFullReset();
});

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
