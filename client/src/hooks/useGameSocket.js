import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // Define backend URL

export const useGameSocket = (roomId) => {
  const [gameState, setGameState] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayerIndex, setMyPlayerIndex] = useState(null);
  
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(URL);
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      if (roomId) {
        socketRef.current.emit('join_room', roomId);
      }
    });

    socketRef.current.on('room_update', (data) => {
      setRoomData(data);
      setGameState(data.gameState);
      // Determine my player index
      const me = data.players.find(p => p.id === socketRef.current.id);
      if (me) {
        setMyPlayerIndex(me.index);
      }
    });

    socketRef.current.on('game_tick', (data) => {
      setGameState(data);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const startGame = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('start_game', { roomId });
    }
  };

  const restartGame = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('restart_game', { roomId });
    }
  };

  const changeDirection = (direction) => {
    if (socketRef.current && isConnected && myPlayerIndex !== null) {
      socketRef.current.emit('change_direction', { 
        roomId, 
        playerIndex: myPlayerIndex, 
        direction 
      });
    }
  };

  return {
    isConnected,
    socket: socketRef.current,
    roomData,
    gameState,
    myPlayerIndex,
    startGame,
    restartGame,
    changeDirection
  };
};
