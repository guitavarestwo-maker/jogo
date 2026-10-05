const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const finalScoreEl = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let lives = 3;
let isPlaying = false;
let frameCount = 0;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 12,
  color: '#00f0ff',
  targetX: canvas.width / 2,
  targetY: canvas.height / 2
};

let obstacles = [];
let collectibles = [];
let particles = [];

// Acompanha movimento do mouse
window.addEventListener('mousemove', (e) => {
  if (!isPlaying) return;
  const rect = canvas.getBoundingClientRect();
  player.targetX = e.clientX - rect.left;
  player.targetY = e.clientY - rect.top;
});

// Suporte a toque para celulares
window.addEventListener('touchmove', (e) => {
  if (!isPlaying) return;
  const rect = canvas.getBoundingClientRect();
  player.targetX = e.touches[0].clientX - rect.left;
  player.targetY = e.touches[0].clientY - rect.top;
}, { passive: true });

function spawnObstacle() {
  const radius = Math.random() * 15 + 10;
  let x, y;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? -radius : canvas.width + radius;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? -radius : canvas.height + radius;
  }
  
  const angle = Math.atan2(player.y - y, player.x - x);
  const speed = Math.random() * 2 + 1.5 + (score / 100);
  
  obstacles.push({
    x, y, radius,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: '#ff0055'
  });
}

function spawnCollectible() {
  collectibles.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    radius: 8,
    color: '#ffcc00'
  });
}

function createExplosion(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 1,
      color,
      alpha: 1
    });
  }
}

function update() {
  if (!isPlaying) return;

  frameCount++;

  // Movimento suave da nave
  player.x += (player.targetX - player.x) * 0.15;
  player.y += (player.targetY - player.y) * 0.15;

  if (frameCount % Math.max(20, 60 - Math.floor(score / 20)) === 0) {
    spawnObstacle();
  }
  if (collectibles.length < 3 && Math.random() < 0.02) {
    spawnCollectible();
  }

  // Partículas
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    if (p.alpha <= 0) particles.splice(index, 1);
  });

  // Colecionáveis
  collectibles.forEach((c, index) => {
    const dist = Math.hypot(player.x - c.x, player.y - c.y);
    if (dist < player.radius + c.radius) {
      score += 10;
      scoreEl.textContent = score;
      createExplosion(c.x, c.y, c.color, 10);
      collectibles.splice(index, 1);
    }
  });

  // Obstáculos / Colisão
  obstacles.forEach((o, index) => {
    o.x += o.vx;
    o.y += o.vy;

    const dist = Math.hypot(player.x - o.x, player.y - o.y);
    if (dist < player.radius + o.radius) {
      lives--;
      livesEl.textContent = lives;
      createExplosion(player.x, player.y, '#ff0055', 25);
      obstacles.splice(index, 1);

      if (lives <= 0) {
        endGame();
      }
    }

    if (o.x < -50 || o.x > canvas.width + 50 || o.y < -50 || o.y > canvas.height + 50) {
      obstacles.splice(index, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha partículas
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  if (!isPlaying) return;

  // Desenha itens
  collectibles.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Desenha asteroides
  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Desenha jogador
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  lives = 3;
  obstacles = [];
  collectibles = [];
  particles = [];
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  isPlaying = true;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
}

function endGame() {
  isPlaying = false;
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

// Escutadores diretos nos botões
startBtn.onclick = function(e) {
  e.stopPropagation();
  startGame();
};

restartBtn.onclick = function(e) {
  e.stopPropagation();
  startGame();
};

requestAnimationFrame(gameLoop);
