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
    document.body.appendChild(canvas);
    const confetti = new ConfettiCannon(canvas);
    confetti.start();
}
