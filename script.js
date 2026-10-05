const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const shieldTextEl = document.getElementById('shieldText');
const finalScoreEl = document.getElementById('finalScore');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const quizScreen = document.getElementById('quizScreen');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizCategory = document.getElementById('quizCategory');
const quizFeedback = document.getElementById('quizFeedback');

let score = 0;
let lives = 3;
let isPlaying = false;
let isQuizActive = false;
let shieldTimer = 0;
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
let quizOrbs = [];
let particles = [];

// Banco de Perguntas Educativas (Matemática e Astronomia para 11 anos)
const quizDatabase = [
  { category: "MATEMÁTICA", q: "Quanto é 8 x 7?", options: ["54", "56", "62", "48"], answer: 1, exp: "8 x 7 = 56" },
  { category: "MATEMÁTICA", q: "Qual é o resultado de 144 ÷ 12?", options: ["10", "11", "12", "14"], answer: 2, exp: "144 ÷ 12 = 12" },
  { category: "ASTRONOMIA", q: "Qual é o maior planeta do Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno"], answer: 2, exp: "Júpiter é o maior planeta!" },
  { category: "MATEMÁTICA", q: "Quanto é 25% de 100?", options: ["20", "25", "50", "10"], answer: 1, exp: "25% é o mesmo que 1/4 de 100, ou seja, 25." },
  { category: "ASTRONOMIA", q: "Qual planeta é conhecido como o 'Planeta Vermelho'?", options: ["Vênus", "Marte", "Mercúrio", "Netuno"], answer: 1, exp: "Marte é vermelho devido ao óxido de ferro em sua superfície." },
  { category: "MATEMÁTICA", q: "Qual é a raiz quadrada de 81?", options: ["7", "8", "9", "10"], answer: 2, exp: "9 x 9 = 81" },
  { category: "CIÊNCIAS", q: "Qual gás os seres humanos precisam respirar para sobreviver?", options: ["Gás Carbônico", "Nitrogênio", "Oxigênio", "Hélio"], answer: 2, exp: "Nossos pulmões absorvem Oxigênio do ar." }
];

window.addEventListener('mousemove', (e) => {
  if (!isPlaying || isQuizActive) return;
  const rect = canvas.getBoundingClientRect();
  player.targetX = e.clientX - rect.left;
  player.targetY = e.clientY - rect.top;
});

function spawnObstacle() {
  const radius = Math.random() * 15 + 10;
  let x = Math.random() < 0.5 ? -radius : canvas.width + radius;
  let y = Math.random() * canvas.height;
  
  const angle = Math.atan2(player.y - y, player.x - x);
  const speed = Math.random() * 2 + 1.5 + (score / 100);
  
  obstacles.push({ x, y, radius, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: '#ff0055' });
}

function spawnCollectible() {
  collectibles.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    radius: 8,
    color: '#ffcc00'
  });
}

function spawnQuizOrb() {
  if (quizOrbs.length === 0) {
    quizOrbs.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 60) + 30,
      radius: 12,
      color: '#00ff88'
    });
  }
}

function openQuiz() {
  isQuizActive = true;
  quizScreen.classList.remove('hidden');
  quizFeedback.textContent = '';

  const qData = quizDatabase[Math.floor(Math.random() * quizDatabase.length)];
  quizCategory.textContent = `DESAFIO: ${qData.category}`;
  quizQuestion.textContent = qData.q;
  quizOptions.innerHTML = '';

  qData.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => {
      if (idx === qData.answer) {
        quizFeedback.style.color = '#00ff88';
        quizFeedback.textContent = `CORRETO! Escudo ativado por 5 segundos! (+20 pts)`;
        score += 20;
        shieldTimer = 300; // 5 segundos a 60fps
        scoreEl.textContent = score;
      } else {
        quizFeedback.style.color = '#ff0055';
        quizFeedback.textContent = `Incorreto! Resposta certa: ${qData.exp}`;
      }
      setTimeout(() => {
        quizScreen.classList.add('hidden');
        isQuizActive = false;
      }, 1800);
    };
    quizOptions.appendChild(btn);
  });
}

function update() {
  if (!isPlaying || isQuizActive) return;

  frameCount++;

  if (shieldTimer > 0) {
    shieldTimer--;
    shieldTextEl.textContent = `${Math.ceil(shieldTimer / 60)}s`;
    shieldTextEl.style.color = '#00ff88';
  } else {
    shieldTextEl.textContent = 'INATIVO';
    shieldTextEl.style.color = '#a0a0d0';
  }

  player.x += (player.targetX - player.x) * 0.15;
  player.y += (player.targetY - player.y) * 0.15;

  if (frameCount % Math.max(25, 60 - Math.floor(score / 20)) === 0) spawnObstacle();
  if (collectibles.length < 3 && Math.random() < 0.02) spawnCollectible();
  if (frameCount % 300 === 0) spawnQuizOrb();

  // Coleta de orbes normais
  collectibles.forEach((c, index) => {
    if (Math.hypot(player.x - c.x, player.y - c.y) < player.radius + c.radius) {
      score += 10;
      scoreEl.textContent = score;
      collectibles.splice(index, 1);
    }
  });

  // Coleta de Orbe de Quiz
  quizOrbs.forEach((q, index) => {
    if (Math.hypot(player.x - q.x, player.y - q.y) < player.radius + q.radius) {
      quizOrbs.splice(index, 1);
      openQuiz();
    }
  });

  // Obstáculos / Colisão
  obstacles.forEach((o, index) => {
    o.x += o.vx;
    o.y += o.vy;

    if (Math.hypot(player.x - o.x, player.y - o.y) < player.radius + o.radius) {
      if (shieldTimer <= 0) {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) endGame();
      }
      obstacles.splice(index, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!isPlaying) return;

  // Orbes Normais
  collectibles.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Orbes do Desafio Educativo (Verde brilhante)
  quizOrbs.forEach(q => {
    ctx.fillStyle = q.color;
    ctx.beginPath();
    ctx.arc(q.x, q.y, q.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Asteroides
  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jogador
  ctx.fillStyle = shieldTimer > 0 ? '#00ff88' : player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  // Anel do Escudo se estiver ativo
  if (shieldTimer > 0) {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  lives = 3;
  shieldTimer = 0;
  obstacles = [];
  collectibles = [];
  quizOrbs = [];
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  isPlaying = true;
  isQuizActive = false;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  quizScreen.classList.add('hidden');
}

function endGame() {
  isPlaying = false;
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

startBtn.onclick = (e) => { e.stopPropagation(); startGame(); };
restartBtn.onclick = (e) => { e.stopPropagation(); startGame(); };

requestAnimationFrame(gameLoop);
