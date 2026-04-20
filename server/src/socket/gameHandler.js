// In-memory room storage (for demo)
// Production → use Redis / DB
const rooms = {};

const handleGameSockets = (io, socket) => {

  // 🟢 JOIN ROOM
  socket.on('join_room', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: {
          turn: 0,
          diceValue: 1,
          tokens: {}
        }
      };
    }

    const room = rooms[roomId];

    // Assign player (max 4)
    const playerIndex = room.players.length;

    if (playerIndex < 4) {
      room.players.push({
        id: socket.id,
        index: playerIndex
      });

      // Initialize tokens
      room.gameState.tokens[playerIndex] = [0, 0, 0, 0];

      console.log(`Player ${playerIndex} joined room ${roomId}`);
    }

    io.to(roomId).emit('room_update', room);
  });


  // 🎲 ROLL DICE
  socket.on('roll_dice', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const roll = Math.floor(Math.random() * 6) + 1;

    room.gameState.diceValue = roll;

    console.log(`🎲 Dice rolled: ${roll} in room ${roomId}`);

    io.to(roomId).emit('dice_rolled', {
      roll,
      gameState: room.gameState
    });
  });


  // 🚶 MOVE TOKEN
  socket.on('move_token', ({ roomId, playerIndex, tokenIndex }) => {
    const room = rooms[roomId];
    if (!room) return;

    const state = room.gameState;

    // Move token
    state.tokens[playerIndex][tokenIndex] += state.diceValue;

    // Next turn
    state.turn = (state.turn + 1) % room.players.length;

    console.log(`➡️ Player ${playerIndex} moved token ${tokenIndex}`);

    io.to(roomId).emit('state_update', state);
  });


  // ❌ DISCONNECT
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      room.players = room.players.filter(p => p.id !== socket.id);

      if (room.players.length === 0) {
        delete rooms[roomId];
        console.log(`🧹 Room deleted: ${roomId}`);
      } else {
        io.to(roomId).emit('room_update', room);
      }
    }
  });
};

module.exports = handleGameSockets;