import React, { useState } from 'react';
import { PlayerNameInput } from './components/PlayerNameInput';
import { MainMenu } from './components/MainMenu';
import { Leaderboard } from './components/Leaderboard';
import Game from './components/Game';
import { useGameStore } from './store/gameStore';

function App() {
  const { isAuthenticated } = useGameStore();
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'leaderboard'>('menu');

  if (!isAuthenticated) {
    return <PlayerNameInput />;
  }

  switch (currentView) {
    case 'menu':
      return (
        <MainMenu
          onStartGame={() => setCurrentView('game')}
          onShowLeaderboard={() => setCurrentView('leaderboard')}
        />
      );
    case 'game':
      return <Game onBack={() => setCurrentView('menu')} />;
    case 'leaderboard':
      return <Leaderboard onBack={() => setCurrentView('menu')} />;
    default:
      return null;
  }
}

export default App;