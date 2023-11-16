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
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
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
    // Convert guess array elements to numbers for accurate comparison
    guess = guess.map(Number);

    // Check if maximum attempts have been reached and end the game if so
    if (attempts >= 10) {
        document.getElementById('feedback').innerText = 'No more attempts left. Game over.';
        revealPassword();
        disableInputs();
        return;
    }

    let correctWellPlaced = 0;
    let correctButWrongPlace = 0;
    let passwordCopy = [...password]; // Create a copy of the password for manipulation

    // Count correct and well-placed numbers
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === passwordCopy[i]) {
            correctWellPlaced++;
            passwordCopy[i] = null; // Mark this number as counted
        }
    }

    // Count correct but wrongly placed numbers
    for (let i = 0; i < guess.length; i++) {
        let indexOfNumInPasswordCopy = passwordCopy.indexOf(guess[i]);
        if (guess[i] !== password[i] && indexOfNumInPasswordCopy !== -1) {
            correctButWrongPlace++;
            passwordCopy[indexOfNumInPasswordCopy] = null; // Mark this number as counted
        }
    }

    // Directly include feedback in the history without separate display
    let feedback = `${correctWellPlaced} correct, well placed | ${correctButWrongPlace} correct, wrongly placed`;
    updateHistory(guess.join(''), feedback, isHint);

    if (correctWellPlaced === 3) {
        // Player has guessed the number correctly
        revealPassword();
        startConfetti();
        // Add winning message to history
        updateHistory(guess.join(''), 'Congratulations! You guessed it right.', false);
        disableInputs();
        return; // Exit the function to stop further processing
    } 

    if (!isHint) {
        attempts++;
        document.getElementById('attemptsLeft').innerHTML = 10 - attempts;
        score -= 10;
        document.getElementById('score').innerText = 'Score: ' + score;
    }

    if (attempts >= 10) {
        // Game over due to reaching maximum attempts
        revealPassword();
        disableInputs();
        // Add game over message to history
        updateHistory(guess.join(''), 'Game over. The correct number was ' + password.join(''), false);
    }

    hintUsed = false;
}

function disableInputs() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById('guess' + i).disabled = true;
    }
    document.getElementById('guessButton').disabled = true;
    document.getElementById('hintButton').disabled = true;
}


function disableInputs() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById('guess' + i).disabled = true;
    }
    document.getElementById('guessButton').disabled = true;
    document.getElementById('hintButton').disabled = true;
}



function giveUp() {
    // Reveal the correct password
    revealPassword();

    // Disable further inputs and buttons
    for (let i = 1; i <= 3; i++) {
        let input = document.getElementById('guess' + i);
        input.disabled = true;
    }
    document.getElementById('guessButton').disabled = true;
    document.getElementById('hintButton').disabled = true;

    // Update the game over message
    document.getElementById('feedback').innerText = 'Game over. The correct number was ' + password.join('');
    score = 0; // Optional: Set score to 0 as game is given up
    document.getElementById('score').innerText = 'Score: ' + score;
}


function useHint() {
    if (score > 0 && !hintUsed) {
        hintUsed = true;
        score -= 10;
        document.getElementById('score').innerText = 'Score: ' + score;

        // Iterate over each guess input
        for (let i = 0; i < 3; i++) {
            let guessInput = document.getElementById('guess' + (i + 1));
            if (guessInput.value === '' && password[i] === lastGuess[i]) {
                guessInput.value = password[i]; // Display correct number
                guessInput.disabled = true; // Lock input
                guessInput.style.backgroundColor = 'lightgreen'; // Optional: change background to indicate correct guess
            }
        }

        document.getElementById('hintButton').disabled = true;
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
    history.unshift({ guess: guess, feedback: feedback, hint: hintMessage }); // Add new guess to the start of the array

    let historyElement = document.getElementById('history');
    historyElement.innerHTML = '<h4>Guess History:</h4>' + history.map((h) => 
        `<p><strong>${h.guess}</strong> - ${h.feedback} ${h.hint ? ' (' + h.hint + ')' : ''}</p>`).join('');
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