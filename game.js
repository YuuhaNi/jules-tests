document.addEventListener('DOMContentLoaded', () => {
    const passwordContainer = document.getElementById('password-container');
    const gameContainer = document.getElementById('game-container');
    const passwordInput = document.getElementById('password-input');
    const submitPasswordButton = document.getElementById('submit-password');
    const errorMessage = document.getElementById('error-message');

    if (!passwordContainer || !gameContainer || !passwordInput || !submitPasswordButton || !errorMessage) {
        console.error('Password protection elements not found!');
        if (errorMessage) errorMessage.textContent = 'Page setup error. Contact admin.';
        return;
    }

    function checkPassword() {
        const correctPassword = '12345';
        if (passwordInput.value === correctPassword) {
            passwordContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            errorMessage.textContent = '';
            if (typeof initializeGame === 'function') {
                initializeGame();
            } else {
                console.error('Game initialization function not yet defined.');
            }
        } else {
            errorMessage.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    submitPasswordButton.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });
});

// Game constants and variables
let canvas;
let ctx;
let paddle;
let ball;
let bricks;
let brickRowCount = 5;
let brickColumnCount = 8;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX;

const ballRadius = 10;
const ballColor = "coralblue";
const brickColor = "white";
const paddleColor = "#0095DD";

let rightPressed = false;
let leftPressed = false;
const paddleSpeed = 7;

// Score and game state
let score = 0;
let bricksLeft;
let animationFrameId; // For potentially stopping the game

function keyDownHandler(e) {
    if (e.key === "d" || e.key === "D" || e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "a" || e.key === "A" || e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "d" || e.key === "D" || e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "a" || e.key === "A" || e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found!');
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.innerHTML = '<p style="color:red;">Error: Game canvas not found.</p>';
        return;
    }
    ctx = canvas.getContext('2d');

    canvas.width = brickOffsetLeft + (brickColumnCount * (brickWidth + brickPadding)) - brickPadding + brickOffsetLeft;
    canvas.height = 480;

    paddleX = (canvas.width - paddleWidth) / 2;

    ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx: 2,
        dy: -2,
        radius: ballRadius,
        color: ballColor
    };

    paddle = {
        x: paddleX,
        y: canvas.height - paddleHeight - 5,
        width: paddleWidth,
        height: paddleHeight,
        color: paddleColor
    };

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColor };
        }
    }

    score = 0;
    bricksLeft = brickRowCount * brickColumnCount;

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    console.log('Game fully initialized. Starting game loop.');
    if(animationFrameId) cancelAnimationFrame(animationFrameId); // Clear previous loop if any
    gameLoop();
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                // Check if the ball's center is within the brick's x and y coordinates
                if (ball.x + ball.radius > b.x &&
                    ball.x - ball.radius < b.x + brickWidth &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brickHeight) {

                    ball.dy = -ball.dy; // Reverse vertical direction
                    b.status = 0; // Brick is hit
                    score++;
                    bricksLeft--;

                    if (bricksLeft === 0) {
                        alert("YOU WIN, CONGRATULATIONS! Score: " + score);
                        document.location.reload(); // Reload to restart
                        cancelAnimationFrame(animationFrameId); // Stop game
                        return;
                    }
                }
            }
        }
    }
}

function drawBall() {
    if (!ctx || !ball) return;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    if (!ctx || !paddle) return;
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    if (!ctx || !bricks) return;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX; // Store calculated position
                bricks[c][r].y = brickY; // Store calculated position
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    if (!ctx) return;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD"; // Or use paddleColor
    ctx.fillText("Score: " + score, 8, 20);
}

function gameLoop() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update paddle position
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddleSpeed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddleSpeed;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions (left/right/top)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;
        if (ball.x - ball.radius < 0) ball.x = ball.radius;
    }
    if (ball.y - ball.radius < 0) { // Top wall
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }

    // Paddle collision
    // Check if the ball is moving downwards and is at paddle level
    if (ball.dy > 0 && // Ball is moving down
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height && // Ball is vertically aligned with paddle
        ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width) { // Ball is horizontally aligned with paddle

        ball.dy = -ball.dy; // Reverse vertical direction
        // Optional: Adjust ball.dx based on where it hit the paddle
        // let hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        // ball.dx = hitPoint * 5; // Max dx change of 5
         ball.y = paddle.y - ball.radius; // prevent ball from getting stuck in paddle
    }
    // Game Over: Ball hits bottom wall
    else if (ball.y + ball.radius > canvas.height) {
        alert("GAME OVER. Score: " + score);
        document.location.reload();
        cancelAnimationFrame(animationFrameId); // Stop game
        return; // Important to stop this frame
    }

    collisionDetection(); // Check for brick collisions (updates score, bricksLeft, handles win)

    // Draw all elements
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    animationFrameId = requestAnimationFrame(gameLoop);
}
