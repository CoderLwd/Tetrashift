import { useState, useCallback, useEffect } from 'react';
import { COLS, ROWS, RANDOM_TETROMINO } from '../constants';
import { Grid, Player, Position, Shape } from '../types';

export const createGrid = () =>
  Array.from(Array(ROWS), () => new Array(COLS).fill(0));

export const useTetris = () => {
  const [grid, setGrid] = useState<Grid>(createGrid());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: RANDOM_TETROMINO().shape,
    collided: false,
  });
  const [nextPiece, setNextPiece] = useState<Shape>(RANDOM_TETROMINO().shape);

  const checkCollision = useCallback(
    (player: Player, grid: Grid, { x: moveX, y: moveY }: Position) => {
      for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
          // 1. Check that we're on an actual Tetromino cell
          if (player.tetromino[y][x] !== 0) {
            if (
              // 2. Check that our move is inside the game areas height (y)
              !grid[y + player.pos.y + moveY] ||
              // 3. Check that our move is inside the game areas width (x)
              grid[y + player.pos.y + moveY][x + player.pos.x + moveX] === undefined ||
              // 4. Check that the cell we're moving to isn't set to 0 (empty)
              grid[y + player.pos.y + moveY][x + player.pos.x + moveX] !== 0
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const resetPlayer = useCallback(() => {
    const newPiece = nextPiece;
    setPlayer({
      pos: { x: COLS / 2 - 2, y: 0 },
      tetromino: newPiece,
      collided: false,
    });
    setNextPiece(RANDOM_TETROMINO().shape);
  }, [nextPiece]);

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided,
    }));
  };

  const rotate = (matrix: Shape, dir: number) => {
    // Make the rows to become cols (transpose)
    const rotatedTetromino = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetromino.map(row => row.reverse());
    return rotatedTetromino.reverse();
  };

  const playerRotate = (grid: Grid, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, grid, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  return {
    grid,
    setGrid,
    player,
    setPlayer,
    resetPlayer,
    updatePlayerPos,
    playerRotate,
    checkCollision,
    nextPiece,
  };
};
