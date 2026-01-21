const sentences = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "In the middle of every difficulty lies opportunity.",
    "The best way to predict the future is to create it.",
    "Do not wait to strike till the iron is hot; but make it hot by striking.",
    "Great things are done by a series of small things brought together.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Stay hungry, stay foolish.",
    "Your time is limited, so don't waste it living someone else's life.",
    "Innovation distinguishes between a leader and a follower.",
    "Be the change that you wish to see in the world.",
    "Everything you've ever wanted is on the other side of fear.",
    "It does not matter how slowly you go as long as you do not stop.",
    "The mind is everything. What you think you become.",
    "The best revenge is massive success.",
    "Eighty percent of success is showing up."
];

// State
let state = {
    mode: 'time', // 'time' or 'words'
    timeLimit: 30,
    wordLimit: 50,
    startTime: null,
    timerInterval: null,
    timeLeft: 30,
    wordsTyped: 0,
    errors: 0,
    totalChars: 0,
    wpmHistory: [],
    isGameOver: false,
    text: ""
};

// DOM Elements
const app = document.getElementById('app');
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const timerLabel = document.getElementById('timer-label');
const resultsScreen = document.getElementById('results-screen');
const typingArea = document.getElementById('typing-area');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const statTestType = document.getElementById('stat-test-type');
const statRawWpm = document.getElementById('stat-raw-wpm');
const statErrors = document.getElementById('stat-errors');
const statConsistency = document.getElementById('stat-consistency');
const restartBtn = document.getElementById('restart-btn');
const configBtns = document.querySelectorAll('.config-btn');
const timeOptions = document.getElementById('time-options');
const wordOptions = document.getElementById('word-options');

let chart = null;

function initGame() {
    state.isGameOver = false;
    state.startTime = null;
    state.wpmHistory = [];
    state.errors = 0;
    state.totalChars = 0;
    clearInterval(state.timerInterval);

    // Setup mode specific values
    if (state.mode === 'time') {
        state.timeLeft = state.timeLimit;
        timerDisplay.innerText = state.timeLeft;
        timerLabel.innerText = 'time';
    } else {
        state.timeLeft = 0;
        timerDisplay.innerText = `0/${state.wordLimit}`;
        timerLabel.innerText = 'words';
    }

    // Generate text
    state.text = generateText();
    renderText();

    // Reset UI
    resultsScreen.classList.add('hidden');
    typingArea.classList.remove('hidden');
    app.classList.remove('focus-mode');
    wpmDisplay.innerText = '0';
    accuracyDisplay.innerText = '100%';
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();

    updateCursor();
}

function generateText() {
    if (state.mode === 'words') {
        let words = [];
        while (words.length < state.wordLimit) {
            const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
            words.push(...randomSentence.split(' '));
        }
        return words.slice(0, state.wordLimit).join(' ');
    } else {
        // For time mode, just grab 3-4 random sentences to fill space
        let text = "";
        for (let i = 0; i < 4; i++) {
            text += sentences[Math.floor(Math.random() * sentences.length)] + " ";
        }
        return text.trim();
    }
}

function renderText() {
    textDisplay.innerHTML = '';
    state.text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.innerText = char;
        if (i === 0) span.classList.add('current');
        textDisplay.appendChild(span);
    });

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    textDisplay.appendChild(cursor);
}

function updateCursor() {
    const currentChar = textDisplay.querySelector('.char.current');
    const cursor = textDisplay.querySelector('.cursor');
    if (currentChar && cursor) {
        cursor.style.left = currentChar.offsetLeft + 'px';
        cursor.style.top = currentChar.offsetTop + 'px';
    }
}

function startTimer() {
    state.startTime = Date.now();
    app.classList.add('focus-mode');

    state.timerInterval = setInterval(() => {
        if (state.mode === 'time') {
            state.timeLeft--;
            timerDisplay.innerText = state.timeLeft;
            if (state.timeLeft <= 0) endGame();
        } else {
            state.timeLeft++; // Counting up for words mode
        }

        // Record WPM for history chart
        const currentWpm = calculateWPM();
        state.wpmHistory.push(currentWpm);
        wpmDisplay.innerText = currentWpm;
    }, 1000);
}

function calculateWPM() {
    if (!state.startTime) return 0;
    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60;
    if (timeElapsed <= 0) return 0;
    const wordsTyped = state.totalChars / 5;
    return Math.round(wordsTyped / timeElapsed);
}

function calculateAccuracy() {
    if (state.totalChars === 0) return 100;
    const acc = ((state.totalChars - state.errors) / state.totalChars) * 100;
    return Math.max(0, Math.round(acc));
}

function endGame() {
    clearInterval(state.timerInterval);
    state.isGameOver = true;
    typingInput.disabled = true;
    app.classList.remove('focus-mode');

    // Stats
    const finalWpmVal = calculateWPM();
    const finalAccVal = calculateAccuracy();

    finalWpm.innerText = finalWpmVal;
    finalAccuracy.innerText = finalAccVal + '%';
    statTestType.innerText = state.mode === 'time' ? `${state.timeLimit}s time` : `${state.wordLimit} words`;
    statRawWpm.innerText = Math.round(finalWpmVal / (finalAccVal / 100)) || finalWpmVal;
    statErrors.innerText = state.errors;

    // Consistency calculation (simple standard deviation-ish approach)
    const avg = state.wpmHistory.reduce((a, b) => a + b, 0) / state.wpmHistory.length;
    const variance = state.wpmHistory.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / state.wpmHistory.length;
    const consistency = Math.max(0, 100 - Math.sqrt(variance));
    statConsistency.innerText = Math.round(consistency) + '%';

    // UI Switch
    typingArea.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('results-chart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: state.wpmHistory.map((_, i) => i + 1),
            datasets: [{
                label: 'WPM',
                data: state.wpmHistory,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#475569' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#475569' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Input Handling
typingInput.addEventListener('input', (e) => {
    if (state.isGameOver) return;
    if (!state.startTime && typingInput.value.length > 0) startTimer();

    const val = typingInput.value;
    const chars = textDisplay.querySelectorAll('.char');
    const lastTypedIdx = val.length - 1;

    // Reset all
    chars.forEach(c => c.classList.remove('current', 'correct', 'incorrect'));

    // Re-evaluate
    let currentErrors = 0;
    for (let i = 0; i < val.length; i++) {
        if (val[i] === state.text[i]) {
            chars[i].classList.add('correct');
        } else {
            chars[i].classList.add('incorrect');
            if (i === lastTypedIdx) state.errors++;
        }
    }

    state.totalChars = val.length;

    if (val.length < state.text.length) {
        chars[val.length].classList.add('current');
    } else {
        // Finished current text
        if (state.mode === 'words') {
            endGame();
        } else {
            // Refill sentences for time mode
            state.text += " " + generateText();
            renderText();
            // Re-apply correct/incorrect classes for existing input
            for (let i = 0; i < val.length; i++) {
                const c = textDisplay.querySelectorAll('.char')[i];
                if (val[i] === state.text[i]) c.classList.add('correct');
                else c.classList.add('incorrect');
            }
            textDisplay.querySelectorAll('.char')[val.length].classList.add('current');
        }
    }

    if (state.mode === 'words') {
        const wordsArr = val.trim().split(/\s+/);
        const actualWords = wordsArr[0] === "" ? 0 : wordsArr.length;
        timerDisplay.innerText = `${actualWords}/${state.wordLimit}`;
    }

    accuracyDisplay.innerText = calculateAccuracy() + '%';
    wpmDisplay.innerText = calculateWPM();
    updateCursor();
});

// Config Handling
configBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (parent.id === 'mode-select') {
            state.mode = btn.dataset.mode;
            if (state.mode === 'time') {
                timeOptions.classList.remove('hidden');
                wordOptions.classList.add('hidden');
            } else {
                timeOptions.classList.add('hidden');
                wordOptions.classList.remove('hidden');
            }
        } else if (parent.id === 'time-options') {
            state.timeLimit = parseInt(btn.dataset.value);
        } else if (parent.id === 'word-options') {
            state.wordLimit = parseInt(btn.dataset.value);
        }

        initGame();
    });
});

// Shortcuts
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        initGame();
    }
    if (e.key === 'Escape') {
        endGame();
    }
});

restartBtn.addEventListener('click', initGame);

// Global focus
document.addEventListener('click', () => {
    if (!state.isGameOver) typingInput.focus();
});

// Initial
initGame();

