import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import Board from '../components/game/Board/Board';
import styles from './GameRoom.module.css';

const GameRoom = () => {
  const { roomId } = useParams();
  const { isConnected, roomData, gameState, myPlayerIndex, startGame, restartGame, changeDirection } = useGameSocket(roomId);

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

  if (!isConnected) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Connecting to Game Server...</p>
      </div>
    );
  }

  const isHost = roomData?.players[0]?.index === myPlayerIndex;

  return (
    <div className={styles.roomContainer}>
      <div className={styles.topBar}>
        <h2>Room: <span className="text-gradient">{roomId}</span></h2>
        <div className={styles.highScoreBadge}>
           High Score: {gameState?.highScore || 0}
        </div>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.boardSection}>
          <div className={styles.relativeWrapper}>
            <Board gameState={gameState} />
            
            {/* Waiting/Game Over Overlays */}
            {gameState?.status === 'waiting' && (
              <div className={styles.overlay}>
                <h2>Waiting for Players...</h2>
                <p>Room Code:</p>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '20px' }}>{roomId}</h1>
                <div className={styles.playersJoined}>
                   {roomData?.players.length} / 4 Players Joined
                </div>
                {isHost ? (
                  <button className={styles.primaryBtn} onClick={startGame}>
                    Start Game
                  </button>
                ) : (
                  <p className={styles.waitingText}>Waiting for host to start...</p>
                )}
              </div>
            )}

            {gameState?.status === 'game_over' && (
              <div className={styles.overlay}>
                <h2 className="text-gradient" style={{ fontSize: '3rem' }}>GAME OVER</h2>
                <div className={styles.finalScores}>
                  {roomData?.players.map(p => (
                    <div key={p.index} className={styles.finalScoreRow}>
                      <span className={`${styles.playerIndicator} ${styles[`color${p.index}`]}`}></span>
                      <span>Player {p.index + 1}:</span>
                      <strong>{gameState.scores[p.index]}</strong>
                    </div>
                  ))}
                </div>
                {isHost && (
                  <button className={styles.primaryBtn} onClick={restartGame}>
                    Play Again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={`glass-panel ${styles.scoreboard}`}>
            <h3>Live Scoreboard</h3>
            <div className={styles.scoreList}>
              {roomData?.players.map((p) => {
                const isDead = gameState?.snakes[p.index] && !gameState.snakes[p.index].alive;
                return (
                  <div key={p.index} className={`${styles.scoreCard} ${p.index === myPlayerIndex ? styles.myScore : ''} ${isDead ? styles.deadPlayer : ''}`}>
                    <div className={styles.scoreInfo}>
                       <span className={`${styles.playerIndicator} ${styles[`color${p.index}`]}`}></span>
                       <span className={styles.playerName}>
                         Player {p.index + 1} {p.index === myPlayerIndex && "(You)"}
                       </span>
                    </div>
                    <span className={styles.scoreValue}>{gameState?.scores[p.index] || 0}</span>
                  </div>
                )
              })}
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

export default GameRoom;
