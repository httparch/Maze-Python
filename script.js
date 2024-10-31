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
    const score = calculateScore(difficulty, moves);
    
    // Update victory message
    // ARCHER ANDITO YUNG POP UP MESSAGE SA VICTORY

    window.parent.postMessage({
        type: "maze-points",
        maze_data:{
            points: score,
        }
    } , "*")

    document.getElementById("message").innerHTML = `
        <h1>Congratulations!</h1>
        <p>You've completed the maze!</p>
        <p>Steps taken: ${moves}</p>
        <p>Difficulty: ${getDifficultyName(difficulty)}</p>
        <p>Score: ${score}</p>
        <div class="victory-buttons">
            <button onclick="makeMaze()" class="play-again-btn">Play Again</button> /*ARCHER ITO YUNG PLAY AGAIN BUTTON*/
            <button onclick="toggleVisibility('Message-Container')" class="close-btn">Close</button> /*ARCHER ITO YUNG CLOSE BUTTON*/
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
    this.hearts = 3; // Initialize hearts
    this.heartLostThisRun = false; // Flag to track if a heart has been lost this run

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

    this.draw = function() {
        // Clear the previous position
        ctx.clearRect(0, 0, c.width, c.height);
        draw.redrawMaze(cellSize); // Redraw the maze to ensure walls are visible
        drawSprite(this.cellCoords); // Draw the player at the current position
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

            // Redraw player only after a successful move
            this.draw();

            // Check if player has reached the end
            if (newX === maze.endCoord().x && newY === maze.endCoord().y) {
                onComplete(this.moves); // Call the onComplete function with the number of moves
            }

            return true;
        } else {
            console.log(`Cannot move ${direction} (wall or out of bounds)`);
            if (!this.heartLostThisRun) { // Check if a heart has already been lost this run
                this.hearts--; // Lose a heart
                updateHeartsDisplay(this.hearts); // Update the heart display
                this.heartLostThisRun = true; // Set the flag to true
                if (this.hearts > 0) {
                    showModal('wallModal'); // Show the wall bump modal
                } else {
                    showModal('resetModal'); // Show the reset modal
                    this.resetPosition(); // Reset position if no hearts left
                }
                console.log(`Hearts remaining: ${this.hearts}`);
            }
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
        // Prevent any movement by not executing any movement logic
        console.log("Key pressed, but movement is disabled.");
    }

    this.bindKeyDown();

    this.resetPosition = function() {
        console.log('Resetting player position to start');
        this.cellCoords = {
            x: maze.startCoord().x,
            y: maze.startCoord().y
        };
        this.hearts = 3; // Reset hearts to 3
        updateHeartsDisplay(this.hearts); // Update the heart display
        console.log('Player position reset and hearts restored');
        this.draw(); // Redraw player at the start position
    };
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
    '10': 5,   // Easy: 5 points
    '15': 10,  // Medium: 10 points
    '25': 15,  // Hard: 15 points
    '38': 20   // Extreme: 20 points
};

// Simplified score calculation
function calculateScore(difficulty, moves) {
    let baseScore = DIFFICULTY_SCORES[difficulty];
    let bonus = 0;
 
    switch(difficulty) {
        case '10': // Easy
            if (moves < 50) bonus = 5;
            else if (moves < 60) bonus = 4;
            else if (moves < 70) bonus = 3;
            else if (moves < 80) bonus = 2;
            else if (moves < 90) bonus = 1;
            break;
        case '15': // Medium
            if (moves < 100) bonus = 5;
            else if (moves < 120) bonus = 4;
            else if (moves < 140) bonus = 3;
            else if (moves < 160) bonus = 2;
            else if (moves < 180) bonus = 1;
            break;
        case '25': // Hard
            if (moves < 150) bonus = 5;
            else if (moves < 180) bonus = 4;
            else if (moves < 210) bonus = 3;
            else if (moves < 240) bonus = 2;
            else if (moves < 270) bonus = 1;
            break;
        case '38': // Extreme
            if (moves < 200) bonus = 5;
            else if (moves < 240) bonus = 4;
            else if (moves < 280) bonus = 3;
            else if (moves < 320) bonus = 2;
            else if (moves < 360) bonus = 1;
            break;
    }
 
    return baseScore + bonus;
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
    player.heartLostThisRun = false; // Reset the flag at the start of command execution
    let i = 0;
    while (i < commands.length) {
        let command = commands[i].trim().toLowerCase();
        
        // Check for the new loop syntax
        if (command.startsWith('for') && command.includes('in range')) {
            const match = command.match(/for\s+\w+\s+in\s+range\((\d+)\):/);
            if (match) {
                const count = parseInt(match[1]);
                let endIndex = commands.indexOf('end', i);
                if (endIndex === -1) {
                    appendToOutput(output, "Error: 'for' loop without 'end'");
                    showModal('errorModal'); // Show modal for missing 'end'
                    break;
                }
                
                // Collect commands within the loop
                const loopCommands = [];
                for (let j = i + 1; j < endIndex; j++) {
                    const loopCommand = commands[j].trim().toLowerCase();
                    const actionMatch = loopCommand.match(/(\w+_\w+)\(\)/);
                    if (actionMatch) {
                        loopCommands.push(actionMatch[1]);
                    }
                }
 
                // Check for duplicate commands
                const uniqueCommands = new Set(loopCommands);
                if (uniqueCommands.size !== loopCommands.length) {
                    appendToOutput(output, "Error: Duplicate commands found in loop");
                    showModal('errorModal'); // Show modal for duplicate commands
                    break;
                }
 
                // Execute each unique command the specified number of times
                for (let j = 0; j < count; j++) {
                    uniqueCommands.forEach(action => {
                        executeSingleCommand(`${action}()`, output, true);
                    });
                }
                i = endIndex + 1;
            } else {
                appendToOutput(output, "Error: Invalid 'for' loop syntax");
                showModal('errorModal'); // Show modal for invalid syntax
                i++;
            }
        } else if (command === 'end') {
            appendToOutput(output, "Error: 'end' without matching loop");
            showModal('errorModal'); // Show modal for unmatched 'end'
            i++;
        } else {
            appendToOutput(output, "Error: Command outside of loop");
            showModal('errorModal'); // Show modal for command outside loop
            i++;
        }
    }
    updateMaze();
}

function executeSingleCommand(command, output, allowMovement) {
    appendToOutput(output, `> ${command}`);
    
    // Extract the action from the command
    const actionMatch = command.match(/(\w+_\w+)\(\)/);
    if (actionMatch) {
        const action = actionMatch[1];
        if (allowMovement) {
            let moveSuccessful = false;
            switch (action) {
                case 'move_up':
                    moveSuccessful = player.moveInDirection('up');
                    break;
                case 'move_down':
                    moveSuccessful = player.moveInDirection('down');
                    break;
                case 'move_left':
                    moveSuccessful = player.moveInDirection('left');
                    break;
                case 'move_right':
                    moveSuccessful = player.moveInDirection('right');
                    break;
                default:
                    appendToOutput(output, `Invalid command: ${command}`);
            }
            if (moveSuccessful) {
                appendToOutput(output, `Moved ${action.replace('move_', '')}`);
            } else {
                appendToOutput(output, `Cannot move ${action.replace('move_', '')} (wall or out of bounds)`);
            }
        } else {
            appendToOutput(output, `Movement commands are only allowed within a 'for' loop`);
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
        
        return true;
    } else {
        console.log(`Cannot move ${direction} (wall or out of bounds)`);
        this.hearts--; // Lose a heart
        updateHeartsDisplay(this.hearts); // Update the heart display
        if (this.hearts > 0) {
            showModal('wallModal'); // Show the wall bump modal
        } else {
            showModal('resetModal'); // Show the reset modal
            this.resetPosition(); // Reset position if no hearts left
        }
        console.log(`Hearts remaining: ${this.hearts}`);
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

function updateHeartsDisplay(hearts) {
    const heartsDisplay = document.getElementById('heartsDisplay');
    heartsDisplay.textContent = `Hearts: ${'❤️'.repeat(hearts)}`;
}

// Call this function whenever hearts change
Player.prototype.moveInDirection = function(direction) {
    // ... existing code ...
    if (!canMove) {
        this.hearts--;
        updateHeartsDisplay(this.hearts);
        // ... rest of the code ...
    }
};

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

document.getElementById('infoToggle').addEventListener('click', function() {
    showModal('infoModal');
});

