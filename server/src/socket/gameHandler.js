// In-memory room storage
const rooms = {};
const gameLoops = {};

const GRID_SIZE = 25;
const TICK_RATE = 120; // ms

// Initial game state generator
const generateInitialGameState = () => ({
  status: 'waiting', // 'waiting', 'playing', 'game_over'
  snakes: {}, // { playerIndex: { body: [{x, y}], direction: {x, y}, alive: true } }
  food: generateFood([]),
  scores: {}, // { playerIndex: 0 }
  highScore: 0,
});

const generateFood = (snakes) => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    // Check if food is on any snake
    let onSnake = false;
    for (const playerIdx in snakes) {
      if (snakes[playerIdx].body.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        onSnake = true;
        break;
      }
    }
    if (!onSnake) break;
  }
  return newFood;
};

const startGameLoop = (io, roomId) => {
  if (gameLoops[roomId]) return;

  const room = rooms[roomId];
  if (!room) return;

  room.gameState.status = 'playing';

  gameLoops[roomId] = setInterval(() => {
    const state = room.gameState;
    if (state.status !== 'playing') {
      clearInterval(gameLoops[roomId]);
      delete gameLoops[roomId];
      return;
    }

    let allDead = true;

    // Move snakes
    for (const playerIdx in state.snakes) {
      const snake = state.snakes[playerIdx];
      if (!snake.alive) continue;
      allDead = false;

      const head = { ...snake.body[0] };
      head.x += snake.direction.x;
      head.y += snake.direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        snake.alive = false;
        continue;
      }

      // Check self or other snake collision
      let hitSnake = false;
      for (const otherIdx in state.snakes) {
        const otherSnake = state.snakes[otherIdx];
        if (otherSnake.body.some(segment => segment.x === head.x && segment.y === head.y)) {
          hitSnake = true;
          break;
        }
      }

      if (hitSnake) {
        snake.alive = false;
        continue;
      }

      // Move forward
      snake.body.unshift(head);

      // Check food
      if (head.x === state.food.x && head.y === state.food.y) {
        state.scores[playerIdx] += 10;
        if (state.scores[playerIdx] > state.highScore) {
          state.highScore = state.scores[playerIdx];
        }
        state.food = generateFood(state.snakes);
      } else {
        snake.body.pop();
      }
    }

    // Check if everyone is dead
    if (allDead) {
      state.status = 'game_over';
      clearInterval(gameLoops[roomId]);
      delete gameLoops[roomId];
    }

    io.to(roomId).emit('game_tick', state);

  }, TICK_RATE);
};


const handleGameSockets = (io, socket) => {

  socket.on('join_room', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: generateInitialGameState()
      };
    }

    const room = rooms[roomId];

    // Assign player
    const playerIndex = room.players.length;

    if (playerIndex < 4) {
      room.players.push({
        id: socket.id,
        index: playerIndex
      });

      // Initialize snake at starting positions
      const startPositions = [
        { x: 5, y: 5 }, { x: GRID_SIZE - 5, y: GRID_SIZE - 5 },
        { x: GRID_SIZE - 5, y: 5 }, { x: 5, y: GRID_SIZE - 5 }
      ];
      
      const startDirs = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 }
      ];

      room.gameState.snakes[playerIndex] = {
        body: [{ ...startPositions[playerIndex] }],
        direction: { ...startDirs[playerIndex] },
        alive: true
      };
      
      room.gameState.scores[playerIndex] = 0;

      console.log(`Player ${playerIndex} joined room ${roomId}`);
    }

    io.to(roomId).emit('room_update', room);
  });

  socket.on('start_game', ({ roomId }) => {
    startGameLoop(io, roomId);
    io.to(roomId).emit('room_update', rooms[roomId]);
  });

  socket.on('restart_game', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (gameLoops[roomId]) {
      clearInterval(gameLoops[roomId]);
      delete gameLoops[roomId];
    }

    const newGameState = generateInitialGameState();
    newGameState.highScore = room.gameState.highScore;

    const startPositions = [
      { x: 5, y: 5 }, { x: GRID_SIZE - 5, y: GRID_SIZE - 5 },
      { x: GRID_SIZE - 5, y: 5 }, { x: 5, y: GRID_SIZE - 5 }
    ];
    
    const startDirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    room.players.forEach((p) => {
      newGameState.snakes[p.index] = {
        body: [{ ...startPositions[p.index] }],
        direction: { ...startDirs[p.index] },
        alive: true
      };
      newGameState.scores[p.index] = 0;
    });

    room.gameState = newGameState;
    
    startGameLoop(io, roomId);
    io.to(roomId).emit('room_update', room);
  });

  socket.on('change_direction', ({ roomId, playerIndex, direction }) => {
    const room = rooms[roomId];
    if (!room || room.gameState.status !== 'playing') return;

    const snake = room.gameState.snakes[playerIndex];
    if (!snake || !snake.alive) return;

    // Prevent 180 degree turns
    if (snake.body.length > 1) {
      const neck = snake.body[1];
      const head = snake.body[0];
      if (head.x + direction.x === neck.x && head.y + direction.y === neck.y) {
        return;
      }
    }

    snake.direction = direction;
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        const pIndex = room.players[playerIndex].index;
        if (room.gameState.snakes[pIndex]) {
          room.gameState.snakes[pIndex].alive = false;
        }
        
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          if (gameLoops[roomId]) {
            clearInterval(gameLoops[roomId]);
            delete gameLoops[roomId];
          }
          delete rooms[roomId];
          console.log(`🧹 Room deleted: ${roomId}`);
        } else {
          io.to(roomId).emit('room_update', room);
        }
      }
    }
  });
};

module.exports = handleGameSockets;