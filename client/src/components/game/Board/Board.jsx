import React from 'react';
import styles from './Board.module.css';

const Board = ({ gameState }) => {
  if (!gameState || !gameState.snake) {
    return <div className={styles.boardContainer}><div className={styles.loader}></div></div>;
  }

  const GRID_SIZE = 25;
  const gridCells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    x: i % GRID_SIZE,
    y: Math.floor(i / GRID_SIZE)
  }));

  const getSegmentDirection = (seg1, seg2) => {
    if (!seg2) return 'up'; // default if length 1
    if (seg1.x > seg2.x) return 'right';
    if (seg1.x < seg2.x) return 'left';
    if (seg1.y > seg2.y) return 'down';
    if (seg1.y < seg2.y) return 'up';
    return 'up';
  };

  const getCellClass = (x, y) => {
    // Check food
    if (gameState.food && gameState.food.x === x && gameState.food.y === y) {
      return `${styles.cell} ${styles.food}`;
    }

    const snake = gameState.snake;
    const bodyIndex = snake.body.findIndex(segment => segment.x === x && segment.y === y);

    if (bodyIndex !== -1) {
      if (gameState.status === 'game_over') return `${styles.cell} ${styles.deadSnake}`;

      if (bodyIndex === 0) {
        // Head
        const dir = getSegmentDirection(snake.body[0], snake.body[1]);
        return `${styles.cell} ${styles.snakeBody} ${styles.snakeHead} ${styles[`head-${dir}`]}`;
      } else if (bodyIndex === snake.body.length - 1) {
        // Tail
        const dir = getSegmentDirection(snake.body[bodyIndex], snake.body[bodyIndex - 1]);
        // Note: For tail, seg1 is the tail, seg2 is the segment before it.
        // If tail x > seg2 x, the tail is pointing right (so it tapers to the right).
        return `${styles.cell} ${styles.snakeBody} ${styles.snakeTail} ${styles[`tail-${dir}`]}`;
      } else {
        // Middle Body
        return `${styles.cell} ${styles.snakeBody}`;
      }
    }

    return styles.cell;
  };

  return (
    <div className={styles.boardContainer}>
      <div 
        className={styles.snakeGrid} 
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {gridCells.map(cell => (
          <div 
            key={`${cell.x}-${cell.y}`} 
            className={getCellClass(cell.x, cell.y)}
          >
             {/* If it's the head, render eyes using CSS pseudoelements via classes */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
