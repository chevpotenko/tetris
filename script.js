const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const player = {
    pos: {x: 5, y: 5},
    matrix: createPiece('T')
}

let lastTime = 0,
    dropCounter = 0,
    dropInterval = 1000;

context.scale(20, 20);

const arena = createMatrix(12, 20);

function createPiece(type) {
    if(type ==='T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    }else if (type === 'O'){
        return [
            [1, 1],
            [1, 1]
        ];
    }else if (type === 'L'){
        return [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ];
    }else if (type === 'J'){
        return [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ];
    }else if (type === 'I'){
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0], 
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ];
    }else if (type === 'S'){
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ];
    }else if (type === 'Z'){
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ];
    }   
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    console.log(pieces.length * Math.random(), pieces[pieces.length * Math.random() | 0 ])
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0 ]);
    player.pos.y = 0;
    player.pos.x = (arena.length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; ++y) {
        for(let x = 0; x < m[y].length; ++x) {
            if(m[y][x] !== 0 &&
            (arena[y + o.y] && 
            arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerMove(dir) {
    player.pos.x += dir;
    if(collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0})
    drawMatrix(player.matrix, player.pos);
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    } 
    draw();
    requestAnimationFrame(update);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                context.fillStyle = 'red';
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });    
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
               arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });    
    });
}

function playerDrop() {
    player.pos.y++
    if(collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
    }
    dropCounter = 0;
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ]
        }   
    }
    if(dir > 0) {
        matrix.forEach(row => {row.reverse()})
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

document.addEventListener('keydown', (e) => {
    if(e.keyCode === 37){
       playerMove(-1);
    } else if(e.keyCode === 39) {
        playerMove(1);
    } else if(e.keyCode === 40) {
       playerDrop();
    } else if(e.keyCode === 81) {
        playerRotate(-1);
    } else if(e.keyCode === 87) {
        playerRotate(1);
    }    
});

update();