import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  player_name: string;
  score: number;
  difficulty: string;
  max_tile: number;
}

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('scores')
        .select(`
          score,
          max_tile,
          difficulty,
          players (name)
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (data) {
        setScores(data.map(entry => ({
          player_name: entry.players.name,
          score: entry.score,
          difficulty: entry.difficulty,
          max_tile: entry.max_tile
        })));
      }
      setLoading(false);
    };

    fetchScores();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading scores...</div>
        ) : (
          <div className="space-y-4">
            {scores.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex-shrink-0 w-8">
                  {index < 3 && (
                    <Medal
                      size={24}
                      className={
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : 'text-amber-600'
                      }
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{entry.player_name}</h3>
                  <p className="text-sm text-gray-600">
                    Max Tile: {entry.max_tile} | Difficulty: {entry.difficulty}
                  </p>
                </div>
                <div className="text-xl font-bold text-blue-600">{entry.score}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};