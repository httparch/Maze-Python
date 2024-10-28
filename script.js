function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function displayVictoryMess(moves) {
    console.log('Displaying victory message with moves:', moves);
    
    // Play win sound
    const winSound = document.getElementById('winSound');
    winSound.currentTime = 0;
    winSound.play().catch(error => {
        console.log("Error playing win sound:", error);
    });

    // Get difficulty and score
    const difficulty = document.getElementById("diffSelect").value;
    const score = calculateScore(difficulty);
    
    // Update victory message
    document.getElementById("message").innerHTML = `
        <h1>Congratulations!</h1>
        <p>You've completed the maze!</p>
        <p>Steps taken: ${moves}</p>
        <p>Difficulty: ${getDifficultyName(difficulty)}</p>
        <p>Score: ${score}</p>
        <div class="victory-buttons">
            <button onclick="makeMaze()" class="play-again-btn">Play Again</button>
            <button onclick="toggleVisibility('Message-Container')" class="close-btn">Close</button>
        </div>
    `;
    
    // Show message container
    document.getElementById("Message-Container").style.visibility = "visible";
}

function toggleVisibility(id) {
    var element = document.getElementById(id);
    element.style.visibility = (element.style.visibility === "visible") ? "hidden" : "visible";
}

function Maze(Width, Height) {
    var width = Width;
    var height = Height;
    var mazeMap;
    var startCoord, endCoord;
    var dirs = ["n", "s", "e", "w"];
    var modDir = {
        n: {y: -1, x: 0, o: "s"},
        s: {y: 1, x: 0, o: "n"},
        e: {y: 0, x: 1, o: "w"},
        w: {y: 0, x: -1, o: "e"}
    };

    this.map = function() {
        return mazeMap;
    };
    this.startCoord = function() {
        return startCoord;
    };
    this.endCoord = function() {
        return endCoord;
    };

    function genMap() {
        mazeMap = new Array(height);
        for (let y = 0; y < height; y++) {
            mazeMap[y] = new Array(width);
            for (let x = 0; x < width; x++) {
                mazeMap[y][x] = {
                    n: false, 
                    s: false, 
                    e: false, 
                    w: false,
                    visited: false
                };
            }
        }
    }

    function defineMaze() {
        let stack = [];
        let current = {x: 0, y: 0};
        mazeMap[current.y][current.x].visited = true;

        function getUnvisitedNeighbors(cell) {
            let neighbors = [];
            for (let dir of dirs) {
                let newX = cell.x + modDir[dir].x;
                let newY = cell.y + modDir[dir].y;
                if (newX >= 0 && newX < width && newY >= 0 && newY < height && !mazeMap[newY][newX].visited) {
                    neighbors.push({x: newX, y: newY, dir: dir});
                }
            }
            return neighbors;
        }

        while (true) {
            let neighbors = getUnvisitedNeighbors(current);
            if (neighbors.length > 0) {
                stack.push(current);
                let chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
                mazeMap[current.y][current.x][chosen.dir] = true;
                mazeMap[chosen.y][chosen.x][modDir[chosen.dir].o] = true;
                current = {x: chosen.x, y: chosen.y};
                mazeMap[current.y][current.x].visited = true;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                break;
            }
        }
    }

    function defineStartEnd() {
        startCoord = {x: 0, y: 0};
        endCoord = {x: width - 1, y: height - 1};
    }

    this.logMaze = function() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                console.log(`Cell (${x},${y}):`, mazeMap[y][x]);
            }
        }
    }

    genMap();
    defineMaze();
    defineStartEnd();
    this.logMaze();
}

function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
    var map = Maze.map();
    var cellSize = cellsize;
    var drawEndMethod;

    this.redrawMaze = function(size) {
        cellSize = size;
        ctx.lineWidth = cellSize / 50;
        drawMap();
        drawEndMethod();
    };

    function drawCell(x, y, cell) {
        var cellX = x * cellSize;
        var cellY = y * cellSize;

        // Update wall color to dark green
        ctx.strokeStyle = "#1b5e20"; // Dark green
        ctx.lineWidth = cellSize / 20; // Make walls thicker

        if (!cell.n) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY);
            ctx.lineTo(cellX + cellSize, cellY);
            ctx.stroke();
        }
        if (!cell.s) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY + cellSize);
            ctx.lineTo(cellX + cellSize, cellY + cellSize);
            ctx.stroke();
        }
        if (!cell.e) {
            ctx.beginPath();
            ctx.moveTo(cellX + cellSize, cellY);
            ctx.lineTo(cellX + cellSize, cellY + cellSize);
            ctx.stroke();
        }
        if (!cell.w) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY);
            ctx.lineTo(cellX, cellY + cellSize);
            ctx.stroke();
        }

        // Add a subtle shadow effect to the walls
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }

    function drawMap() {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                drawCell(x, y, map[y][x]);
            }
        }
    }

    function drawEndFlag() {
        var coord = Maze.endCoord();
        var gridSize = 4;
        var fraction = cellSize / gridSize - 2;
        var colorSwap = true;
        for (let y = 0; y < gridSize; y++) {
            if (gridSize % 2 === 0) {
                colorSwap = !colorSwap;
            }
            for (let x = 0; x < gridSize; x++) {
                ctx.beginPath();
                ctx.rect(
                    coord.x * cellSize + x * fraction + 4.5,
                    coord.y * cellSize + y * fraction + 4.5,
                    fraction,
                    fraction
                );
                if (colorSwap) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                }
                ctx.fill();
                colorSwap = !colorSwap;
            }
        }
    }

    function drawEndSprite() {
        var offsetLeft = cellSize / 50;
        var offsetRight = cellSize / 25;
        var coord = Maze.endCoord();
        ctx.drawImage(
            finishSprite, // Use finishSprite here instead of sprite
            0,
            0,
            finishSprite.width,
            finishSprite.height,
            coord.x * cellSize + offsetLeft,
            coord.y * cellSize + offsetLeft,
            cellSize - offsetRight,
            cellSize - offsetRight
        );
    }

    function clear() {
        var canvasSize = cellSize * map.length;
        ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    if (endSprite !== null) {
        drawEndMethod = drawEndSprite;
    } else {
        drawEndMethod = drawEndFlag;
    }
    clear();
    drawMap();
    drawEndMethod();
}

function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d");
  var drawSprite;
  var moves = 0;
  drawSprite = sprite ? drawSpriteImg : drawSpriteCircle;
  var player = this;
  var map = maze.map();
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;

  this.cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };

  this.moves = 0; // Initialize moves counter
  this.onComplete = onComplete; // Store the victory callback

  this.redrawPlayer = function (_cellsize) {
    cellSize = _cellsize;
    drawSprite(this.cellCoords);
  };

  function drawSpriteCircle(coord) {
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  function drawSpriteImg(coord) {
    if (sprite && sprite.complete) {
      ctx.drawImage(
        sprite,
        0,
        0,
        sprite.width,
        sprite.height,
        coord.x * cellSize,
        coord.y * cellSize,
        cellSize,
        cellSize
      );
    } else {
      console.log('Sprite not loaded, drawing circle instead');
      drawSpriteCircle(coord);
    }
  }

  // Draw the sprite immediately upon creation
  drawSprite(this.cellCoords);

  this.draw = function(ctx) {
    drawSprite(this.cellCoords);
  };

  this.moveInDirection = function(direction) {
    console.log(`Player attempting to move ${direction}`);
    let newX = this.cellCoords.x;
    let newY = this.cellCoords.y;
    let currentCell = map[this.cellCoords.y][this.cellCoords.x];
    const hopSound = document.getElementById('hopSound');

    console.log(`Current cell (${this.cellCoords.x},${this.cellCoords.y}):`, currentCell);

    let canMove = false;
    switch (direction) {
        case 'up':
            canMove = currentCell.n;
            if (canMove) newY--;
            break;
        case 'down':
            canMove = currentCell.s;
            if (canMove) newY++;
            break;
        case 'left':
            canMove = currentCell.w;
            if (canMove) newX--;
            break;
        case 'right':
            canMove = currentCell.e;
            if (canMove) newX++;
            break;
    }

    console.log(`Can move ${direction}: ${canMove}`);
    console.log(`Attempted new position: (${newX}, ${newY})`);

    if (canMove && newX >= 0 && newY >= 0 && newX < map[0].length && newY < map.length) {
        // Play hop sound when movement is successful
        hopSound.currentTime = 0;
        hopSound.play().catch(error => {
            console.log("Error playing hop sound:", error);
        });
        
        this.cellCoords = { x: newX, y: newY };
        this.moves = (this.moves || 0) + 1; // Ensure moves is initialized
        console.log('Current moves:', this.moves);
        
        // Update score display with fixed score
        const difficulty = document.getElementById("diffSelect").value;
        const score = calculateScore(difficulty);
        updateScoreDisplay(score);
        
        // Check if player reached the end
        if (this.cellCoords.x === maze.endCoord().x && this.cellCoords.y === maze.endCoord().y) {
            console.log('Maze completed!');
            this.onComplete(this.moves);
        }
        
        return true;
    } else {
        console.log(`Cannot move ${direction} (wall or out of bounds)`);
        return false;
    }
  };

  this.unbindKeyDown = function() {
    window.removeEventListener("keydown", check, false);
  };

  this.bindKeyDown = function() {
    window.addEventListener("keydown", check, false);
  };

  function check(e) {
    var code = e.keyCode;
    if (code > 36 && code < 41) {
      switch (code) {
        case 37:
          player.moveInDirection('left');
          break;
        case 38:
          player.moveInDirection('up');
          break;
        case 39:
          player.moveInDirection('right');
          break;
        case 40:
          player.moveInDirection('down');
          break;
      }
    }
  }

  this.bindKeyDown();
}

var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite;
var finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;

// Add these variables at the top with your other global variables
let currentScore = 0;
const DIFFICULTY_SCORES = {
    '10': 100,  // Easy: 100 points
    '15': 250,  // Medium: 250 points
    '25': 500,  // Hard: 500 points
    '38': 1000  // Extreme: 1000 points
};

// Simplified score calculation
function calculateScore(difficulty) {
    return DIFFICULTY_SCORES[difficulty];
}

// Update the score display function with verification
function updateScoreDisplay(score) {
    /*console.log('Updating score display with:', score);
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score}`;
    } else {
        console.error('Score display element not found');
    }*/
}

// Helper function to get difficulty name
function getDifficultyName(difficulty) {
    switch(difficulty) {
        case '10': return 'Easy';
        case '15': return 'Medium';
        case '25': return 'Hard';
        case '38': return 'Extreme';
        default: return 'Unknown';
    }
}

window.onload = function () {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
  }

  // Load sprites
  sprite = new Image();
  sprite.src = "./key.png";
  sprite.onload = function() {
      console.log('Sprite (key.png) loaded successfully');
      finishSprite = new Image();
      finishSprite.src = "./home.png";
      finishSprite.onload = function() {
          console.log('Finish sprite (home.png) loaded successfully');
          // Create maze after sprites are loaded
          makeMaze();
      }
  }

  // Setup terminal after maze is created
  setupTerminal();

  // Add the event listener to the textarea element
  document.getElementById('terminal').addEventListener('click', function () {
      console.log('Textarea clicked!');
      this.focus();
  });

  document.getElementById("startMazeBtn").addEventListener("click", makeMaze);

  //Load and edit sprites
  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
      if (completeOne === true && completeTwo === true) {
          makeMaze();
      }
  };

  sprite = new Image();
  sprite.src = "./key.png";
  sprite.onload = function () {
      console.log('Sprite (key.png) loaded successfully');
      console.log('Image dimensions:', this.width, 'x', this.height);
      completeOne = true;
      isComplete();
  };
  sprite.onerror = function (e) {
      console.error('Failed to load sprite image (key.png)');
      console.error('Error details:', e);
  };

  finishSprite = new Image();
  finishSprite.src = "./home.png";
  finishSprite.onload = function () {
      console.log('Finish sprite (home.png) loaded successfully');
      console.log('Image dimensions:', this.width, 'x', this.height);
      completeTwo = true;
      isComplete();
  };
  finishSprite.onerror = function (e) {
      console.error('Failed to load finish sprite (home.png)');
      console.error('Error details:', e);
  };

  // Add these lines at the end of the window.onload function
  setupTerminal();
  setupEnterButton();
}

window.onresize = function () {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
  }
  cellSize = mazeCanvas.width / maze.map().length;
  if (player != null) {
      draw.redrawMaze(cellSize);
      player.redrawPlayer(cellSize);
  }
}

function makeMaze() {
    // Reset score at the start of new maze
    updateScoreDisplay(0);
    
    if (player) {
        player.unbindKeyDown();
        player = null;
    }

    var e = document.getElementById("diffSelect");
    difficulty = e.options[e.selectedIndex].value;
    cellSize = mazeCanvas.width / difficulty;
    maze = new Maze(difficulty, difficulty);
    draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
    player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
    player.moves = 0; // Explicitly initialize moves

    // Remove or modify this condition
    if (document.getElementById("mazeContainer").style.opacity < "100") {
        document.getElementById("mazeContainer").style.opacity = "100";
    }

    // Ensure the maze and player are drawn
    draw.redrawMaze(cellSize);
    player.redrawPlayer(cellSize);

    console.log('Maze created and buttons set up');

    // Start music if it's not already playing
    if (!isMusicPlaying) {
        toggleMusic();
    }
}

// Add these new functions
function setupTerminal() {
    const terminal = document.getElementById('terminal');
    const output = document.getElementById('output');
    const enterButton = document.getElementById('enterButton');

    if (!terminal || !output) {
        console.error('Terminal or output elements not found');
        return;
    }

    enterButton.addEventListener('click', function() {
        const commands = getTerminalCommands(terminal);
        appendToOutput(output, '<strong>Executing commands:</strong>');
        executeCommands(commands, output);
        terminal.value = ''; // Clear the terminal after executing commands
    });
}

function getTerminalCommands(terminal) {
    return terminal.value.split('\n').filter(cmd => cmd.trim() !== '');
}

function executeCommands(commands, output) {
    let i = 0;
    while (i < commands.length) {
        let command = commands[i].trim().toLowerCase();
        if (command.startsWith('for')) {
            let [_, count, ...loopCommands] = command.split(' ');
            count = parseInt(count);
            let endIndex = commands.indexOf('end', i);
            if (endIndex === -1) {
                appendToOutput(output, "Error: 'for' loop without 'end'");
                break;
            }
            for (let j = 0; j < count; j++) {
                executeCommands(commands.slice(i + 1, endIndex), output);
            }
            i = endIndex + 1;
        } else if (command === 'end') {
            appendToOutput(output, "Error: 'end' without matching loop");
            i++;
        } else {
            executeSingleCommand(command, output);
            i++;
        }
    }
    updateMaze();
}

function executeSingleCommand(command, output) {
    appendToOutput(output, `> ${command}`);
    const [direction, steps] = command.split(' ');
    const numSteps = parseInt(steps) || 1;

    if (['up', 'down', 'left', 'right'].includes(direction)) {
        for (let i = 0; i < numSteps; i++) {
            console.log(`Attempting step ${i + 1} of ${numSteps}`);
            if (player.moveInDirection(direction)) {
                appendToOutput(output, `Moved ${direction} 1 step`);
            } else {
                appendToOutput(output, `Cannot move ${direction} (wall or out of bounds)`);
                console.log(`Movement failed at step ${i + 1}`);
                break;
            }
        }
    } else {
        appendToOutput(output, `Invalid command: ${command}`);
    }
}

function appendToOutput(output, text) {
    output.innerHTML += text + '<br>';
    output.scrollTop = output.scrollHeight;
}

function setupEnterButton() {
    const enterButton = document.getElementById('enterButton');
    const terminal = document.getElementById('terminal');
    const output = document.getElementById('output');

    enterButton.addEventListener('click', (e) => {
        e.preventDefault();
        const commands = getTerminalCommands(terminal);
        appendToOutput(output, '<strong>Executing commands:</strong>');
        executeCommands(commands, output);
        terminal.value = ''; // Clear the terminal after executing commands
    });
}

function updateMaze() {
    console.log('Updating maze');
    if (ctx && draw && player) {
        ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
        draw.redrawMaze(cellSize);
        player.draw(ctx);
    } else {
        console.error('Unable to update maze: ctx, draw, or player is not initialized');
    }
}

// Make sure the Player class has the moveMultipleSteps method
Player.prototype.moveMultipleSteps = function(direction, steps) {
    for (let i = 0; i < steps; i++) {
        this.moveInDirection(direction);
    }
};

// Existing moveInDirection method (make sure this exists in your Player class)
Player.prototype.moveInDirection = function(direction) {
    console.log(`Player attempting to move ${direction}`);
    let newX = this.cellCoords.x;
    let newY = this.cellCoords.y;
    let currentCell = map[this.cellCoords.y][this.cellCoords.x];
    const hopSound = document.getElementById('hopSound');

    console.log(`Current cell (${this.cellCoords.x},${this.cellCoords.y}):`, currentCell);

    let canMove = false;
    switch (direction) {
        case 'up':
            canMove = currentCell.n;
            if (canMove) newY--;
            break;
        case 'down':
            canMove = currentCell.s;
            if (canMove) newY++;
            break;
        case 'left':
            canMove = currentCell.w;
            if (canMove) newX--;
            break;
        case 'right':
            canMove = currentCell.e;
            if (canMove) newX++;
            break;
    }

    console.log(`Can move ${direction}: ${canMove}`);
    console.log(`Attempted new position: (${newX}, ${newY})`);

    if (canMove && newX >= 0 && newY >= 0 && newX < map[0].length && newY < map.length) {
        // Play hop sound when movement is successful
        hopSound.currentTime = 0;
        hopSound.play().catch(error => {
            console.log("Error playing hop sound:", error);
        });
        
        this.cellCoords = { x: newX, y: newY };
        this.moves = (this.moves || 0) + 1; // Ensure moves is initialized
        console.log('Current moves:', this.moves);
        
        // Update score display with fixed score
        const difficulty = document.getElementById("diffSelect").value;
        const score = calculateScore(difficulty);
        updateScoreDisplay(score);
        
        return true;
    } else {
        console.log(`Cannot move ${direction} (wall or out of bounds)`);
        return false;
    }
};

Player.prototype.draw = function(ctx) {
    let x = this.cellCoords.x * cellSize;
    let y = this.cellCoords.y * cellSize;
    ctx.drawImage(
        this.sprite,
        0,
        0,
        this.sprite.width,
        this.sprite.height,
        x,
        y,
        cellSize,
        cellSize
    );
};

// Music control
let currentMusic = 1;
let isMusicPlaying = false;
const music1 = document.getElementById('bgMusic1'); // bg1.wav
const music2 = document.getElementById('bgMusic2'); // bg2.mp3
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

// Function to switch between songs
function switchMusic() {
    if (currentMusic === 1) {
        music1.pause();
        music1.currentTime = 0;
        music2.play().catch(error => {
            console.log("Error playing bg2.mp3:", error);
        });
        currentMusic = 2;
    } else {
        music2.pause();
        music2.currentTime = 0;
        music1.play().catch(error => {
            console.log("Error playing bg1.wav:", error);
        });
        currentMusic = 1;
    }
}

// Function to toggle music on/off
function toggleMusic() {
    if (isMusicPlaying) {
        music1.pause();
        music2.pause();
        musicIcon.textContent = '🔈';
    } else {
        if (currentMusic === 1) {
            music1.play().catch(error => {
                console.log("Error playing bg1.wav:", error);
            });
        } else {
            music2.play().catch(error => {
                console.log("Error playing bg2.mp3:", error);
            });
        }
        musicIcon.textContent = '🔊';
    }
    isMusicPlaying = !isMusicPlaying;
}

// Add event listeners
musicToggle.addEventListener('click', toggleMusic);

// Switch music when one song ends
music1.addEventListener('ended', switchMusic);
music2.addEventListener('ended', switchMusic);

// Update your output handling function
function displayOutput(text) {
    const outputContent = document.getElementById('outputContent');
    const newOutput = document.createElement('div');
    newOutput.textContent = text;
    outputContent.appendChild(newOutput);
    outputContent.scrollTop = outputContent.scrollHeight; // Auto-scroll to bottom
}

// Example usage in your command processing function
function processCommand(command) {
    // ... your existing command processing logic ...
    displayOutput(`> ${command}`); // Display the command
    // Display the result
    displayOutput(result);
}

