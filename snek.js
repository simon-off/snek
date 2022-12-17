//===============================================//
//+++ QUERIES +++||------------------------------//
//===============================================//

const bodyEl = document.querySelector("body");
const mapEl = document.querySelector(".map");
const scoreEl = document.querySelector(".score");
const highScoreEl = document.querySelector(".high-score");
const restartEl = document.querySelector(".restart");

//===============================================//
//+++ GLOBAL VARIABLES +++||---------------------//
//===============================================//

const gridSquares = 16;
const gridSize = 32;
const mapSize = gridSquares * gridSize;
const center = gridSize * (gridSquares / 2);
const gameSpeed = 100;

let gameOver = false;
let score = 0;
let highScore = JSON.parse(localStorage.getItem("highScore")) ?? 0;
const changeScore = (points) => {
  if (points === 0) {
    score = 0;
  } else {
    score += points;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", JSON.stringify(highScore));
    }
  }
  highScoreEl.textContent = `high score: ${highScore}`;
  scoreEl.textContent = `score: ${score}`;
};

// mapEl style
mapEl.style.height = mapSize + "px";
mapEl.style.width = mapSize + "px";
bodyEl.style.setProperty("--grid-size", gridSize + "px");
bodyEl.style.setProperty("--grid-squares", gridSquares);

//===============================================//
//+++ SNAKE +++||--------------------------------//
//===============================================//

const snake = {
  init: function () {
    this.pos = [center, center];
    this.oldPos = [];
    this.dir = [0, 0];
    this.nextDir = [0, 0];
    this.tail = [];
    this.markup = null;
    this.markup = document.createElement("div");
    this.markup.classList.add("snake", "head");
    return this.markup;
  },

  changeDir: function (newDir) {
    if (newDir[0] === this.dir[0] * -1 && this.dir[0] !== 0) return;
    if (newDir[1] === this.dir[1] * -1 && this.dir[1] !== 0) return;
    this.nextDir = newDir;
  },

  move: function () {
    this.eat();
    this.dir = this.nextDir;
    this.oldPos = [...this.pos];

    // Step in current direction. Wrap around if out of bounds.
    this.pos[0] += this.dir[0] * gridSize;
    if (this.pos[0] >= mapSize || this.pos[0] < 0) {
      this.pos[0] += this.dir[0] * mapSize * -1;
    }
    this.pos[1] += this.dir[1] * gridSize;
    if (this.pos[1] >= mapSize || this.pos[1] < 0) {
      this.pos[1] += this.dir[1] * mapSize * -1;
    }
    updateCssPos(this);

    // Loop to check if i'm colliding with myself.
    for (let piece of this.tail) {
      if (this.pos[0] === piece.pos[0] && this.pos[1] === piece.pos[1]) {
        restartEl.classList.remove("hidden");
        gameOver = true;
      }
    }

    // Loop to move the tail.
    for (let i = this.tail.length - 1; i > 0; i--) {
      this.tail[i].pos = [...this.tail[i - 1].pos];
      updateCssPos(this.tail[i]);
    }
    if (this.tail.length > 0) {
      this.tail[0].pos = this.oldPos;
      updateCssPos(this.tail[0]);
    }
  },

  grow: function () {
    const tailPiece = {
      pos: [],
      oldPos: [],
      markup: document.createElement("div"),
    };
    tailPiece.markup.classList.add("snake", "tail");
    mapEl.append(tailPiece.markup);
    this.tail.push(tailPiece);
  },

  eat: function () {
    if (this.pos[0] === apple.pos[0] && this.pos[1] === apple.pos[1]) {
      apple.move();
      this.grow();
      changeScore(1);
    }
  },
};

//===============================================//
//+++ APPLE +++||--------------------------------//
//===============================================//

const apple = {
  pos: [center, center],

  init: function () {
    this.markup = document.createElement("div");
    this.markup.classList.add("apple");
    this.move();
    return this.markup;
  },

  move: function () {
    this.pos[0] = Math.floor(Math.random() * gridSquares) * gridSize;
    this.pos[1] = Math.floor(Math.random() * gridSquares) * gridSize;

    // Make sure the apple doesn't spawn in the snake
    for (let piece of snake.tail) {
      if (
        (this.pos[0] === piece.pos[0] && this.pos[1] === piece.pos[1]) ||
        (this.pos[0] === snake.pos[0] && this.pos[1] === snake.pos[1])
      ) {
        this.move();
      }
    }

    updateCssPos(this);
  },
};

//===============================================//
//+++ COMMON FUNCTIONS +++||---------------------//
//===============================================//

function updateCssPos(obj) {
  obj.markup.style.left = obj.pos[0] + "px";
  obj.markup.style.top = obj.pos[1] + "px";
}

function restart() {
  changeScore(0);
  restartEl.classList.add("hidden");

  const snakeEls = document.querySelectorAll(".snake");
  if (snakeEls.length > 0) snakeEls.forEach((el) => mapEl.removeChild(el));
  const applesEls = document.querySelectorAll(".apple");
  if (applesEls.length > 0) applesEls.forEach((el) => mapEl.removeChild(el));

  mapEl.append(snake.init());
  mapEl.append(apple.init());
  gameOver = false;
  gameLoop();
}

//===============================================//
//+++ GAME LOOP +++||----------------------------//
//===============================================//

const gameLoop = () => {
  if (!gameOver) {
    snake.move();

    setTimeout(() => {
      gameLoop();
    }, gameSpeed);
  }
};
restart();

//===============================================//
//+++ CONTROLS +++||-----------------------------//
//===============================================//

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW":
    case "ArrowUp":
      snake.changeDir([0, -1]);
      break;
    case "KeyS":
    case "ArrowDown":
      snake.changeDir([0, 1]);
      break;
    case "KeyA":
    case "ArrowLeft":
      snake.changeDir([-1, 0]);
      break;
    case "KeyD":
    case "ArrowRight":
      snake.changeDir([1, 0]);
      break;
    case "Space":
      if (gameOver) {
        restart();
      }
  }
});
