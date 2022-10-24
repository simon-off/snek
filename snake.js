// Queries
const map = document.querySelector(".map");

// Global constants
const gridSquares = 16;
const gridSize = 32;
const mapSize = gridSquares * gridSize;
const center = gridSize * (gridSquares / 2);

// Game update speed in ms
const gameSpeed = 100;

// Game over state
let gameOver = false;

// Map style
map.style.height = mapSize + "px";
map.style.width = mapSize + "px";
map.style.setProperty("--grid-size", gridSize + "px");
map.style.setProperty("--grid-squares", gridSquares);

// update css position function
function updateCssPos(el, pos) {
  el.style.left = pos[0] + "px";
  el.style.top = pos[1] + "px";
}

// Snake stuff!
const snake = {
  pos: [center, center],
  oldPos: [],
  dir: [0, 0],
  newDir: [0, 0],
  tail: [],

  init: function () {
    const markup = document.createElement("div");
    markup.classList.add("snake", "head");
    this.markup = markup;
    return this.markup;
  },

  changeDir: function () {
    if (this.dir[0] === 0 && this.dir[1] === 0) {
      this.dir = this.newDir;
      return;
    }
    if (this.newDir[0] === this.dir[0] * -1) return;
    if (this.newDir[1] === this.dir[1] * -1) return;
    this.dir = this.newDir;
  },

  move: function () {
    this.eat();
    this.oldPos = [...this.pos];

    this.pos[0] += this.dir[0] * gridSize;
    if (this.pos[0] >= mapSize || this.pos[0] < 0) {
      this.pos[0] += this.dir[0] * mapSize * -1;
    }
    this.pos[1] += this.dir[1] * gridSize;
    if (this.pos[1] >= mapSize || this.pos[1] < 0) {
      this.pos[1] += this.dir[1] * mapSize * -1;
    }
    updateCssPos(this.markup, this.pos);

    // Loop to check if i'm colliding with myself
    for (let piece of this.tail) {
      if (this.pos[0] === piece.pos[0] && this.pos[1] === piece.pos[1]) {
        gameOver = true;
      }
    }

    // Loop to move the tail
    for (let i = this.tail.length - 1; i > 0; i--) {
      this.tail[i].pos = [...this.tail[i - 1].pos];
      updateCssPos(this.tail[i].markup, this.tail[i].pos);
    }
    if (this.tail.length > 0) {
      this.tail[0].pos = this.oldPos;
      updateCssPos(this.tail[0].markup, this.tail[0].pos);
    }
  },

  grow: function () {
    const tailPiece = {};
    tailPiece.pos = [];
    tailPiece.oldPos = [];
    tailPiece.markup = document.createElement("div");
    tailPiece.markup.classList.add("snake", "tail");
    map.append(tailPiece.markup);
    this.tail.push(tailPiece);
  },

  eat: function () {
    if (this.pos[0] === apple.pos[0] && this.pos[1] === apple.pos[1]) {
      apple.move();
      this.grow();
    }
  },
};

const apple = {
  pos: [center, center],
  create: function () {
    const markup = document.createElement("div");
    markup.classList.add("apple");
    this.markup = markup;
    this.move();
    return this.markup;
  },
  move: function () {
    this.pos[0] = Math.floor(Math.random() * gridSquares) * gridSize;
    this.pos[1] = Math.floor(Math.random() * gridSquares) * gridSize;

    for (piece of snake.tail) {
      if (
        (this.pos[0] === piece.pos[0] && this.pos[1] === piece.pos[1]) ||
        (this.pos[0] === snake.pos[0] && this.pos[1] === snake.pos[1])
      ) {
        this.move();
      }
    }

    updateCssPos(this.markup, this.pos);
  },
};

function restart() {
  snake.pos = [center, center];
  updateCssPos(snake.markup, snake.pos);
  snake.tail.splice(0, snake.tail.length);
  document.querySelectorAll(".tail").forEach((el) => map.removeChild(el));
  gameOver = false;
  snake.dir[0] = 0;
  snake.dir[1] = 0;
  gameLoop();
}

map.append(snake.init());
map.append(apple.create());

// Game loop
const gameLoop = () => {
  if (!gameOver) {
    snake.changeDir();
    snake.move();

    setTimeout(() => {
      gameLoop();
    }, gameSpeed);
  }
};
gameLoop();

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW":
    case "ArrowUp":
      snake.newDir = [0, -1];
      break;
    case "KeyS":
    case "ArrowDown":
      snake.newDir = [0, 1];
      break;
    case "KeyA":
    case "ArrowLeft":
      snake.newDir = [-1, 0];
      break;
    case "KeyD":
    case "ArrowRight":
      snake.newDir = [1, 0];
      break;
    case "Space":
      if (gameOver) {
        restart();
      }
  }
});
