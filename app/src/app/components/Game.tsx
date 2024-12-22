'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';
import { GameOverModal } from './GameOverModal';
import { WalletConnect } from './WalletConnect';
import { useCredits } from '../../hooks/useCredits';
import { useGame } from '../../hooks/useGame';
import { DepositModal } from './DepositModal';

const Tetris = dynamic(() => import('react-tetris'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#2D2D2D] flex items-center justify-center">
      <div className="text-white text-xl">Loading game...</div>
    </div>
  ),
});

interface GameTickState {
  piece: {
    position: {
      x: number;
      y: number;
    };
  };
  lastMove?: string;
}

export function Game() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(true);
  const isPlayable = true;
  const [timeUntilPayout, setTimeUntilPayout] = useState('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { credits, loading: creditsLoading, transactionPending, depositCredits } = useCredits();
  const { generateScoreHash, setGameSeed } = useGame();
  const [showDepositModal, setShowDepositModal] = useState(false);

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
  const handleGameTick = useCallback((gameState: GameTickState) => {
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

  // Update the game over handler
  const handleGameOver = useCallback(({ points }: { points: number }) => {
    const scoreHash = generateScoreHash(points);
    setFinalScore(points);
    setShowGameOver(true);
  }, [generateScoreHash]);

  // Update deposit handler
  const handleAddCredits = useCallback(async (amount: number) => {
    try {
      await depositCredits(amount);
      setShowDepositModal(false);  // Close modal on success
    } catch (error) {
      console.error("Error depositing credits:", error);
    }
  }, [depositCredits]);

  const handleAddCreditsClick = () => {
    console.log('Add Credits clicked');
    setShowDepositModal(true);
  };

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-[#2D2D2D] flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="game-section relative">
      {/* Main game container */}
      <div className="game-container">
        {/* Left info panel */}
        <div className="info-panel left">
          <div className="mb-8">
            <h3 className="info-title">HOW TO PLAY</h3>
            <p className="info-content">
              Load credits to play<br />
              Top score wins the pot hourly<br />
              Collect XP<br />
              Top score wins the pot
            </p>
          </div>
          <div>
            <h3 className="info-title">CONTROLS</h3>
            <p className="info-content">
              ← → : Move<br />
              ↑ : Rotate<br />
              ↓ : Soft Drop<br />
              Space : Hard Drop
            </p>
          </div>
        </div>

        {/* Tetris game */}
        <div className="tetris-container">
          <Tetris onTick={handleGameTick}>
            {({ 
              Gameboard, 
              points, 
              linesCleared,
              state
            }: {
              Gameboard: React.ComponentType;
              points: number;
              linesCleared: number;
              state: 'PLAYING' | 'PAUSED' | 'LOST';
            }) => {
              useEffect(() => {
                if (state === 'LOST') {
                  setFinalScore(points);
                  setShowGameOver(true);
                }
              }, [state, points]);

              return (
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
              );
            }}
          </Tetris>
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

      {/* Game Credits Section */}
      <div className="game-credits">
        <div>
          <h2 className="text-xl font-bold">Game Credits</h2>
          <div className="mt-1">
            <p className="text-white/90">Current Balance: {credits} credits</p>
            <p className="text-sm text-white/60">1 credit = 0.1 SOL</p>
          </div>
        </div>

        <DepositModal
          onDeposit={handleAddCredits}
          onClose={() => {}}  // Empty function since we don't need to close anymore
          isLoading={creditsLoading || transactionPending}
        />
      </div>

      {/* Centered leaderboard */}
      <div className="leaderboard-section">
        <h2 className="leaderboard-title">Current Leaderboard</h2>
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="leaderboard-cell">Wallet</div>
            <div className="leaderboard-cell">Score</div>
            <div className="leaderboard-cell">Attempts</div>
          </div>
        </div>
      </div>

      {showGameOver && (
        <GameOverModal
          score={finalScore}
          walletAddress={connected ? publicKey?.toBase58() || '' : ''}
          onClose={() => {
            setShowGameOver(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
} 