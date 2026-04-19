import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const createRoom = () => {
    // Generate a random 6-character string
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoom}`);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim().length > 0) {
      navigate(`/room/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <div className={`glass-panel ${styles.menuCard}`}>
        <h1 className="text-gradient">LUDO PRO</h1>
        <p className={styles.subtitle}>Premium Multiplayer Experience</p>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={createRoom}>
            Create New Game
          </button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <form onSubmit={joinRoom} className={styles.joinForm}>
            <input 
              type="text" 
              placeholder="Enter Room Code" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className={styles.inputField}
            />
            <button type="submit" className={styles.secondaryBtn} disabled={!roomCode.trim()}>
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
