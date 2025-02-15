import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface MainMenuProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowLeaderboard }) => {
  const { difficulty, setDifficulty, playerName } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">2048</h1>
        <p className="text-gray-600 text-center mb-8">Welcome, {playerName}!</p>

        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play size={20} /> Start Game
          </button>

          <button
            onClick={onShowLeaderboard}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Trophy size={20} /> Leaderboard
          </button>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Difficulty</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-4 rounded-lg capitalize ${
                    difficulty === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};