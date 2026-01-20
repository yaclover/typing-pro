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
let characterIndex = 0;
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
    characterIndex = 0;
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
    
    updateDisplay();
    typingInput.value = '';
    typingInput.focus();
}

function updateDisplay() {
    const chars = textDisplay.querySelectorAll('.char');
    chars.forEach((char, index) => {
        char.classList.remove('current');
        if (index === characterIndex) {
            char.classList.add('current');
        }
    });

    timerDisplay.innerText = timeLeft;
    wpmDisplay.innerText = calculateWPM();
    accuracyDisplay.innerText = calculateAccuracy() + '%';
}

function calculateWPM() {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = characterIndex / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
}

function calculateAccuracy() {
    if (characterIndex === 0) return 100;
    const accuracy = ((characterIndex - errors) / characterIndex) * 100;
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
    alert(`Game Over! WPM: ${calculateWPM()} | Accuracy: ${calculateAccuracy()}%`);
}

typingInput.addEventListener('input', (e) => {
    if (!startTime) startTimer();

    const charTyped = e.target.value.slice(-1);
    const chars = textDisplay.querySelectorAll('.char');

    if (characterIndex < currentSentence.length) {
        if (charTyped === currentSentence[characterIndex]) {
            chars[characterIndex].classList.add('correct');
        } else {
            chars[characterIndex].classList.add('incorrect');
            errors++;
        }
        characterIndex++;
        
        if (characterIndex === currentSentence.length) {
            // Pick a new sentence but keep going until time runs out
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            const newChars = currentSentence.split('').map(char => {
                const span = document.createElement('span');
                span.classList.add('char');
                span.innerText = char;
                return span;
            });
            textDisplay.innerHTML = '';
            newChars.forEach(c => textDisplay.appendChild(c));
            characterIndex = 0;
        }
        
        updateDisplay();
    }
});

// Focus input when clicking anywhere on text display
document.addEventListener('click', () => {
    typingInput.focus();
});

restartBtn.addEventListener('click', () => {
    typingInput.disabled = false;
    initGame();
});

// Initial start
initGame();
