// Game configuration and state variables
let GOAL_CANS = 25;          // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items

let GAME_TIME = 30;          // total time in seconds
let timeLeft = GAME_TIME;    // live countdown
let countdownInterval;       // holds the interval for timer

// difficulty settings
const difficultySettings = {
  easy:   { goal: 15, time: 30, speed: 1200 },
  normal: { goal: 25, time: 30, speed: 1000 },
  hard:   { goal: 35, time: 20, speed: 700  }
};

let currentMode = "normal";
let currentSpawnSpeed = difficultySettings[currentMode].speed;

const cansEl = document.getElementById('current-cans');
const timerEl = document.getElementById('timer');
const goalEl = document.getElementById('goal-display');
const achievementEl = document.getElementById('achievements');
const startBtn = document.getElementById('start-game');
const resetBtn = document.getElementById('reset-game');

const modeButtons = document.querySelectorAll('.mode-btn');

const winMessages = [
  "Clean water wins. You crushed it.",
  "You hit the goal — real impact energy.",
  "That speed could fund a well.",
  "You moved like access matters (because it does)."
];

const loseMessages = [
  "Close. Try again and keep collecting.",
  "Almost there — safe water is worth the hustle.",
  "You’re getting faster. Run it back.",
  "Not quite the goal… but you're learning."
];

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  cells.forEach(cell => (cell.innerHTML = ''));

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  const canEl = randomCell.querySelector('.water-can');

  // 25% chance to spawn a "dirty" can that subtracts points
  if (Math.random() < 0.25) {
    canEl.classList.add('dirty');
  }

  if (canEl) {
    canEl.addEventListener('click', () => {
      if (!gameActive) return;

      if (canEl.classList.contains('dirty')) {
        currentCans -= 1;
        if (currentCans < 0) currentCans = 0;
        cansEl.textContent = currentCans.toString();
        achievementEl.textContent = "-1 (unsafe water)";
        achievementEl.className = "achievement lose";
      } else {
        currentCans += 1;
        cansEl.textContent = currentCans.toString();
        achievementEl.textContent = "+1 collected";
        achievementEl.className = "achievement";
      }

      if (currentCans === Math.floor(GOAL_CANS / 2)) {
        achievementEl.textContent = "Halfway there";
        achievementEl.className = "achievement";
      }

      setTimeout(() => {
        if (gameActive) {
          achievementEl.textContent = "";
          achievementEl.className = "achievement";
        }
      }, 600);

      randomCell.innerHTML = '';
    });
  }
}

function startTimer() {
  timerEl.textContent = timeLeft.toString();

  countdownInterval = setInterval(() => {
    timeLeft -= 1;
    timerEl.textContent = timeLeft.toString();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active

  gameActive = true;
  currentCans = 0;

  GOAL_CANS = difficultySettings[currentMode].goal;
  GAME_TIME = difficultySettings[currentMode].time;
  currentSpawnSpeed = difficultySettings[currentMode].speed;

  timeLeft = GAME_TIME;

  cansEl.textContent = currentCans.toString();
  timerEl.textContent = timeLeft.toString();
  goalEl.textContent = GOAL_CANS.toString();
  achievementEl.textContent = "";
  achievementEl.className = "achievement";

  startBtn.classList.add('hidden');
  resetBtn.classList.add('hidden');

  createGrid();

  spawnInterval = setInterval(spawnWaterCan, currentSpawnSpeed);
  spawnWaterCan();

  startTimer();
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(countdownInterval);

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  if (currentCans >= GOAL_CANS) {
    const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    achievementEl.textContent = msg;
    achievementEl.className = "achievement win";
  } else {
    const msg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    achievementEl.textContent = msg;
    achievementEl.className = "achievement lose";
  }

  resetBtn.classList.remove('hidden');
  startBtn.classList.add('hidden');
}

function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(countdownInterval);

  currentCans = 0;

  cansEl.textContent = "0";
  achievementEl.textContent = "";
  achievementEl.className = "achievement";

  GOAL_CANS = difficultySettings[currentMode].goal;
  GAME_TIME = difficultySettings[currentMode].time;
  currentSpawnSpeed = difficultySettings[currentMode].speed;
  timeLeft = GAME_TIME;

  timerEl.textContent = GAME_TIME.toString();
  goalEl.textContent = GOAL_CANS.toString();

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  startBtn.classList.remove('hidden');
  resetBtn.classList.add('hidden');
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Set up click handler for reset
document.getElementById('reset-game').addEventListener('click', resetGame);

// difficulty button behavior
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;

    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    GOAL_CANS = difficultySettings[currentMode].goal;
    goalEl.textContent = GOAL_CANS.toString();

    timerEl.textContent = difficultySettings[currentMode].time.toString();
  });
});

// default state on load
modeButtons.forEach(b => {
  if (b.dataset.mode === currentMode) {
    b.classList.add('active');
  }
});
goalEl.textContent = difficultySettings[currentMode].goal.toString();
timerEl.textContent = difficultySettings[currentMode].time.toString();
cansEl.textContent = "0";
achievementEl.textContent = "";
achievementEl.className = "achievement";
