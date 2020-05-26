mazeColumns = 5;
mazeRows = 5;



var g = {maze:[], cmds:[], positions:[]};
var solved;
var visited;
var path;
var endX, endY;

function check(x, y) {
    if (g.maze[getId(x, y)] & SET)
        return 1
    return 0
}

function getId(x, y) {
    return x + y * mazeColumns
}


function isPossible(x, y) {
    var wall = g.maze[getId(x, y)];
    var pos = [];
    wall = wall ^ SET;
    pos[0] = 0;
    if (x === 0) {
        wall = wall ^ WEST;
    }
    if (y === 0) {
        wall = wall ^ NORTH;
    }
    if (x === mazeColumns - 1) {
        wall = wall ^ EAST;
    }
    if (y === mazeRows - 1) {
        wall = wall ^ SOUTH;
    }
    if (wall & EAST) {
        if (check(x + 1, y) === 0) {
            pos[0] = pos[0] + 1;
            pos[pos[0]] = EAST;
        }
    }
    if (wall & SOUTH) {
        if (check(x, y + 1) === 0) {
            pos[0] = pos[0] + 1;
            pos[pos[0]] = SOUTH;
        }
    }
    if (wall & WEST) {
        if (check(x - 1, y) === 0) {
            pos[0] = pos[0] + 1;
            pos[pos[0]] = WEST;
        }
    }
    if (wall & NORTH) {
        if (check(x, y - 1) === 0) {
            pos[0] = pos[0] + 1;
            pos[pos[0]] = NORTH;
        }
    }
    return pos;
}



function drawSquare(squareX,squareY,squareCode){//thanks @alkisg
    var c = document.getElementById("mycanvas");
    var ctx = c.getContext("2d");
    var gWidth = 42.3;//must be the scaling
    var gHeight = 30;
    ctx.lineWidth = 0.2;
    ctx.setLineDash([3]);
    ctx.beginPath();
    ctx.strokeRect(squareX,squareY,gWidth,gHeight);
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    if (squareCode & 1) {
        ctx.moveTo(squareX,squareY+gHeight);
        ctx.lineTo(squareX+gWidth,squareY+gHeight);
    }
    if (squareCode & 2) {
        ctx.moveTo(squareX,squareY);
        ctx.lineTo(squareX,squareY+gHeight);
    }
    if (squareCode & 4) {
        ctx.moveTo(squareX,squareY);
        ctx.lineTo(squareX+gWidth,squareY);
    }
    if (squareCode & 8) {
        ctx.moveTo(squareX+gWidth,squareY);
        ctx.lineTo(squareX+gWidth,squareY+gHeight);
    }
    ctx.stroke();
    ctx.closePath();
}

function generateMaze(x, y) {
    g.maze[getId(x, y)] = g.maze[getId(x, y)] + SET;
    var po = isPossible(x, y);
    while (po[0] > 0) {
        var ran = po[Math.floor(Math.random() * po[0]) + 1];
        switch (ran) {
        case EAST:
            g.maze[getId(x, y)] = g.maze[getId(x, y)] ^ EAST;
            g.maze[getId(x + 1, y)] = g.maze[getId(x + 1, y)] ^ WEST;
            generateMaze(x + 1, y);
            break
        case SOUTH:
            g.maze[getId(x, y)] = g.maze[getId(x, y)] ^ SOUTH;
            g.maze[getId(x, y + 1)] = g.maze[getId(x, y + 1)] ^ NORTH;
            generateMaze(x, y + 1);
            break
        case WEST:
            g.maze[getId(x, y)] = g.maze[getId(x, y)] ^ WEST;
            g.maze[getId(x - 1, y)] = g.maze[getId(x - 1, y)] ^ EAST;
            generateMaze(x - 1, y);
            break
        case NORTH:
            g.maze[getId(x, y)] = g.maze[getId(x, y)] ^ NORTH;
            g.maze[getId(x, y - 1)] = g.maze[getId(x, y - 1)] ^ SOUTH;
            generateMaze(x, y - 1);
            break
        }
        po = isPossible(x, y);
    }
}

function drawMazeonCanvas(){
    ge('stage').style.background = "none";
    c = document.getElementById('mycanvas');
    ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);

    for (var i=1; i<mazeColumns-1; i++)
    {
        for (var j=0; j<mazeRows; j++){
            drawSquare(i*42.6,120-j*30,g.maze[getId(i,j)]);
        }
    }


}

function newMaze(){
	level = 0;
	act.level  = 0;
    mazeRows = 5;
    mazeColumns = 5;
    endY = Math.round(Math.random()*4);

    do {
        g = {maze: []};
        for (var id = 0; id < mazeColumns * mazeRows; ++id) {
            g.maze[id] = 15;
        }
        
        // Generate g.maze 
        
        generateMaze(Math.floor(Math.random() * mazeColumns),
                 Math.floor(Math.random() * mazeRows));
        
        // Remove set 
        for (var id = 0; id < mazeColumns * mazeRows; ++id) {
            g.maze[id] = g.maze[id] ^ SET
        }

        //add entry point in [0,4]
        g.maze[getId(0,0)] = g.maze[getId(0,0)] ^ WEST;
        //add exit point in [4,endY]
        g.maze[getId(4,endY)] = g.maze[getId(4,endY)] ^ EAST;

        /*debug
        g.maze = [3,13,7,5,1,5,9,10,3,5,5,12,11,10,6,12,3,5,5,4,12,3,9,10,3,9,7,9,14,6,4,12,6,5,12];*/
        
        //that's the door x,y in the original
        endX = 4;
        solved = false;

        visited = [];
        for (var id = 0; id < mazeColumns * mazeRows; ++id) {
           visited[id] = false;
        }
        path = [];

        recursiveSolve(0,0);
        g.positions = [];
        g.cmds = pathtoCommands(path);
    } while (g.cmds.length > 25);
    //convert the 5x5 maze to a 5x7 one
    mazeRows = 5;
    mazeColumns = 7;
    maze5x7 = [];
    for (var x=0; x<mazeColumns; x++){
        for (var y=0; y<mazeRows; y++){
            if (x == 0){
                maze5x7[getId(x,y)] = 15;
            }
            else{
                if (x==6){
                    maze5x7[getId(x,y)] = 15;    
                }
                else{
                    maze5x7[getId(x,y)] = g.maze[y*5+x-1];
                }
            }
        }
    }
    //entry point
    maze5x7[getId(0,0)] = maze5x7[getId(0,0)]^EAST;
    //exit point
    maze5x7[getId(6,endY)] = maze5x7[getId(6,endY)]^WEST;
    g.maze = maze5x7.slice();
    drawMazeonCanvas();
}



function addToPath(cx,cy){
    path.unshift({x:cx,y:cy});
}
function recursiveSolve(x, y) {
    if ((x == endX) && (y == endY)){
        addToPath(x,y);
        return(true); // If you reached the end
    } 
    if (visited[getId(x,y)]){
        return(false);
    }
    visited[getId(x,y)] = true;
    if ((x != 0) && ((g.maze[getId(x,y)] & WEST) == 0)){ // Checks if i can go left
        if (recursiveSolve(x-1, y)) { // Recalls method one to the left
            addToPath(x,y);
            return(true);
        }
    }
    if ((x != mazeColumns - 1) && ((g.maze[getId(x,y)] & EAST) == 0)){ // Checks if i can go right
        if (recursiveSolve(x+1, y)) { // Recalls method one to the right
            addToPath(x,y);
            return(true);
        }
    }
    if ((y != 0) && ((g.maze[getId(x,y)] & NORTH) ==0)) { // Checks if i can go up
        if (recursiveSolve(x, y-1)) { // Recalls method one up
            addToPath(x,y);
            return(true);
        }
    }
    if ((y != mazeRows - 1) && ((g.maze[getId(x,y)] & SOUTH)==0)){ // Checks if i can go down
        if (recursiveSolve(x, y+1)) { // Recalls method one down
            addToPath(x,y);
            return(true);
        }
    }
    return false;
}

function pathtoCommands(p){
    cmds = [];
    //assume starting from (0,0) and looking up
    direction = RT;
    i=0;
    while (i<p.length-1){
        var diff = [p[i+1].x - p[i].x, p[i+1].y - p[i].y];
        if ((diff[0] == 1) && (diff[1] == 0)){
            switch (direction){
                case FD: cmds.push('RT'); direction = RT; break;
                case RT: cmds.push('FD'); i++; break;
                case LT: cmds.push('RT'); direction = FD; break;
                case BK: cmds.push('LT'); direction = RT; break;
            }
        }
        if ((diff[0] == -1) && (diff[1] == 0)){
            switch (direction){
                case FD: cmds.push('LT'); direction = LT; break;
                case RT: cmds.push('LT'); direction = BK; break;
                case LT: cmds.push('FD'); i++; break;
                case BK: cmds.push('RT'); direction = LT; break;
            }
        }
        if ((diff[0] == 0) && (diff[1] == 1)){
            switch (direction){
                case FD: cmds.push('FD'); i++; break;
                case RT: cmds.push('LT'); direction = FD; break;
                case LT: cmds.push('RT'); direction = FD; break;
                case BK: cmds.push('RT'); direction = LT; break;
            }

        }
        if ((diff[0] == 0) && (diff[1] == -1)){
            switch (direction){
                case FD: cmds.push('RT'); direction = RT; break;
                case RT: cmds.push('RT'); direction = BK; break;
                case LT: cmds.push('LT'); direction = BK; break;
                case BK: cmds.push('FD'); i++; break;
            }

        }
        g.positions.push({x:p[i].x,y:p[i].y});
    }
    return(cmds);
}
