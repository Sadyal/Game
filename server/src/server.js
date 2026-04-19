require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Import game socket handler
const handleGameSockets = require('./socket/gameHandler');

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  handleGameSockets(io, socket);
});

// Sample API route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Ludo server is running!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
