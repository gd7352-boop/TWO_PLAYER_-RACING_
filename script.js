
const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");

const setup = document.getElementById("setup");
const game = document.getElementById("game");
const result = document.getElementById("result");

const levels = [
  {
    name: "Campo",
    distance: 2200,
    speed: 3.2,
    obstacles: 10,
    background: "#559b45",
    description: "Nivel fácil: una pista larga para comenzar."
  },
  {
    name: "Desierto",
    distance: 3200,
    speed: 3.8,
    obstacles: 17,
    background: "#d4a34d",
    description: "Nivel 2: más distancia y más obstáculos."
  },
  {
    name: "Montañas",
    distance: 4200,
    speed: 4.4,
    obstacles: 24,
    background: "#668b72",
    description: "Nivel 3: ¡la carrera se vuelve más difícil!"
  },
  {
    name: "Ciudad",
    distance: 5200,
    speed: 5,
    obstacles: 32,
    background: "#626b7a",
    description: "Nivel final: la carrera más larga y difícil."
  }
];

let levelIndex = 0;
let players = [];
let obstacles = [];
let keys = {};
let running = false;
let animationId = null;
let winner = null;

function createPlayers() {
  players = [
    {
      name: document.getElementById("name1").value.trim() || "Jugador 1",
      color: document.getElementById("color1").value,
      distance: 0,
      lane: 0,
      x: 0.5,
      speed: 0
    },
    {
      name: document.getElementById("name2").value.trim() || "Jugador 2",
      color: document.getElementById("color2").value,
      distance: 0,
      lane: 1,
      x: 0.5,
      speed: 0
    }
  ];
}

function createObstacles() {
  obstacles = [];
  const level = levels[levelIndex];

  for (let i = 0; i < level.obstacles; i++) {
    obstacles.push({
      distance: 250 + i * (level.distance - 400) / level.obstacles,
      x: 0.2 + Math.random() * 0.6,
      hit: [false, false]
    });
  }
}

function startGame() {
  cancelAnimationFrame(animationId);
  createPlayers();
  createObstacles();

  setup.classList.add("hidden");
  result.classList.add("hidden");
  game.classList.remove("hidden");

  running = true;
  winner = null;
  updateLevelInfo();
  gameLoop();
}

function updateLevelInfo() {
  const level = levels[levelIndex];
  document.getElementById("levelTitle").textContent =
    `Nivel ${levelIndex + 1}: ${level.name}`;
  document.getElementById("levelDescription").textContent =
    level.description;
}

function updatePlayer(player, index) {
  const level = levels[levelIndex];

  const accelerate = index === 0 ? "w" : "arrowup";
  const left = index === 0 ? "a" : "arrowleft";
  const right = index === 0 ? "d" : "arrowright";
  const brake = index === 0 ? "s" : "arrowdown";

  if (keys[accelerate]) {
    player.speed += 0.12;
  } else {
    player.speed -= 0.045;
  }

  if (keys[brake]) {
    player.speed -= 0.16;
  }

  player.speed = Math.max(0, Math.min(level.speed, player.speed));

  if (keys[left]) player.x -= 0.012;
  if (keys[right]) player.x += 0.012;

  player.x = Math.max(0.08, Math.min(0.92, player.x));

  player.distance += player.speed;

  for (const obstacle of obstacles) {
    const close = Math.abs(player.distance - obstacle.distance) < 24;
    const nearLane = Math.abs(player.x - obstacle.x) < 0.13;

    if (close && nearLane && !obstacle.hit[index]) {
      player.speed *= 0.25;
      obstacle.hit[index] = true;
    }
  }
}

function drawCar(x, y, color) {
  ctx.fillStyle = "#151515";
  ctx.fillRect(x - 15, y - 19, 7, 15);
  ctx.fillRect(x + 8, y - 19, 7, 15);
  ctx.fillRect(x - 15, y + 5, 7, 15);
  ctx.fillRect(x + 8, y + 5, 7, 15);

  ctx.fillStyle = color;
  ctx.fillRect(x - 12, y - 25, 24, 52);

  ctx.fillStyle = "#bdeaff";
  ctx.fillRect(x - 8, y - 15, 16, 12);

  ctx.fillStyle = "#fff4a8";
  ctx.fillRect(x - 9, y - 24, 5, 4);
  ctx.fillRect(x + 4, y - 24, 5, 4);
}

function drawLane(player, index) {
  const panelWidth = canvas.width / 2;
  const startX = index * panelWidth;
  const level = levels[levelIndex];

  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, 0, panelWidth, canvas.height);
  ctx.clip();

  ctx.fillStyle = level.background;
  ctx.fillRect(startX, 0, panelWidth, canvas.height);

  const roadLeft = startX + 45;
  const roadWidth = panelWidth - 90;

  ctx.fillStyle = "#45484e";
  ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(roadLeft, 0, 5, canvas.height);
  ctx.fillRect(roadLeft + roadWidth - 5, 0, 5, canvas.height);

  const stripeOffset = (player.distance * 2) % 80;
  ctx.fillStyle = "#eeeeee";

  for (let y = -80 + stripeOffset; y < canvas.height; y += 80) {
    ctx.fillRect(startX + panelWidth / 2 - 3, y, 6, 40);
  }

  const carY = canvas.height - 105;
  const carX = roadLeft + 15 + player.x * (roadWidth - 30);

  for (const obstacle of obstacles) {
    const screenY = carY - (obstacle.distance - player.distance);

    if (screenY > -30 && screenY < canvas.height + 30) {
      const obstacleX = roadLeft + 15 + obstacle.x * (roadWidth - 30);

      ctx.fillStyle = "#ffad24";
      ctx.fillRect(obstacleX - 13, screenY - 13, 26, 26);
      ctx.fillStyle = "#fff";
      ctx.fillRect(obstacleX - 13, screenY - 3, 26, 6);
    }
  }

  const remaining = level.distance - player.distance;
  if (remaining < 300) {
    const finishY = carY - remaining;
    if (finishY > -30 && finishY < canvas.height + 30) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(roadLeft + 5, finishY, roadWidth - 10, 14);

      ctx.fillStyle = "#222";
      for (let x = roadLeft + 5; x < roadLeft + roadWidth - 10; x += 24) {
        ctx.fillRect(x, finishY, 12, 14);
      }
    }
  }

  drawCar(carX, carY, player.color);

  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(player.name, startX + panelWidth / 2, 27);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLane(players[0], 0);
  drawLane(players[1], 1);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);
}

function updateInfo() {
  const level = levels[levelIndex];

  players.forEach((player, index) => {
    const percent = Math.min(
      100,
      Math.floor(player.distance / level.distance * 100)
    );

    document.getElementById(`info${index + 1}`).textContent =
      `${player.name}: ${percent}%`;
  });
}

function checkWinner() {
  const level = levels[levelIndex];

  for (const player of players) {
    if (player.distance >= level.distance) {
      winner = player;
      finishGame();
      return true;
    }
  }

  return false;
}

function gameLoop() {
  if (!running) return;

  updatePlayer(players[0], 0);
  updatePlayer(players[1], 1);

  drawGame();
  updateInfo();

  if (!checkWinner()) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function finishGame() {
  running = false;
  cancelAnimationFrame(animationId);

  game.classList.add("hidden");
  result.classList.remove("hidden");

  document.getElementById("resultTitle").textContent =
    `🏆 ¡Ganó ${winner.name}!`;

  document.getElementById("resultMessage").textContent =
    `¡Terminó el nivel ${levelIndex + 1}: ${levels[levelIndex].name}!`;

  const nextButton = document.getElementById("nextButton");

  if (levelIndex === levels.length - 1) {
    nextButton.textContent = "VOLVER A JUGAR DESDE EL NIVEL 1";
  } else {
    nextButton.textContent = "DESBLOQUEAR SIGUIENTE NIVEL";
  }
}

function nextLevel() {
  if (levelIndex < levels.length - 1) {
    levelIndex++;
  } else {
    levelIndex = 0;
  }

  startGame();
}

function backToSetup() {
  cancelAnimationFrame(animationId);
  running = false;
  result.classList.add("hidden");
  game.classList.add("hidden");
  setup.classList.remove("hidden");
  levelIndex = 0;
}

document.getElementById("startButton").addEventListener("click", () => {
  levelIndex = 0;
  startGame();
});

document.getElementById("nextButton").addEventListener("click", nextLevel);
document.getElementById("restartButton").addEventListener("click", backToSetup);

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if ([
    "arrowup", "arrowdown", "arrowleft", "arrowright", " "
  ].includes(key)) {
    event.preventDefault();
  }

  keys[key] = true;
});

document.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  keys = {};
});
