const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const difficultySelector = document.getElementById('difficulty');
const generateButton = document.getElementById('generate');
const timeDisplay = document.getElementById('time');
const movesDisplay = document.getElementById('moves');
const playerImg = new Image();
const goalImg = new Image();

playerImg.src = 'player.webp';
goalImg.src = 'goal.webp';

let cols, rows;
let cellSize;
let grid = [];
let stack = [];
let player = { x: 0, y: 0 };
let goal = { x: 0, y: 0 };
let moves = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
  }

  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;

    ctx.strokeStyle = '#4ca4d0';
    ctx.lineWidth = 2;

    if (this.walls.top) drawLine(x, y, x + cellSize, y); // Top
    if (this.walls.right) drawLine(x + cellSize, y, x + cellSize, y + cellSize); // Right
    if (this.walls.bottom) drawLine(x, y + cellSize, x + cellSize, y + cellSize); // Bottom
    if (this.walls.left) drawLine(x, y, x, y + cellSize); // Left
  }

  highlight(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function setupMaze() {
  const difficulty = difficultySelector.value;
  switch (difficulty) {
    case 'mini':
      cols = rows = 6;
      break;
    case 'easy':
      cols = rows = 10;
      break;
    case 'normal':
      cols = rows = 15;
      break;
    case 'hard':
      cols = rows = 20;
      break;
  }

  cellSize = canvas.width / cols;
  grid = [];
  stack = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push(new Cell(x, y));
    }
  }

  generateMaze();
  resetGame();
}

function generateMaze() {
  const startCell = grid[0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const next = getUnvisitedNeighbor(current);

    if (next) {
      next.visited = true;
      removeWalls(current, next);
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  goal = grid[grid.length - 1];
  drawMaze();
}

function getUnvisitedNeighbor(cell) {
  const neighbors = [];

  const top = grid[index(cell.x, cell.y - 1)];
  const right = grid[index(cell.x + 1, cell.y)];
  const bottom = grid[index(cell.x, cell.y + 1)];
  const left = grid[index(cell.x - 1, cell.y)];

  if (top && !top.visited) neighbors.push(top);
  if (right && !right.visited) neighbors.push(right);
  if (bottom && !bottom.visited) neighbors.push(bottom);
  if (left && !left.visited) neighbors.push(left);

  return neighbors.length > 0
    ? neighbors[Math.floor(Math.random() * neighbors.length)]
    : undefined;
}

function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

function removeWalls(a, b) {
  const x = a.x - b.x;
  if (x === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (x === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }

  const y = a.y - b.y;
  if (y === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (y === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let cell of grid) {
    cell.draw();
  }

  const shrinkFactor = 0.7; 
  const playerSize = cellSize * shrinkFactor;
  const goalSize = cellSize * shrinkFactor;

  ctx.drawImage(
    playerImg,
    player.x * cellSize + (cellSize - playerSize) / 2,
    player.y * cellSize + (cellSize - playerSize) / 2,
    playerSize,
    playerSize
  );

  ctx.drawImage(
    goalImg,
    goal.x * cellSize + (cellSize - goalSize) / 2,
    goal.y * cellSize + (cellSize - goalSize) / 2,
    goalSize,
    goalSize
  );
}

function playerCell() {
  return grid[index(player.x, player.y)];
}

function resetGame() {
  player = { x: 0, y: 0 };
  moves = 0;
  timer = 0;
  gameStarted = false;
  clearInterval(timerInterval);
  timeDisplay.textContent = timer;
  movesDisplay.textContent = moves;
  drawMaze();
}

function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
    timerInterval = setInterval(() => {
      timer++;
      timeDisplay.textContent = timer;
    }, 1000);
  }
}

function movePlayer(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;

  const current = playerCell();
  const target = grid[index(newX, newY)];

  if (target) {
    let moved = false;
    if (dx === -1 && !current.walls.left) {
      player.x = newX;
      moved = true;
    }
    if (dx === 1 && !current.walls.right) {
      player.x = newX;
      moved = true;
    }
    if (dy === -1 && !current.walls.top) {
      player.y = newY;
      moved = true;
    }
    if (dy === 1 && !current.walls.bottom) {
      player.y = newY;
      moved = true;
    }

    if (moved) {
      moves++;
      movesDisplay.textContent = moves;
      drawMaze();
    }

    if (player.x === goal.x && player.y === goal.y) {
      clearInterval(timerInterval);
      alert(`¡Felicidades! Completaste el laberinto en ${timer} segundos con ${moves} movimientos.`);
      setupMaze();
    }
  }
}


document.addEventListener('keydown', (e) => {
  startTimer();

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
      movePlayer(1, 0);
      break;
  }
});

playerImg.onload = () => drawMaze();
goalImg.onload = () => drawMaze();

difficultySelector.addEventListener('change', setupMaze);
generateButton.addEventListener('click', setupMaze);

setupMaze();