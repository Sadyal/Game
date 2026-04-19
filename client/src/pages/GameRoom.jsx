import React from 'react';
import { useParams } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import Board from '../components/game/Board/Board';
import styles from './GameRoom.module.css';

const GameRoom = () => {
  const { roomId } = useParams();
  const { isConnected, roomData, gameState, rollResult, rollDice, moveToken } = useGameSocket(roomId);

  if (!isConnected) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Connecting to Game Server...</p>
      </div>
    );
  }

  // Determine me from players list (for simplicity, find index mapping to this socket, omitted here for brevity, assume 0 for demo)
  const myPlayerIndex = 0;

  return (
    <div className={styles.roomContainer}>
      <div className={styles.topBar}>
        <h2>Room: <span className="text-gradient">{roomId}</span></h2>
        <div className={styles.playersList}>
          {roomData?.players?.map((p, i) => (
             <span key={i} className={`${styles.playerBadge} ${styles[`playerColor${p.index}`]}`}>
               Player {p.index + 1} {gameState?.turn === p.index ? '(Turn)' : ''}
             </span>
          ))}
        </div>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.relativeWrapper}>
          <Board 
            gameState={gameState} 
            myPlayerIndex={myPlayerIndex}
            onTokenClick={(playerIndex, tokenIndex) => moveToken(playerIndex, tokenIndex)} 
          />
          
          {/* Waiting for players overlay */}
          {roomData?.players?.length < 2 && (
            <div className={styles.overlay}>
              <h2>Waiting for Players...</h2>
              <p>Share this Room Code with your friends:</p>
              <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '30px' }}>{roomId}</h1>
              <div className={styles.waitingSpinner}></div>
            </div>
          )}
        </div>

        <div className={styles.sidePanel}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Dice Roller</h3>
            <div className={styles.diceDisplay}>
              {rollResult || '?'}
            </div>
            <button 
              className={styles.rollBtn}
              onClick={rollDice}
              disabled={roomData?.players?.length < 2 || gameState?.turn !== myPlayerIndex}
            >
              Roll Dice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
