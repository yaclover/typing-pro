const sentences = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "In the middle of every difficulty lies opportunity.",
    "The best way to predict the future is to create it.",
    "Do not wait to strike till the iron is hot; but make it hot by striking.",
    "Great things are done by a series of small things brought together.",
    "The only limit to our realization of tomorrow will be our doubts of today."
];

let currentSentence = "";
let errors = 0;
let startTime = null;
let timerInterval = null;
const testDuration = 60;
let timeLeft = testDuration;

const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
    clearInterval(timerInterval);
    timeLeft = testDuration;
    errors = 0;
    startTime = null;

    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

    // Create character elements
    textDisplay.innerHTML = '';
    currentSentence.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.classList.add('char');
        charSpan.innerText = char;
        textDisplay.appendChild(charSpan);
    });

    typingInput.value = '';
    updateDisplay();
    typingInput.focus();
}

function updateDisplay() {
    const userInput = typingInput.value;
    const chars = textDisplay.querySelectorAll('.char');
    let currentErrors = 0;

    chars.forEach((char, index) => {
        char.classList.remove('correct', 'incorrect', 'current');

        if (index < userInput.length) {
            if (userInput[index] === currentSentence[index]) {
                char.classList.add('correct');
            } else {
                char.classList.add('incorrect');
                currentErrors++;
            }
        } else if (index === userInput.length) {
            char.classList.add('current');
        }
    });

    errors = currentErrors;
    timerDisplay.innerText = timeLeft;
    wpmDisplay.innerText = calculateWPM(userInput.length);
    accuracyDisplay.innerText = calculateAccuracy(userInput.length, currentErrors) + '%';
}

function calculateWPM(charCount) {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    if (timeElapsed <= 0) return 0;
    const wordsTyped = charCount / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
}

function calculateAccuracy(total, errors) {
    if (total === 0) return 100;
    const accuracy = ((total - errors) / total) * 100;
    return Math.max(0, Math.round(accuracy));
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    typingInput.disabled = true;
    const finalWpm = wpmDisplay.innerText;
    const finalAccuracy = accuracyDisplay.innerText;
    alert(`Game Over! WPM: ${finalWpm} | Accuracy: ${finalAccuracy}`);
}

typingInput.addEventListener('input', (e) => {
    if (!startTime && typingInput.value.length > 0) {
        startTimer();
    }

    if (typingInput.value.length >= currentSentence.length) {
        // Handle completion of a sentence
        if (typingInput.value === currentSentence) {
            // Pick a new sentence and reset input
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            textDisplay.innerHTML = '';
            currentSentence.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.classList.add('char');
                charSpan.innerText = char;
                textDisplay.appendChild(charSpan);
            });
            typingInput.value = '';
        }
    }

    updateDisplay();
});

// Focus input when clicking anywhere on app
document.addEventListener('click', () => {
    if (!typingInput.disabled) {
        typingInput.focus();
    }
});

restartBtn.addEventListener('click', () => {
    typingInput.disabled = false;
    initGame();
});

// Initial start
initGame();
