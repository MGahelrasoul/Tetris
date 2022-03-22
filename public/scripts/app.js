const canvas    = document.getElementById("tetrisCanvas"),
    nextCanvas  = document.getElementById("nextCanvas"),
    startBtn    = document.getElementById("startBtn"),
    easyBtn    = document.getElementById("easyBtn"),
    normalBtn = document.getElementById("normalBtn");

let isPaused    = true,
    gameOver    = false,
    counter     = 0,
    context     = canvas.getContext("2d"),
    nextContext = nextCanvas.getContext("2d"),
    arena = createMatrix(canvas.width / 20, canvas.height / 20),
    nextArena = createMatrix(nextCanvas.width / 20, nextCanvas.height / 20);

context.scale(20, 20);
nextContext.scale(20, 20);

const pieces = "TOLJISZ";
const colors = [
    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF",
];

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}
// const ghost = {
//     pos: {x: player.pos.x, y: player.pos.y + arena[player.pos.y]},
//     matrix: player.matrix,
// }
const next = {
    pos: {x: 0, y: 0},
    matrix: createPiece(pieces[pieces.length * Math.random() | 0]),
}

// Return a matrix given width, height
function createMatrix(w, h) {
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Draw the canvas' arena, player, and next piece matrix
function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
    // drawMatrix(ghost.matrix, ghost.pos);

    nextContext.fillStyle = "#000";
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawNextMatrix(nextArena, {x: 0, y: 0});
    drawNextMatrix(next.matrix, next.pos);
}
// Draw a new matrix in canvas given matrix, position
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
// Draw a new matrix in nextCanvas given matrix, position
function drawNextMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                nextContext.fillStyle = colors[value];
                nextContext.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Define the Pieces as matrices under the array TOLJISZ
function createPiece(type){
    if (type === "T") {
        return [[1, 1, 1],
                [0, 1, 0],
                [0, 0, 0],];
    } else if (type === "O") {
        return [[2, 2],
                [2, 2],];
    } else if (type === "L") {
        return [[0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],];
    } else if (type === "J") {
        return [[0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],];
    } else if (type === "I") {
        return [[0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],];
    } else if (type === "S") {
        return [[0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],];
    } else if (type === "Z") {
        return [[7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],];
    }
}

// Move the player left and right
//Move the player down
//Rotate the player
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        if((counter / 5) >= 2) {
            let temp = (counter - (counter % 5)) / 5;
            player.score += temp;
            counter -= temp * 5;
        }
        updateScore();
    }
    counter += 0.5;
    dropCounter = 0;
}
function playerForceDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        if((counter / 5) >= 2) {
            let temp = (counter - (counter % 5)) / 5;
            player.score += temp;
            counter -= temp * 5;
        }
        updateScore();
        return
    }
    counter ++;
    playerForceDrop();
}
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
        }
    }
    return false;
}
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// Rotate the matrix
function rotate(matrix, dir) {
    for(let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Function that keeps track of time/updates the page after a set time
let dropCounter = 0;
let lastTime = 0;

function update(time = 0){
    if (!isPaused) {
        const deltaTime = time - lastTime;
        lastTime = time;
        // console.log(time + " " + deltaTime + " " + dropCounter);
        dropCounter += deltaTime;
        if (dropCounter > 1000) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }
}

function playerReset() {
    player.matrix = next.matrix;
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    next.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    next.pos.y = 2 - (next.matrix.length / 2 | 0);
    next.pos.x = 2 - (next.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        updateScore();
        gameEnd();
    }
}
function updateScore() {
    document.getElementById("score").innerText = player.score;
}

// Add Event listeners
document.addEventListener("keydown", event => {
    if((event.keyCode === 39 || event.keyCode === 68) && !isPaused) {
        playerMove(1);
    } else if ((event.keyCode === 37 || event.keyCode === 65) && !isPaused){
        playerMove(-1);
    } else if ((event.keyCode === 40 || event.keyCode === 83 && !isPaused)){
        playerDrop();
    } else if ((event.keyCode === 38 || event.keyCode === 87) && !isPaused){
        playerRotate(1);
    } else if (event.keyCode === 32 && !isPaused) {
        playerForceDrop();
    }
})
startBtn.addEventListener("click", event => {
    if (!gameOver) {
        if(!isPaused) {
            isPaused = true;
            startBtn.textContent = "Play";
        }else {
            isPaused = false;
            startBtn.textContent = "Pause";
            update();
        }
    } else {
        gameOver = false;
        isPaused = false;
        startBtn.textContent = "Pause";
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        playerReset();
        update();
    }
})
normalBtn.addEventListener("click", event => {
    canvas.width = 384;
    canvas.height = 640;
    nextCanvas.width = 128;
    nextCanvas.height  = 128;
    arena = createMatrix(canvas.width / 16, canvas.height / 16);
    nextArena = createMatrix(nextCanvas.width / 16, nextCanvas.height / 16);
    draw();
    gameEnd();
    updateScore();
    playerReset();
    context.scale(16, 16);
    nextContext.scale(16, 16);
})
easyBtn.addEventListener("click", event => {
    canvas.width = 240;
    canvas.height = 400;
    nextCanvas.width = 80;
    nextCanvas.height = 80;
    arena = createMatrix(canvas.width / 20, canvas.height / 20);
    nextArena = createMatrix(nextCanvas.width / 20, nextCanvas.height / 20);
    draw();
    gameEnd();
    updateScore();
    playerReset();
    context.scale(20, 20);
    nextContext.scale(20, 20);
})

function start(){
    updateScore();
    playerReset();
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    nextContext.fillStyle = "#000";
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
}
function gameEnd() {
    isPaused = true;
    gameOver = true;
    startBtn.textContent = "New Game";
}
    
start();
