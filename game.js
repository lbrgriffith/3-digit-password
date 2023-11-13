let password = Array.from(String(Math.floor(Math.random() * 900 + 100)), Number);
let attempts = 0;
let score = 100;
let history = [];
let hintUsed = false;
let lastGuess = [];

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
    let feedback = '';
    let correctWellPlaced = 0;
    let correctButWrongPlace = 0;
    let guessCopy = [...guess];

    for (let i = 0; i < 3; i++) {
        if (guessCopy[i] === password[i]) {
            correctWellPlaced++;
            guessCopy[i] = null;
            document.getElementById('guess' + (i + 1)).readOnly = true; // Make correct guesses read-only
        }
    }

    guessCopy.forEach((num, i) => {
        if (num !== null && password.includes(num) && num !== password[i]) {
            correctButWrongPlace++;
        }
    });

    feedback = `<strong>${correctWellPlaced}</strong> number(s) correct and well placed. ` +
               `<strong>${correctButWrongPlace}</strong> number(s) correct but in the wrong position.`;

    if (!isHint) {
        attempts++;
        document.getElementById('attemptsLeft').innerHTML = 10 - attempts;
    }

    updateHistory(guess.join(''), feedback, isHint);

    if (correctWellPlaced === 3) {
        feedback = 'Congratulations! You guessed it right.';
        revealPassword();
    } else {
        if (!isHint) {
            score -= 10;
        }
        document.getElementById('score').innerText = 'Score: ' + score + '%';
        document.getElementById('feedback').innerText = feedback;
    }

    hintUsed = false;

    if (score === 0 || attempts === 10) {
        feedback = 'Game over. Your final score is ' + score + '%.';
        document.getElementById('feedback').innerText = feedback;
        revealPassword();
    }
}

function useHint() {
    if (score > 0 && !hintUsed) {
        hintUsed = true;
        score -= 10;
        document.getElementById('score').innerText = 'Score: ' + score + '%';

        for (let i = 0; i < 3; i++) {
            let guessInput = document.getElementById('guess' + (i + 1));
            if (lastGuess[i] === password[i]) {
                guessInput.value = password[i];
                guessInput.disabled = true;
                guessInput.style.backgroundColor = 'lightgreen';
            } else {
                guessInput.value = ''; // Clear incorrect guesses
            }
        }

        document.getElementById('hintButton').disabled = true;
        processGuess(lastGuess, true);
    }
    updateGuessButtonState();
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
    
    historyElement.innerHTML = '<h4>Guess History:</h4>' + history.map((h, index) => 
        '<p>' + (index + 1) + '. <strong>' + h.guess + '</strong> - ' + h.feedback + (h.hint ? ' (' + h.hint + ')' : '') + '</p>').join('');
}


function revealPassword() {
    let finalAnswer = document.getElementById('finalAnswer');
    finalAnswer.style.display = 'block';
    finalAnswer.innerHTML = '<strong>' + password.join('') + '</strong> was the password!';
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
