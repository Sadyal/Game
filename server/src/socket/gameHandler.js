// Manage Ludo rooms and game state in memory (for simplicity and speed)
// For a production app, use Redis or MongoDB for state persistence.
const rooms = {};

const handleGameSockets = (io, socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: {
          turn: 0, // Player Index
          diceValue: 1,
          tokens: {} // Map of player index to token positions
        }
      };
    }

    // Assign player colors: 0=Red, 1=Green, 2=Yellow, 3=Blue
    const playerIndex = rooms[roomId].players.length;
    if (playerIndex < 4) {
      rooms[roomId].players.push({ id: socket.id, index: playerIndex });
      
      // Initialize basic token data for this player
      rooms[roomId].gameState.tokens[playerIndex] = [0, 0, 0, 0]; // 4 tokens starting at position 0
    }

    io.to(roomId).emit('room_update', rooms[roomId]);
  });

  socket.on('roll_dice', ({ roomId }) => {
    if (rooms[roomId]) {
      // Logic: Roll dice 1-6
      const roll = Math.floor(Math.random() * 6) + 1;
      rooms[roomId].gameState.diceValue = roll;
      
      // Simple implementation: move first token for demonstration
      io.to(roomId).emit('dice_rolled', { roll, gameState: rooms[roomId].gameState });
    }
  });

  socket.on('move_token', ({ roomId, playerIndex, tokenIndex }) => {
    if (rooms[roomId]) {
      const state = rooms[roomId].gameState;
      // Demo logic: just advance token by dice value
      state.tokens[playerIndex][tokenIndex] += state.diceValue;
      
      // Cycle turn
      state.turn = (state.turn + 1) % rooms[roomId].players.length;

      io.to(roomId).emit('state_update', state);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up rooms if empty (simple logic)
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('room_update', rooms[roomId]);
      }
    }
  });
};

module.exports = handleGameSockets;
