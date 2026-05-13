import React, { useRef, useEffect } from 'react';
import { COLS, ROWS, BLOCK_SIZE, TETROMINOS } from '../constants';
import { Grid, Player } from '../types';

interface BoardProps {
  grid: Grid;
  player: Player;
  blockSize?: number;
}

const Board: React.FC<BoardProps> = ({ grid, player, blockSize = BLOCK_SIZE }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * blockSize, 0);
      ctx.lineTo(x * blockSize, ROWS * blockSize);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * blockSize);
      ctx.lineTo(COLS * blockSize, y * blockSize);
      ctx.stroke();
    }
  };

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    
    // Artistic flair - clean black border for each block
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    
    // Subtle inner light for depth (top/left)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x * blockSize + 2, y * blockSize + blockSize - 2);
    ctx.lineTo(x * blockSize + 2, y * blockSize + 2);
    ctx.lineTo(x * blockSize + blockSize - 2, y * blockSize + 2);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas - using total board area
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background (subtle dots/lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * blockSize, 0);
      ctx.lineTo(x * blockSize, ROWS * blockSize);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * blockSize);
      ctx.lineTo(COLS * blockSize, y * blockSize);
      ctx.stroke();
    }

    // Draw static blocks...
    grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const type = value as keyof typeof TETROMINOS;
          drawBlock(ctx, x, y, TETROMINOS[type].color);
        }
      });
    });

    // Draw player piece
    if (player.tetromino) {
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const type = value as keyof typeof TETROMINOS;
            drawBlock(ctx, x + player.pos.x, y + player.pos.y, TETROMINOS[type].color);
          }
        });
      });
    }
  }, [grid, player, blockSize]);

  return (
    <div className="relative p-1 bg-black border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <canvas
        ref={canvasRef}
        width={COLS * blockSize}
        height={ROWS * blockSize}
        className="block"
      />
    </div>
  );
};

export default Board;
