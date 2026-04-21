import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game');
  };

  return (
    <div className={styles.homeContainer}>
      <div className={`glass-panel ${styles.menuCard}`}>
        <h1 className="text-gradient">SNAKE PRO</h1>
        <p className={styles.subtitle}>Premium Single-Player Experience</p>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={startGame}>
            Play Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
