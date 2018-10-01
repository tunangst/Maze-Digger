let size;
let column;
let row;
let board = [];
let stack = [];
let played = [];
let max;
// let maxAnimation;
let border;
let current;
let next;
let visitedCount;
let delay = 1000;
let stop = false;
let frameCount = 0;
let fps = 10;
let keyName;
let keyDirection;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = size * column;
canvas.height = size * row;

/////////////////////////////////dig//////////////////////////////
function dig() {
  start();
  let fpsInterval;
  let startTime;
  let now;
  let then;
  let elapsed;
  function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
  }
  function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      doIt();
    }
  }
  doIt = () => {
    next = current.checkNeighbors();
    removeWalls();
    if (next) {
      if (next === max) {
        next.end = true;
      }
      visitedCount++;
      next.visited = true;
      current = next;
      startBuild();
      stack.push(current);
    } else if (stack.length > 0) {
      current = stack.pop();
      startBuild();
    }
  }
  if (!current) {
    current = board[0][0];
    visitedCount++;
  }
  stack.push(current);
  current.build();
  current.visited = true;
  startAnimating(fps);
}
///////////////////////////////setup//////////////////////////////
const setup = () => {
  for (let rowIndex = 0; rowIndex < row; rowIndex++) {
    let cellRow = [];
    for (let columnIndex = 0; columnIndex < column; columnIndex++) {
      let cellBlock;
      cellBlock = Object.create(cell);
      cellBlock.rowNumber = rowIndex;
      cellBlock.columnNumber = columnIndex;
      cellBlock.walls = [true, true, true, true,];
      cellBlock.visited = false;
      cellBlock.end = false;
      cellBlock.path = false;
      cellRow.push(cellBlock);
    }
    board.push(cellRow);
  }
}

////////////////////////////////cell//////////////////////////////
let cell = {
  rowNumber: 0,
  columnNumber: 0,
  visited: false,
  end: false,
  path: false,
  walls: [
    true, true, true, true,
  ],
  checkNeighbors: function () {
    let neighbors = [];
    let r = this.rowNumber;
    let c = this.columnNumber;
    let top;
    let right;
    let bottom;
    let left;
    if (r === row - 1 && c === column - 1) {
      neighbors = [];
      return;
    }
    if (r - 1 >= 0) {
      top = board[r - 1][c];
    }
    if (c + 1 < column) {
      right = board[r][c + 1];
    }
    if (r + 1 < row) {
      bottom = board[r + 1][c];
    }
    if (c - 1 >= 0) {
      left = board[r][c - 1];
    }
    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }
    if (neighbors.length > 0) {
      let randomNumber = Math.floor(Math.random() * neighbors.length);
      return neighbors[randomNumber];
    } else {
      return undefined;
    }
  },
  //////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////
  build: function () {
    let col = this.columnNumber;
    let ro = this.rowNumber;
    let x = col * size;
    let y = ro * size;
    let a = (col + 1) * size;
    let b = (ro + 1) * size;

    ctx.lineCap = 'round';
    ctx.lineWidth = border;
    ctx.strokeStyle = "#331E10";
    if (this.visited) {
      ctx.fillStyle = '#197177';
      ctx.fillRect(x, y, size, size);
    }
    if (this.end) {
      ctx.fillStyle = '#63E5EF';
      ctx.fillRect(x, y, size, size);
    }
    if (this.path) {
      ctx.fillStyle = 'rgba(99,229,239,.4)';
      ctx.fillRect(x, y, size, size);
    }
    if (current === board[ro][col]) {
      ctx.fillStyle = "#63E5EF";
      ctx.fillRect(x, y, size, size);
    }
    if (this.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(a, y);
      ctx.stroke();
    }
    if (this.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(a, y);
      ctx.lineTo(a, b);
      ctx.stroke();
    }
    if (this.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x, b);
      ctx.lineTo(a, b);
      ctx.stroke();
    }
    if (this.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, b);
      ctx.stroke();
    }

  },
}

//////////////////////////////startbuild//////////////////////////
const startBuild = () => {
  for (let i = 0; i < board.length; i++) {
    let boardLayout = board[i];
    for (let j = 0; j < boardLayout.length; j++) {
      boardLayout[j].build()
    }
  }
}
const startPlayedBuild = () => {
  for (let i = 0; i < played.length; i++) {
    played[i].build()
  }
}
////////////////////////////removewalls///////////////////////////
const removeWalls = () => {
  if (next) {
    if (current.rowNumber < next.rowNumber) {
      current.walls[2] = false;
      next.walls[0] = false;

    } else if (current.rowNumber > next.rowNumber) {
      current.walls[0] = false;
      next.walls[2] = false;

    } else if (current.columnNumber < next.columnNumber) {
      current.walls[1] = false;
      next.walls[3] = false;

    } else if (current.columnNumber > next.columnNumber) {
      current.walls[3] = false;
      next.walls[1] = false;
    } else {
      console.log('messup')
    }
  }
}
const win = () => {
  if (current === max) {
    console.log('you win!');
    played.forEach(function (cell) {
      cell.end = true;
    })
  }
}
////////////////////////////////play//////////////////////////////
function play() {
  if (current === board[0][0]) {
    played.push(current);
  }
  current = board[0][0];
  window.addEventListener('keydown', (event) => {
    let keyName = event.key;
    let keyDirection = event.keyCode;
    let r = current.rowNumber;
    let c = current.columnNumber;

    if (!current.walls[0] && r - 1 >= 0 && (keyDirection == '38' || keyName === 'w')) {
      // can move up
      current.path = true;
      current = board[r - 1][c];
      win();
    }
    if (!current.walls[1] && c + 1 < column && (keyDirection == '39' || keyName === 'd')) {
      // can move right
      current.path = true;
      current = board[r][c + 1];
      win();
    }
    if (!current.walls[2] && r + 1 < row && (keyDirection == '40' || keyName === 's')) {
      // can move down
      current.path = true;
      current = board[r + 1][c];
      win();
    }
    if (!current.walls[3] && c - 1 >= 0 && (keyDirection == '37' || keyName === 'a')) {
      // can move left
      current.path = true;
      current = board[r][c - 1];
      win();
    }
    if (current === played[played.length - 2]) {
      played[played.length - 1].path = false;
      startPlayedBuild();
      played.pop();
      played.pop();
    }
    if (current !== played[played.length - 1]) {
      played.push(current);
    }
    startPlayedBuild();
  });
}
////////////////////////////////start/////////////////////////////
const start = () => {
  visitedCount = 0;
  board = [];
  stack = [];
  size = document.querySelector('#size').value;
  column = document.querySelector('#columns').value;
  row = document.querySelector('#rows').value;
  border = document.querySelector('#border').value;
  fps = document.querySelector('#speed').value;
  digging = document.getElementById("dig").onclick = dig;
  playing = document.getElementById("play").onclick = play;
  canvas.width = size * column;
  canvas.height = size * row;
  setup();
  max = board[row - 1][column - 1];
}

////////////////////////////////load//////////////////////////////
window.onLoad = start();

// add speed range on display
// fix play button
// swap out the blocks to be wait or speed boost
// win screen, replace canvas with you win
//////////////////////