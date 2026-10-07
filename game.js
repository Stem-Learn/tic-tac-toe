const HUMAN = "X";
const COMPUTER = "O";
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const newGameButton = document.getElementById("new-game");
const cells = Array.from(boardEl.querySelectorAll("button"));

let board = Array(9).fill(null);
let locked = false;
let over = false;
const score = { wins: 0, losses: 0, draws: 0 };

function emptyIndexes(state) {
  const spots = [];
  state.forEach((mark, index) => {
    if (!mark) spots.push(index);
  });
  return spots;
}

function findWinner(state) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { player: state[a], line };
    }
  }
  return null;
}

function minimax(state, maximizing, depth) {
  const result = findWinner(state);
  if (result?.player === COMPUTER) return 10 - depth;
  if (result?.player === HUMAN) return depth - 10;
  const open = emptyIndexes(state);
  if (open.length === 0) return 0;

  let best = maximizing ? -Infinity : Infinity;
  for (const index of open) {
    state[index] = maximizing ? COMPUTER : HUMAN;
    const value = minimax(state, !maximizing, depth + 1);
    state[index] = null;
    if (maximizing) best = Math.max(best, value);
    else best = Math.min(best, value);
  }
  return best;
}

function bestMove(state) {
  let bestScore = -Infinity;
  const choices = [];
  for (const index of emptyIndexes(state)) {
    state[index] = COMPUTER;
    const value = minimax(state, false, 1);
    state[index] = null;
    if (value > bestScore) {
      bestScore = value;
      choices.length = 0;
      choices.push(index);
    } else if (value === bestScore) {
      choices.push(index);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

function updateScore() {
  scoreEl.textContent = `Wins ${score.wins} · Losses ${score.losses} · Draws ${score.draws}`;
}

function render(winningLine) {
  const won = new Set(winningLine || []);
  cells.forEach((cell, index) => {
    const mark = board[index];
    cell.textContent = mark || "";
    cell.classList.toggle("x", mark === HUMAN);
    cell.classList.toggle("o", mark === COMPUTER);
    cell.classList.toggle("win", won.has(index));
    cell.disabled = Boolean(mark) || over || locked;
  });
  updateScore();
}

function endGame(result) {
  over = true;
  locked = false;
  if (result.player === HUMAN) {
    score.wins += 1;
    statusEl.textContent = "You win";
  } else {
    score.losses += 1;
    statusEl.textContent = "Computer wins";
  }
  render(result.line);
}

function endDraw() {
  over = true;
  locked = false;
  score.draws += 1;
  statusEl.textContent = "Draw";
  render();
}

function finishIfNeeded() {
  const result = findWinner(board);
  if (result) {
    endGame(result);
    return true;
  }
  if (emptyIndexes(board).length === 0) {
    endDraw();
    return true;
  }
  return false;
}

function computerTurn() {
  locked = true;
  statusEl.textContent = "Computer is thinking";
  render();
  window.setTimeout(() => {
    if (over) return;
    board[bestMove(board)] = COMPUTER;
    locked = false;
    if (!finishIfNeeded()) {
      statusEl.textContent = "Your turn";
      render();
    }
  }, 400);
}

function onCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);
  if (locked || over || board[index]) return;
  board[index] = HUMAN;
  if (!finishIfNeeded()) {
    computerTurn();
  }
}

function newGame() {
  board = Array(9).fill(null);
  locked = false;
  over = false;
  statusEl.textContent = "Your turn";
  render();
}

cells.forEach((cell) => cell.addEventListener("click", onCellClick));
newGameButton.addEventListener("click", newGame);
render();
