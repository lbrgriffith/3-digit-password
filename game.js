class ConfettiPiece {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 0.5 + 0.75) * 15;
        this.gravity = Math.random() * 0.01 + 0.01;
        this.rotation = Math.PI * 2 * Math.random();
        this.rotationSpeed = Math.PI * 2 * Math.random() * 0.001;
        this.color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`;
        this.velocityX = Math.random() * 2 - 1;  // Horizontal movement
        this.velocityY = Math.random() * -3 - 1; // Initial upward movement
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity; // Gravity applied
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

class ConfettiCannon {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.confettiPieces = [];
    }

    start() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        for (let i = 0; i < 100; i++) {
            this.confettiPieces.push(new ConfettiPiece(Math.random() * this.canvas.width, Math.random() * this.canvas.height));
        }
        this.update();
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.confettiPieces.forEach(piece => {
            piece.update();
            piece.draw(this.ctx);
        });

        requestAnimationFrame(this.update.bind(this));
    }
}

function startConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';  // Make canvas fixed position
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';  // Allow click events to pass through
    canvas.style.zIndex = '9999';  // High z-index to ensure it's on top
    document.body.appendChild(canvas);
    const confetti = new ConfettiCannon(canvas);
    confetti.start();
}


let password = Array.from(String(Math.floor(Math.random() * 900 + 100)), Number);
let attempts = 0;
let score = 100; // Starting score as an integer
let history = [];
let hintUsed = false;
let lastGuess = [];

// Set focus to the first input box when the page loads
window.onload = () => {
    document.getElementById('guess1').focus();
};

function clearInputs() {
    // Clear inputs and reset focus
    for (let i = 1; i <= 3; i++) {
        let input = document.getElementById('guess' + i);
        input.value = '';
        input.disabled = false; // Re-enable in case it was disabled
    }
    document.getElementById('guess1').focus(); // Reset focus to the first input
}

function checkPassword() {
    lastGuess = [
        parseInt(document.getElementById('guess1').value),
        parseInt(document.getElementById('guess2').value),
        parseInt(document.getElementById('guess3').value)
    ];

    processGuess(lastGuess, false);
    clearInputs();
}

function processGuess(guess, isHint) {
    let correctWellPlaced = 0;
    let correctButWrongPlace = 0;
    let usedPositions = new Set(); // To track used positions in the password

    // First pass to find correct and well-placed numbers
    for (let i = 0; i < 3; i++) {
        if (guess[i] === password[i]) {
            correctWellPlaced++;
            usedPositions.add(i);
        }
    }

    // Second pass to find correct but wrongly placed numbers
    for (let i = 0; i < 3; i++) {
        let indexOfNumInPassword = password.indexOf(guess[i]);
        if (guess[i] !== password[i] && password.includes(guess[i]) && !usedPositions.has(indexOfNumInPassword)) {
            correctButWrongPlace++;
            usedPositions.add(indexOfNumInPassword);
        }
    }

    let feedback = `${correctWellPlaced} correct and well placed | ` +
                   `${correctButWrongPlace} correct but wrongly placed`;

    if (!isHint) {
        attempts++;
        document.getElementById('attemptsLeft').innerHTML = 10 - attempts;
    }

    updateHistory(guess.join(''), feedback, isHint);

    if (correctWellPlaced === 3 || score <= 0 || attempts >= 10) {
        feedback = (correctWellPlaced === 3 ? 'Congratulations! You guessed it right.' : 'Game over. Your final score is ' + score + '%.');
        document.getElementById('feedback').innerText = feedback;
        revealPassword();
        if (correctWellPlaced === 3) {
            startConfetti();
        }
    } else {
        if (!isHint) {
            score -= 10; // Subtract 10 points for each guess
        }
        document.getElementById('score').innerText = 'Score: ' + score;
        document.getElementById('feedback').innerText = feedback;
    }

    hintUsed = false;
}



function useHint() {
    if (score > 0 && !hintUsed) {
        hintUsed = true;
        score -= 10;
        document.getElementById('score').innerText = 'Score: ' + score + '%';

        for (let i = 0; i < 3; i++) {
            let guessInput = document.getElementById('guess' + (i + 1));
            if (lastGuess[i] === password[i]) {
                guessInput.value = password[i]; // Display correct number
                guessInput.disabled = true; // Lock input
                guessInput.style.backgroundColor = 'lightgreen'; // Optional: change background to indicate correct guess
            }
        }

        document.getElementById('hintButton').disabled = true;
        // No need to call processGuess here as it's only for checking the guess
    }
}

function clearInputs() {
    for (let i = 1; i <= 3; i++) {
        let input = document.getElementById('guess' + i);
        if (!input.disabled) {
            input.value = '';
        }
    }
    document.getElementById('guess1').focus();
    updateGuessButtonState();
}

function updateHistory(guess, feedback, isHint) {
    let hintMessage = isHint ? 'Hint used' : '';
    history.push({ guess: guess, feedback: feedback, hint: hintMessage });
    let historyElement = document.getElementById('history');
    
    historyElement.innerHTML = '<h4>Guess History:</h4>' + history.slice().reverse().map((h, index) => 
        `<p>${index + 1}. <strong>${h.guess}</strong> - ${h.feedback} ${h.hint ? ' (' + h.hint + ')' : ''}</p>`).join('');
}

function revealPassword() {
    // Display the correct password in the input boxes
    for (let i = 0; i < 3; i++) {
        let guessInput = document.getElementById('guess' + (i + 1));
        guessInput.value = password[i];
        guessInput.disabled = true; // Optional: lock the input boxes
        guessInput.style.backgroundColor = '#ffff99'; // Optional: change background color
    }

    let finalMessage = score > 0 ? 'Congratulations! The correct number was ' : 'Game over. The correct number was ';
    document.getElementById('reveal').innerText = finalMessage + password.join('');
}


// Automatically focus the next input field and enable the guess button after a digit is entered
document.querySelectorAll('.guess-input').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value.length === 1) {
            let nextInput = this.nextElementSibling;
            if (nextInput && nextInput.classList.contains('guess-input')) {
                nextInput.focus();
            }
        }
        updateGuessButtonState();
    });
});

function updateGuessButtonState() {
    let allFilled = Array.from(document.querySelectorAll('.guess-input'))
                         .every(input => input.value.length === 1);
    document.getElementById('guessButton').disabled = !allFilled;
}

// Initialize event listeners for Enter key on input fields
function setupEnterKeySubmission() {
    document.getElementById('guess1').addEventListener('keypress', handleKeyPress);
    document.getElementById('guess2').addEventListener('keypress', handleKeyPress);
    document.getElementById('guess3').addEventListener('keypress', handleKeyPress);
}

// Function to handle keypress event on input fields
function handleKeyPress(event) {
    if (event.key === "Enter") {
        checkPassword();
    }
}

// Call the setup function at the end of the script
setupEnterKeySubmission();