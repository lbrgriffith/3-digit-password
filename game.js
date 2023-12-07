function checkPassword() {
  updateGameGuessState(); // Update the guess values
  if (lastGuess.length === 3) {
    processGuess(lastGuess, false);
  }
  clearDropzones(); // Clear the dropzones for the next guess
}

function updateGameGuessState() {
  lastGuess = [];
  for (let i = 1; i <= 3; i++) {
    let dropzone = document.getElementById(`dropzone${i}`);
    let number = dropzone.textContent;
    lastGuess.push(number ? parseInt(number, 10) : null);
  }

  // Update guess button state based on the filled dropzones
  document.getElementById("guessButton").disabled = !lastGuess.every(
    (num) => num !== null
  );
}

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 0.5 + 0.75) * 15;
    this.gravity = Math.random() * 0.01 + 0.01;
    this.rotation = Math.PI * 2 * Math.random();
    this.rotationSpeed = Math.PI * 2 * Math.random() * 0.001;
    this.color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)}, 1)`;
    this.velocityX = Math.random() * 2 - 1; // Horizontal movement
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
    this.ctx = canvas.getContext("2d");
    this.confettiPieces = [];
  }

  start() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    for (let i = 0; i < 100; i++) {
      this.confettiPieces.push(
        new ConfettiPiece(
          Math.random() * this.canvas.width,
          Math.random() * this.canvas.height
        )
      );
    }
    this.update();
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.confettiPieces.forEach((piece) => {
      piece.update();
      piece.draw(this.ctx);
    });

    requestAnimationFrame(this.update.bind(this));
  }
}

function startConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  const confetti = new ConfettiCannon(canvas);
  confetti.start();
}

let password = Array.from(
  String(Math.floor(Math.random() * 900 + 100)),
  Number
);
let attempts = 0;
let score = 100; // Starting score as an integer
let history = [];
let hintUsed = false;
let lastGuess = [];

function clearInputs() {
  // Clear inputs and reset focus
  for (let i = 1; i <= 3; i++) {
    let input = document.getElementById("guess" + i);
    input.value = "";
    input.disabled = false; // Re-enable in case it was disabled
  }
  document.getElementById("guess1").focus(); // Reset focus to the first input
}

// ... rest of your game logic ...

function processGuess(guess, isHint) {
  guess = guess.map(Number); // Convert guess array elements to numbers
  let correctWellPlaced = 0;
  let correctButWrongPlace = 0;
  let tempPassword = [...password]; // Copy of password for manipulation

  // First pass: Check for correct and well-placed numbers
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === tempPassword[i]) {
      correctWellPlaced++;
      tempPassword[i] = null; // Mark this number as counted
    }
  }

  // Second pass: Check for correct but wrongly placed numbers
  for (let i = 0; i < guess.length; i++) {
    let indexOfNumInPassword = tempPassword.indexOf(guess[i]);
    if (guess[i] !== password[i] && indexOfNumInPassword !== -1) {
      correctButWrongPlace++;
      tempPassword[indexOfNumInPassword] = null; // Mark this number as counted
    }
  }

  let feedback = `${correctWellPlaced} correct, well placed | ${correctButWrongPlace} correct, wrongly placed`;
  updateHistory(guess.join(""), feedback, isHint);

  if (correctWellPlaced === 3) {
    let winningMessageElement = document.getElementById("winningMessage");
    if (winningMessageElement) {
      winningMessageElement.innerText =
        "Congratulations! You guessed it right.";
    } else {
      console.error("winningMessage element not found");
    }
    displayWinningNumber();
    startConfetti();
    disableInputs();
  } else {
    if (!isHint) {
      attempts++;
      document.getElementById("attemptsLeft").innerText = 10 - attempts;
      score -= 10;
      document.getElementById("score").innerText = "Score: " + score;
    }

    if (score <= 0 || attempts >= 10) {
      let gameOverMessageElement = document.getElementById("winningMessage");
      if (gameOverMessageElement) {
        gameOverMessageElement.innerText =
          "Game over. The correct number was " + password.join("");
      }
      revealPassword();
      disableInputs();
    }
  }

  hintUsed = false;
}

function disableInputs() {
  const guessButton = document.getElementById("guessButton");
  const hintButton = document.getElementById("hintButton");

  if (guessButton) {
    guessButton.disabled = true;
  } else {
    console.log("Guess button not found");
  }

  if (hintButton) {
    hintButton.disabled = true;
  } else {
    console.log("Hint button not found");
  }
}

function clearZone(event) {
  event.target.textContent = ""; // Clear the content of the dropzone
  updateGameGuessState();
}

function disableInputs() {
  document.querySelectorAll(".dropzone").forEach((zone) => {
    zone.removeAttribute("draggable");
    zone.removeEventListener("click", clearZone);
  });
  document.getElementById("guessButton").disabled = true;
  document.getElementById("hintButton").disabled = true;
}

function clearZone(event) {
  event.target.textContent = ""; // Clear the content of the dropzone
  updateGameGuessState();
}

function disableInputs() {
  for (let i = 1; i <= 3; i++) {
    document.getElementById("guess" + i).disabled = true;
  }
  document.getElementById("guessButton").disabled = true;
  document.getElementById("hintButton").disabled = true;
}

function disableInputs() {
  document.getElementById("guessButton").disabled = true;
  document.getElementById("hintButton").disabled = true;
}

function giveUp() {
  // Reveal the correct password
  revealPassword();

  // Disable further inputs and buttons
  document.querySelectorAll(".dropzone").forEach((zone) => {
    zone.classList.add("disabled"); // Disable the dropzones
  });

  const guessButton = document.getElementById("guessButton");
  const hintButton = document.getElementById("hintButton");

  if (guessButton) guessButton.disabled = true;
  if (hintButton) hintButton.disabled = true;

  // Update the game over message
  document.getElementById("winningMessage").innerText =
    "Game over. The correct number was " + password.join("");
}

function useHint() {
  if (score > 0 && !hintUsed) {
    hintUsed = true;
    score -= 10; // Deduct points for using a hint
    document.getElementById("score").innerText = "Score: " + score;

    // Reveal and lock the first digit of the password
    let firstDropzone = document.getElementById("dropzone1");
    firstDropzone.textContent = password[0];
    firstDropzone.classList.add("disabled"); // Lock this dropzone

    document.getElementById("hintButton").disabled = true; // Disable further use of hint
  }
}

function displayWinningNumber() {
  for (let i = 0; i < password.length; i++) {
    let dropzone = document.getElementById(`dropzone${i + 1}`);
    dropzone.textContent = password[i];
    dropzone.classList.add("disabled"); // Optionally disable further interaction
  }
}

function clearInputs() {
  for (let i = 1; i <= 3; i++) {
    let input = document.getElementById("guess" + i);
    if (!input.disabled) {
      input.value = "";
    }
  }
  document.getElementById("guess1").focus();
  updateGuessButtonState();
}

function updateHistory(guess, feedback, isHint) {
  let hintMessage = isHint ? "Hint used" : "";
  history.unshift({ guess: guess, feedback: feedback, hint: hintMessage }); // Add new guess to the start of the array

  let historyElement = document.getElementById("history");
  historyElement.innerHTML =
    "<h4>Guess History:</h4>" +
    history
      .map(
        (h) =>
          `<p><strong>${h.guess}</strong> - ${h.feedback} ${
            h.hint ? " (" + h.hint + ")" : ""
          }</p>`
      )
      .join("");
}

function revealPassword() {
  const correctPasswordElement = document.getElementById("correctPassword");
  correctPasswordElement.value = password.join(""); // or innerText/innerHTML, depending on the element
}

function clearDropzones() {
  // Clear the dropzones only if they are not disabled
  for (let i = 1; i <= 3; i++) {
    let dropzone = document.getElementById(`dropzone${i}`);
    if (!dropzone.classList.contains("disabled")) {
      dropzone.textContent = ""; // Clear the content of the dropzone
    }
  }
  updateGameGuessState(); // Update the game state after clearing
}

function updateGuessButtonState() {
  let allFilled = Array.from(document.querySelectorAll(".guess-input")).every(
    (input) => input.value.length === 1
  );
  document.getElementById("guessButton").disabled = !allFilled;
}

document.addEventListener("DOMContentLoaded", function () {
  // Attach the event listener to the guess button within the DOMContentLoaded scope
  var guessButton = document.getElementById("guessButton");
  if (guessButton) {
    guessButton.addEventListener("click", checkPassword);
  }

  // Automatically focus the next input field and enable the guess button after a digit is entered
  document.querySelectorAll(".guess-input").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.length === 1) {
        let nextInput = this.nextElementSibling;
        if (nextInput && nextInput.classList.contains("guess-input")) {
          nextInput.focus();
        }
      }
      updateGuessButtonState();
    });
  });

  // Function to handle keypress event on input fields
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      checkPassword();
    }
  }

  // Ensure Hammer.js is loaded
  if (typeof Hammer === "undefined") {
    console.error("Hammer.js is not loaded");
  } else {
    // Initialize Hammer.js on the draggable elements
    document.querySelectorAll(".draggable").forEach((elem) => {
      const hammer = new Hammer.Manager(elem);
      hammer.add(
        new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 10 })
      );

      let originalRect;

      hammer.on("panstart", function (ev) {
        originalRect = elem.getBoundingClientRect();
      });

      hammer.on("pan", function (ev) {
        const posX = originalRect.left + ev.deltaX;
        const posY = originalRect.top + ev.deltaY;

        elem.style.left = `${posX}px`;
        elem.style.top = `${posY}px`;
      });

      hammer.on("panend", function (ev) {
        const dropZone = document.elementFromPoint(ev.center.x, ev.center.y);
        if (dropZone && dropZone.classList.contains("dropzone")) {
          // Check if the dropzone is already filled
          if (!dropZone.classList.contains("filled")) {
            dropZone.textContent = elem.textContent;
            dropZone.classList.add("filled");
          }
        }

        // Reset position of draggable element
        elem.style.left = `${originalRect.left}px`;
        elem.style.top = `${originalRect.top}px`;

        checkAllDropzonesFilled();
      });
    });
  }

  function checkAllDropzonesFilled() {
    // Update the guess button state based on filled dropzones
    const allFilled = Array.from(document.querySelectorAll(".dropzone")).every(
      (dz) => dz.classList.contains("filled")
    );
    document.getElementById("guessButton").disabled = !allFilled;
  }

  function checkAllFilled() {
    // Check if all dropzones are filled
    const allFilled =
      document.querySelectorAll(".dropzone.filled").length ===
      document.querySelectorAll(".dropzone").length;
    document.getElementById("guessButton").disabled = !allFilled;
  }
});

// Attach event listener to the button
