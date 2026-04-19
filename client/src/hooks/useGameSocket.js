import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // Define backend URL

export const useGameSocket = (roomId) => {
  const [gameState, setGameState] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  
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
    });

    socketRef.current.on('state_update', (data) => {
      setGameState(data);
    });

    socketRef.current.on('dice_rolled', (data) => {
      setRollResult(data.roll);
      setGameState(data.gameState);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const rollDice = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('roll_dice', { roomId });
    }
  };

  const moveToken = (playerIndex, tokenIndex) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('move_token', { roomId, playerIndex, tokenIndex });
    }
  };

  return {
    isConnected,
    socket: socketRef.current,
    roomData,
    gameState,
    rollResult,
    rollDice,
    moveToken
  };
};
