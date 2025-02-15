import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, RotateCcw, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

type Cell = {
  value: number;
  id: string;
  mergedFrom?: boolean;
};

type Grid = Cell[][];

interface GameProps {
  onBack: () => void;
}

const GRID_SIZE = 4;
const GRID_SPACING = 12; // Spacing between tiles
const GRID_PADDING = 12; // Padding around the grid
const TILE_SIZE = 80; // Size of each tile

const getInitialGrid = (): Grid => {
  const grid: Grid = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      value: 0,
      id: Math.random().toString(36).substr(2, 9)
    }))
  );
  return addNewTile(addNewTile(grid));
};

const addNewTile = (grid: Grid): Grid => {
  const emptyCells = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].value === 0) {
        emptyCells.push({ x: i, y: j });
      }
    }
  }

  if (emptyCells.length === 0) return grid;

  const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = [...grid];
  newGrid[x][y] = {
    value: Math.random() < 0.9 ? 2 : 4,
    id: Math.random().toString(36).substr(2, 9),
    mergedFrom: false
  };
  return newGrid;
};

const moveGrid = (grid: Grid, direction: string): { grid: Grid; moved: boolean; merged: number } => {
  let moved = false;
  let merged = 0;
  const newGrid = JSON.parse(JSON.stringify(grid));

  // Reset merged flags
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (newGrid[i][j].mergedFrom) {
        newGrid[i][j].mergedFrom = false;
      }
    }
  }

  const moveCell = (fromX: number, fromY: number, toX: number, toY: number) => {
    if (newGrid[fromX][fromY].value === 0) return false;
    if (newGrid[toX][toY].value === 0) {
      newGrid[toX][toY] = { ...newGrid[fromX][fromY] };
      newGrid[fromX][fromY] = { value: 0, id: Math.random().toString(36).substr(2, 9) };
      return true;
    }
    if (newGrid[toX][toY].value === newGrid[fromX][fromY].value && !newGrid[toX][toY].mergedFrom) {
      const newValue = newGrid[toX][toY].value * 2;
      newGrid[toX][toY] = {
        value: newValue,
        id: Math.random().toString(36).substr(2, 9),
        mergedFrom: true
      };
      newGrid[fromX][fromY] = { value: 0, id: Math.random().toString(36).substr(2, 9) };
      merged += newValue;
      return true;
    }
    return false;
  };

  if (direction === 'ArrowUp' || direction === 'KeyW') {
    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = 1; i < GRID_SIZE; i++) {
        for (let k = i; k > 0; k--) {
          if (moveCell(k, j, k - 1, j)) moved = true;
        }
      }
    }
  } else if (direction === 'ArrowDown' || direction === 'KeyS') {
    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = GRID_SIZE - 2; i >= 0; i--) {
        for (let k = i; k < GRID_SIZE - 1; k++) {
          if (moveCell(k, j, k + 1, j)) moved = true;
        }
      }
    }
  } else if (direction === 'ArrowLeft' || direction === 'KeyA') {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 1; j < GRID_SIZE; j++) {
        for (let k = j; k > 0; k--) {
          if (moveCell(i, k, i, k - 1)) moved = true;
        }
      }
    }
  } else if (direction === 'ArrowRight' || direction === 'KeyD') {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = GRID_SIZE - 2; j >= 0; j--) {
        for (let k = j; k < GRID_SIZE - 1; k++) {
          if (moveCell(i, k, i, k + 1)) moved = true;
        }
      }
    }
  }

  return { grid: newGrid, moved, merged };
};

const Game: React.FC<GameProps> = ({ onBack }) => {
  const { playerName, difficulty, saveScore } = useGameStore();
  const [grid, setGrid] = useState<Grid>(getInitialGrid());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
      if (!validKeys.includes(event.code)) return;
      if (gameOver) return;
      
      event.preventDefault();
      
      const { grid: newGrid, moved, merged } = moveGrid(grid, event.code);
      if (moved) {
        const gridWithNewTile = addNewTile(newGrid);
        setGrid(gridWithNewTile);
        
        // Update score
        const newScore = score + merged;
        setScore(newScore);
        setBestScore(Math.max(bestScore, newScore));
        
        // Check for win condition
        const maxTile = Math.max(...gridWithNewTile.flat().map(cell => cell.value));
        if (maxTile >= 2048 && !won) {
          setWon(true);
          await saveScore(newScore, maxTile);
        }
        
        // Check for game over
        if (isGameOver(gridWithNewTile)) {
          setGameOver(true);
          await saveScore(newScore, maxTile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver, score]);

  const isGameOver = (grid: Grid): boolean => {
    // Check for any empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j].value === 0) return false;
      }
    }

    // Check for any possible moves
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = grid[i][j].value;
        if (
          (i < GRID_SIZE - 1 && grid[i + 1][j].value === current) ||
          (j < GRID_SIZE - 1 && grid[i][j + 1].value === current)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const resetGame = () => {
    setGrid(getInitialGrid());
    setGameOver(false);
    setWon(false);
    setScore(0);
  };

  const getCellColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-200',
      2: 'bg-blue-100 text-blue-900',
      4: 'bg-blue-200 text-blue-900',
      8: 'bg-blue-300 text-blue-900',
      16: 'bg-blue-400 text-white',
      32: 'bg-blue-500 text-white',
      64: 'bg-blue-600 text-white',
      128: 'bg-blue-700 text-white',
      256: 'bg-blue-800 text-white',
      512: 'bg-blue-900 text-white',
      1024: 'bg-indigo-600 text-white',
      2048: 'bg-indigo-700 text-white'
    };
    return colors[value] || 'bg-indigo-900 text-white';
  };

  // Calculate total grid size
  const totalSize = GRID_PADDING * 2 + TILE_SIZE * 4 + GRID_SPACING * 3;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">2048</h1>
                <p className="text-gray-600">Player: {playerName} | Difficulty: {difficulty}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold text-gray-900">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Best</p>
                <p className="text-xl font-bold text-gray-900">{bestScore}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} /> New Game
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <RotateCcw size={16} />
              <span>Use arrow keys or WASD to move</span>
            </div>
          </div>

          <div 
            className="relative bg-gray-300 rounded-lg mx-auto"
            style={{ 
              width: `${totalSize}px`,
              height: `${totalSize}px`,
              padding: `${GRID_PADDING}px`
            }}
          >
            {/* Grid background */}
            <div 
              className="grid grid-cols-4 absolute inset-0"
              style={{ 
                gap: `${GRID_SPACING}px`,
                padding: `${GRID_PADDING}px`
              }}
            >
              {Array(16).fill(null).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded"
                  style={{ 
                    width: `${TILE_SIZE}px`,
                    height: `${TILE_SIZE}px`
                  }}
                />
              ))}
            </div>

            {/* Tiles */}
            <AnimatePresence>
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  cell.value !== 0 && (
                    <motion.div
                      key={cell.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute rounded flex items-center justify-center font-bold ${getCellColor(cell.value)}`}
                      style={{
                        width: `${TILE_SIZE}px`,
                        height: `${TILE_SIZE}px`,
                        left: `${GRID_PADDING + j * (TILE_SIZE + GRID_SPACING)}px`,
                        top: `${GRID_PADDING + i * (TILE_SIZE + GRID_SPACING)}px`,
                        fontSize: cell.value > 512 ? '24px' : '28px'
                      }}
                    >
                      {cell.value}
                    </motion.div>
                  )
                ))
              )}
            </AnimatePresence>
          </div>

          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <h2 className={`text-2xl font-bold mb-4 ${won ? 'text-green-600' : 'text-red-600'}`}>
                {won ? 'Congratulations! You won!' : 'Game Over!'}
              </h2>
              <div className="space-x-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;