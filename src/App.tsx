/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Pause } from 'lucide-react';
import Board from './components/Board';
import { Display, NextPiece } from './components/Display';
import { useTetris, createGrid } from './hooks/useTetris';
import { useGameStats } from './hooks/useGameStats';
import { useInterval } from './hooks/useInterval';
import { COLS, ROWS } from './constants';

export default function App() {
  console.log('App init111');

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSoftDropping, setIsSoftDropping] = useState(false);

  const {
    grid,
    setGrid,
    player,
    setPlayer,
    resetPlayer,
    updatePlayerPos,
    playerRotate,
    checkCollision,
    nextPiece,
  } = useTetris();

  const { score, rows, level, setScore, setRows, setLevel, updateStats } = useGameStats();

  const movePlayer = useCallback((dir: number) => {
    if (!checkCollision(player, grid, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  }, [checkCollision, grid, player, updatePlayerPos]);

  const startGame = useCallback(() => {
    // Reset everything
    setGrid(createGrid());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setIsPaused(false);
    setGameStarted(true);
  }, [resetPlayer, setGrid, setLevel, setRows, setScore]);

  const sweepRows = useCallback((newGrid: any[][]) => {
    let linesCleared = 0;
    // Find rows that are full
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) {
        linesCleared++;
        return false;
      }
      return true;
    });

    // Add empty rows at the top for each cleared line
    const sweptGrid = [...filteredGrid];
    while (sweptGrid.length < ROWS) {
      sweptGrid.unshift(new Array(COLS).fill(0));
    }
    
    return { sweptGrid, linesCleared };
  }, []);

  const handleCollision = useCallback((player: any, grid: any[][]) => {
    const newGrid = grid.map(row => [...row]);
    player.tetromino.forEach((row, y: number) => {
      row.forEach((value: any, x: number) => {
        if (value !== 0) {
          const rowIdx = y + player.pos.y;
          const colIdx = x + player.pos.x;
          if (newGrid[rowIdx] && newGrid[rowIdx][colIdx] !== undefined) {
            newGrid[rowIdx][colIdx] = value;
          }
        }
      });
    });

    const { sweptGrid, linesCleared } = sweepRows(newGrid);
    if (linesCleared > 0) {
      updateStats(linesCleared);
    }
    setGrid(sweptGrid);
    resetPlayer();
  }, [resetPlayer, sweepRows, updateStats, setGrid]);

  const drop = useCallback(() => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, grid, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      handleCollision(player, grid);
    }
  }, [checkCollision, grid, level, player, rows, setLevel, updatePlayerPos, handleCollision]);

  const keyUp = useCallback(({ keyCode }: { keyCode: number }) => {
    if (!gameOver && !isPaused && gameStarted) {
      if (keyCode === 40) { // Down arrow
        setIsSoftDropping(false);
      }
    }
  }, [gameOver, isPaused, gameStarted]);

  const dropPlayer = useCallback(() => {
    setDropTime(null);
    drop();
  }, [drop]);

  const move = useCallback(({ keyCode }: { keyCode: number }) => {
    if (!gameOver && !isPaused && gameStarted) {
      if (keyCode === 37) { // Left arrow
        movePlayer(-1);
      } else if (keyCode === 39) { // Right arrow
        movePlayer(1);
      } else if (keyCode === 40) { // Down arrow
        setIsSoftDropping(true);
        dropPlayer();
      } else if (keyCode === 38) { // Up arrow
        playerRotate(grid, 1);
      }
    }
  }, [gameOver, isPaused, movePlayer, dropPlayer, playerRotate, grid, gameStarted]);

  useEffect(() => {
    if (isSoftDropping && !gameOver && !isPaused && gameStarted) {
      setDropTime(100); // Fast drop speed
    } else if (!isPaused && gameStarted && !gameOver) {
      setDropTime(1000 / (level + 1) + 200);
    }
  }, [isSoftDropping, level, isPaused, gameStarted, gameOver]);

  useInterval(() => {
    drop();
  }, dropTime);

  const handlersRef = useRef({ move, keyUp });
  useEffect(() => {
    handlersRef.current = { move, keyUp };
  }, [move, keyUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handlersRef.current.move({ keyCode: e.keyCode } as any);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      handlersRef.current.keyUp({ keyCode: e.keyCode } as any);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Only bind once

  // Dynamic block size for responsiveness
  const togglePause = () => {
    if (gameOver || !gameStarted) return;
    if (isPaused) {
      setDropTime(1000 / (level + 1) + 200);
      setIsPaused(false);
    } else {
      setDropTime(null);
      setIsPaused(true);
    }
  };

  // Dynamic block size for responsiveness
  const [blockSize, setBlockSize] = useState(30);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setBlockSize(22); // Smaller blocks for mobile
      } else {
        setBlockSize(30);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-[100dvh] w-screen bg-[#FAF9F6] text-black font-sans flex flex-col md:flex-row overflow-hidden border-[8px] md:border-[16px] border-black selection:bg-black selection:text-white">
      
      {/* Left Column: Branding & Stats (Desktop) */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-full md:w-1/4 border-b-4 md:border-b-0 md:border-r-4 border-black flex-col justify-between p-6 md:p-8 overflow-y-auto"
      >
        <div>
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter mb-4 select-none">
            TET<br/>RIS
          </h1>
          <div className="bg-black text-[#FAF9F6] inline-block px-4 py-2 font-bold md:text-xl uppercase tracking-widest mb-8">
            Ver 1.0.4
          </div>
        </div>
        
        <div className="space-y-4 md:space-y-8">
          <Display label="Current Level" value={level} />
          <div className="border-t-4 border-black pt-6">
            <Display label="Lines Cleared" value={rows} />
          </div>
        </div>
      </motion.div>

      {/* Mobile Header (Only on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b-4 border-black bg-white z-40">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold tracking-widest opacity-40">Score</span>
          <span className="font-black italic">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase font-bold tracking-widest opacity-40">Next</span>
          <div className="scale-[0.4] -my-10 h-12 w-12 flex items-center justify-center">
            <NextPiece piece={nextPiece} showLabel={false} />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button 
            onClick={togglePause}
            className="p-2 border-2 border-black bg-black text-white active:scale-95 transition-transform"
          >
            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Center Column: The Game Board */}
      <div className="flex-1 bg-white relative flex flex-col items-center justify-between min-h-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Board Container - Flex-1 to push controls down */}
        <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0 overflow-hidden">
          <div className="relative z-10 transition-transform duration-300">
            <Board grid={grid} player={player} blockSize={blockSize} />
            
            <AnimatePresence>
              {(gameOver || isPaused || !gameStarted) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20"
                >
                  {gameOver ? (
                    <div className="text-center">
                      <h2 className="text-3xl md:text-5xl font-black text-red-500 uppercase italic mb-4 tracking-tighter">End of Line</h2>
                      <p className="text-white mb-8 font-bold">Level {level} • {score.toLocaleString()} points</p>
                      <button 
                        onClick={startGame}
                        className="group flex items-center gap-2 bg-white text-black px-6 py-3 md:px-8 md:py-4 font-black uppercase border-4 border-black hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
                      >
                        <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                        Try Again
                      </button>
                    </div>
                  ) : isPaused ? (
                    <div className="text-center">
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-8 tracking-tighter">System Idle</h2>
                      <button 
                        onClick={togglePause}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 md:px-8 md:py-4 font-black uppercase border-4 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
                      >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        Resume
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button 
                        onClick={startGame}
                        className="flex items-center gap-2 bg-white text-black px-8 py-4 md:px-10 md:py-6 font-black text-xl md:text-2xl uppercase border-4 border-black hover:scale-105 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] md:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]"
                      >
                        <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                        Execute
                      </button>
                      <p className="text-white mt-8 opacity-50 text-xs uppercase tracking-widest font-bold">Ready to sequence</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Decorative element (Desktop only) */}
        <div className="hidden lg:flex absolute top-12 right-12 w-32 h-32 border-4 border-black rounded-full items-center justify-center rotate-12 select-none opacity-20">
          <span className="font-black text-4xl">GO!</span>
        </div>

        {/* Mobile Controls - Fixed size grid at bottom */}
        <div className="md:hidden w-full flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white/50 backdrop-blur-md border-t-4 border-black z-30 select-none">
          <div className="grid grid-cols-3 gap-3 w-64 mb-2">
            <div />
            <button 
              onPointerDown={(e) => { e.preventDefault(); playerRotate(grid, 1); }}
              onContextMenu={(e) => e.preventDefault()}
              className="aspect-square flex items-center justify-center bg-black text-white active:scale-90 transition-transform rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] shadow-red-500/20 touch-none"
            >
              <ArrowUp className="w-8 h-8" />
            </button>
            <div />
            
            <button 
              onPointerDown={(e) => { e.preventDefault(); movePlayer(-1); }}
              onContextMenu={(e) => e.preventDefault()}
              className="aspect-square flex items-center justify-center bg-black text-white active:scale-90 transition-transform rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] touch-none"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <button 
              onPointerDown={(e) => { e.preventDefault(); setIsSoftDropping(true); drop(); }}
              onPointerUp={() => setIsSoftDropping(false)}
              onPointerLeave={() => setIsSoftDropping(false)}
              onContextMenu={(e) => e.preventDefault()}
              className="aspect-square flex items-center justify-center bg-black text-white active:scale-90 transition-transform rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] touch-none"
            >
              <ArrowDown className="w-8 h-8" />
            </button>
            <button 
              onPointerDown={(e) => { e.preventDefault(); movePlayer(1); }}
              onContextMenu={(e) => e.preventDefault()}
              className="aspect-square flex items-center justify-center bg-black text-white active:scale-90 transition-transform rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] touch-none"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Next Piece & Controls (Desktop) */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-full md:w-1/4 border-t-4 md:border-t-0 md:border-l-4 border-black flex flex-col p-6 md:p-8 overflow-y-auto"
      >
        <div className="flex-1">
          <NextPiece piece={nextPiece} />
          
          <div className="mt-8">
            <Display label="Current Score" value={score.toLocaleString()} />
          </div>

          <div className="mt-12 pt-6 border-t-4 border-black">
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40 mb-4">Manual Interface</p>
            <div className="space-y-3 font-bold text-sm">
              <div className="flex justify-between items-center">
                <span>Rotate</span>
                <span className="bg-black text-white px-2 py-0.5 border-2 border-black">↑</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shift</span>
                <span className="bg-black text-white px-2 py-0.5 border-2 border-black">← →</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pulse</span>
                <span className="bg-black text-white px-2 py-0.5 border-2 border-black">↓</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={togglePause}
                disabled={gameOver || !gameStarted}
                className="w-full flex items-center justify-center gap-2 bg-black text-white p-4 font-black uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50"
              >
                {isPaused ? "Resume Sequence" : "Pause Interface"}
              </button>
              <button 
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 bg-white text-black p-4 border-4 border-black font-black uppercase text-xs tracking-widest hover:invert transition-all"
              >
                Re-initialize
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Decorative patterns */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] overflow-hidden">
         <div className="absolute -top-24 -left-24 w-96 h-96 border-[40px] border-black rounded-full" />
         <div className="absolute -bottom-24 -right-24 w-96 h-96 border-[40px] border-black" />
      </div>
    </div>
  );
}

