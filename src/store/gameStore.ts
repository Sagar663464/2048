import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface GameState {
  playerName: string;
  isAuthenticated: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  setPlayerName: (name: string) => void;
  setAuthenticated: (status: boolean) => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  saveScore: (score: number, maxTile: number) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: '',
  isAuthenticated: false,
  difficulty: 'medium',
  setPlayerName: (name) => set({ playerName: name }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setDifficulty: (difficulty) => set({ difficulty }),
  saveScore: async (score, maxTile) => {
    const { data: player } = await supabase
      .from('players')
      .select()
      .eq('name', get().playerName)
      .single();

    if (player) {
      await supabase.from('scores').insert({
        player_id: player.id,
        score,
        difficulty: get().difficulty,
        max_tile: maxTile
      });
    }
  }
}));