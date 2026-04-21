import React, { useEffect, useCallback } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import Board from '../components/game/Board/Board';
import styles from './GameRoom.module.css';

const Game = () => {
  const { gameState, highScore, difficulty, setDifficulty, startGame, changeDirection } = useSnakeGame();

  const handleKeyDown = useCallback((e) => {
    // Prevent default scrolling for arrow keys
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        changeDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        changeDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        changeDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        changeDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [changeDirection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={styles.roomContainer}>
      <div className={styles.topBar}>
        <h2>SNAKE <span className="text-gradient">PRO</span></h2>
        <div className={styles.highScoreBadge}>
           High Score: {highScore}
        </div>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.boardSection}>
          <div className={styles.relativeWrapper}>
            <Board gameState={gameState} />
            
            {/* Waiting/Game Over Overlays */}
            {gameState.status === 'waiting' && (
              <div className={styles.overlay}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '20px' }}>READY?</h1>
                <button className={styles.primaryBtn} onClick={startGame}>
                  Start Game
                </button>
              </div>
            )}

            {gameState.status === 'game_over' && (
              <div className={styles.overlay}>
                <h2 className="text-gradient" style={{ fontSize: '3rem' }}>GAME OVER</h2>
                <div className={styles.finalScores}>
                  <div className={styles.finalScoreRow}>
                    <span>Final Score:</span>
                    <strong>{gameState.score}</strong>
                  </div>
                </div>
                <button className={styles.primaryBtn} onClick={startGame}>
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={`glass-panel ${styles.scoreboard}`}>
            <h3>Settings & Info</h3>
            
            <div className={styles.difficultySection}>
              <label htmlFor="difficulty">Difficulty:</label>
              <select 
                id="difficulty" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className={styles.difficultySelect}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className={styles.scoreList}>
               <div className={`${styles.scoreCard} ${styles.myScore}`}>
                 <div className={styles.scoreInfo}>
                    <span className={`${styles.playerIndicator} ${styles.color0}`}></span>
                    <span className={styles.playerName}>Score</span>
                 </div>
                 <span className={styles.scoreValue}>{gameState.score}</span>
               </div>
            </div>
            
            <div className={styles.controlsHelp}>
              <h4>Controls</h4>
              <div className={styles.keys}>
                <span className={styles.keyBadge}>W</span>
                <span className={styles.keyBadge}>A</span>
                <span className={styles.keyBadge}>S</span>
                <span className={styles.keyBadge}>D</span>
              </div>
              <p>or Arrow Keys to move</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
