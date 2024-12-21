'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';
import { GameOverModal } from './GameOverModal';

const Tetris = dynamic(() => import('react-tetris'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#2D2D2D] flex items-center justify-center">
      <div className="text-white text-xl">Loading game...</div>
    </div>
  ),
});

export function Game() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(true);
  const isPlayable = true;
  const [timeUntilPayout, setTimeUntilPayout] = useState('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const diff = nextHour.getTime() - now.getTime();
      
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilPayout(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play handler for demo mode
  const handleGameTick = useCallback((gameState: any) => {
    if (!isPlayable && gameState.piece) {
      const x = gameState.piece.position.x;
      const moves = [];
      
      if (x < 3) moves.push('right');
      if (x > 6) moves.push('left');
      if (Math.random() < 0.1) moves.push('rotate');
      if (x >= 3 && x <= 6 && Math.random() < 0.3) {
        moves.push('drop');
      }
      
      if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        return { [move]: true };
      }
    }
    return {};
  }, [isPlayable]);

  // Add this useEffect near the top of the Game component
  useEffect(() => {
    const preventArrowScroll = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventArrowScroll);
    return () => window.removeEventListener('keydown', preventArrowScroll);
  }, []);

  // Update the game over handler to receive the final score
  const handleGameOver = useCallback(({ points }: { points: number }) => {
    setFinalScore(points);
    setShowGameOver(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-[#2D2D2D] flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`game-container ${!isPlayable ? 'game-container-disabled' : ''}`}>
          <Tetris 
            onTick={handleGameTick}
          >
            {({ 
              Gameboard, 
              points, 
              linesCleared,
              state  // Add this to track game state
            }) => {
              // Check for game over state
              useEffect(() => {
                if (state === 'LOST') {
                  setShowGameOver(true);
                  setFinalScore(points);
                }
              }, [state, points]);

              return (
                <div className="flex gap-8">
                  {/* Left info panel */}
                  <div className="info-panel left">
                    <div className="mb-8">
                      <h3 className="info-title">HOW TO PLAY</h3>
                      <p className="info-content">
                        Load credits to play
                        <br />
                        Top score wins the pot paid out hourly
                        <br />
                        Collect XP
                        <br />
                        Top score wins the pot
                      </p>
                    </div>
                    <div>
                      <h3 className="info-title">CONTROLS</h3>
                      <p className="info-content">
                        ← → : Move
                        <br />
                        ↑ : Rotate
                        <br />
                        ↓ : Soft Drop
                        <br />
                        Space : Hard Drop
                      </p>
                    </div>
                  </div>

                  {/* Game Board */}
                  <div className="flex-1">
                    <div className="tetris-container">
                      <div className="tetris-game">
                        <div className="game-board">
                          <Gameboard />
                        </div>
                        <div className="score-display">
                          <div>
                            <span>Score: </span>
                            <span>{points}</span>
                          </div>
                          <div>
                            <span>Lines: </span>
                            <span>{linesCleared}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right info panel */}
                  <div className="info-panel right">
                    <div className="current-pot">
                      <h3 className="info-title">CURRENT POT</h3>
                      <div className="pot-display">
                        <span className="pot-amount">0 SOL</span>
                        <span className="pot-emoji">💰</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="info-title">NEXT PAYOUT</h3>
                      <div className="countdown-display">{timeUntilPayout}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Tetris>
        </div>

        {/* Overlay for non-playable state */}
        {!isPlayable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20 z-10">
            <h3 className="text-xl mb-6 font-orbitron text-white">
              Add Credits to Play
            </h3>
            <button className="start-game-button">
              START GAME
            </button>
          </div>
        )}
      </div>

      {/* Game Credits Section */}
      <div className="game-credits mt-8">
        <h2 className="credits-title">Game Credits</h2>
        <div className="credits-content">
          <div className="credits-info">
            <p>Current Balance: 0 credits</p>
            <p className="credits-rate">1 credit = 0.01 SOL</p>
          </div>
          <button className="add-credits-button">
            Add Credits
          </button>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="leaderboard-section mt-8">
        <h2 className="leaderboard-title">Current Leaderboard</h2>
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="leaderboard-cell">Wallet</div>
            <div className="leaderboard-cell">Score</div>
            <div className="leaderboard-cell">Attempts</div>
          </div>
          {/* Table content will go here */}
        </div>
      </div>

      {showGameOver && (
        <GameOverModal
          score={finalScore}
          walletAddress={connected ? publicKey?.toBase58() || '' : ''}
          onClose={() => {
            setShowGameOver(false);
            window.location.reload(); // Refresh to start a new game
          }}
        />
      )}
    </div>
  );
} 