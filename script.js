const game = document.getElementById("game");
const road = document.querySelector(".road");
const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let playerX = 50;
let score = 0;
let best = Number(localStorage.getItem("highwayRacerBest") || 0);
let speed = 4;
let running = false;
let animationId = null;
let spawnTimer = null;
let lastTime = 0;

bestEl.textContent = best;

const laneCenters = [16.66, 50, 83.33];
const enemyColors = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea", "#0891b2"];

function setPlayerPosition() {
  player.style.left = `calc(${playerX}% - 29px)`;
}

function moveLeft() {
  if (!running) return;
  playerX = Math.max(16.66, playerX - 33.33);
  setPlayerPosition();
}

function moveRight() {
  if (!running) return;
  playerX = Math.min(83.33, playerX + 33.33);
  setPlayerPosition();
}

function spawnEnemy() {
  if (!running) return;

  const enemy = document.createElement("div");
  enemy.className = "enemy";
  const lane = laneCenters[Math.floor(Math.random() * laneCenters.length)];

  enemy.style.left = `calc(${lane}% - 29px)`;
  enemy.style.background = `linear-gradient(90deg, ${enemyColors[Math.floor(Math.random() * enemyColors.length)]}, #ef4444, #7f1d1d)`;
  enemy.dataset.y = "-125";
  enemy.dataset.lane = lane;
  enemies.appendChild(enemy);
}

function isColliding(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  return !(
    r1.bottom < r2.top + 12 ||
    r1.top > r2.bottom - 12 ||
    r1.right < r2.left + 8 ||
    r1.left > r2.right - 8
  );
}

function gameLoop(time) {
  if (!running) return;

  const delta = Math.min(32, time - lastTime || 16);
  lastTime = time;

  const moveAmount = speed * (delta / 16);

  document.querySelectorAll(".enemy").forEach(enemy => {
    let y = Number(enemy.dataset.y) + moveAmount;
    enemy.dataset.y = y;
    enemy.style.transform = `translateY(${y}px)`;

    if (isColliding(player, enemy)) {
      endGame();
    }

    if (y > road.clientHeight + 130) {
      enemy.remove();
      score++;
      scoreEl.textContent = score;

      if (score % 8 === 0) {
        speed += 0.35;
      }
    }
  });

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  cancelAnimationFrame(animationId);
  clearInterval(spawnTimer);

  document.querySelectorAll(".enemy").forEach(e => e.remove());

  score = 0;
  speed = 4;
  playerX = 50;
  setPlayerPosition();
  scoreEl.textContent = score;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  running = true;

  spawnTimer = setInterval(spawnEnemy, 850);
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  if (!running) return;

  running = false;
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);

  finalScore.textContent = score;

  if (score > best) {
    best = score;
    localStorage.setItem("highwayRacerBest", best);
    bestEl.textContent = best;
  }

  gameOverScreen.classList.remove("hidden");
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    e.preventDefault();
    moveLeft();
  }
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    e.preventDefault();
    moveRight();
  }
  if (e.key === "Enter" && !running) {
    startGame();
  }
});

leftBtn.addEventListener("pointerdown", moveLeft);
rightBtn.addEventListener("pointerdown", moveRight);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

setPlayerPosition();
