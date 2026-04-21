import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 25;

const DIFFICULTY_TICKS = {
  easy: 150,
  medium: 100,
  hard: 60
};

const generateFood = (snakeBody) => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    const onSnake = snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!onSnake) break;
  }
  return newFood;
};

const getInitialState = () => ({
  status: 'waiting', // 'waiting', 'playing', 'game_over'
  snake: {
    body: [
      { x: 12, y: 12 },
      { x: 12, y: 13 },
      { x: 12, y: 14 }
    ],
    direction: { x: 0, y: -1 }
  },
  food: { x: 5, y: 5 }, // will be randomized on start
  score: 0,
});

export const useSnakeGame = () => {
  const [gameState, setGameState] = useState(getInitialState());
  const [difficulty, setDifficulty] = useState('medium');
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('snakeHighScore') || '0', 10)
  );

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const startGame = useCallback(() => {
    const newState = getInitialState();
    newState.status = 'playing';
    newState.food = generateFood(newState.snake.body);
    setGameState(newState);
  }, []);

  const changeDirection = useCallback((newDir) => {
    const state = stateRef.current;
    if (state.status !== 'playing') return;

    const { body, direction } = state.snake;
    // Prevent 180 degree turns
    if (body.length > 1) {
      const head = body[0];
      const neck = body[1];
      if (head.x + newDir.x === neck.x && head.y + newDir.y === neck.y) {
        return;
      }
    }

    setGameState(prev => ({
      ...prev,
      snake: {
        ...prev.snake,
        direction: newDir
      }
    }));
  }, []);

  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const tickRate = DIFFICULTY_TICKS[difficulty] || 100;

    const gameLoop = setInterval(() => {
      setGameState(prevState => {
        const { snake, food, score } = prevState;
        const newBody = [...snake.body];
        const head = { ...newBody[0] };

        head.x += snake.direction.x;
        head.y += snake.direction.y;

        // Check Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          return { ...prevState, status: 'game_over' };
        }

        // Check Self Collision
        if (newBody.some(segment => segment.x === head.x && segment.y === head.y)) {
          return { ...prevState, status: 'game_over' };
        }

        newBody.unshift(head);

        let newFood = food;
        let newScore = score;

        // Check Food Collision
        if (head.x === food.x && head.y === food.y) {
          newScore += 10;
          newFood = generateFood(newBody);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
        } else {
          newBody.pop(); // Remove tail if no food eaten
        }

        return {
          ...prevState,
          snake: { ...snake, body: newBody },
          food: newFood,
          score: newScore
        };
      });
    }, tickRate);

    return () => clearInterval(gameLoop);
  }, [gameState.status, highScore, difficulty]);

  return {
    gameState,
    highScore,
    difficulty,
    setDifficulty,
    startGame,
    changeDirection
  };
};
