'use client';

import { useEffect } from 'react';

interface GameOverModalProps {
  score: number;
  walletAddress: string;
  onClose: () => void;
}

export function GameOverModal({ score, walletAddress, onClose }: GameOverModalProps) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal show">
        <h2 className="game-over-title">GAME OVER</h2>
        <div className="game-over-content">
          <div className="game-over-score">
            <span className="score-label">Final Score</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="wallet-address">
            {walletAddress ? `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Not Connected'}
          </div>
          <p className="game-over-message">
            Your score has been recorded! Check the leaderboard to see if you won.
          </p>
        </div>
        <button className="play-again-button" onClick={onClose}>
          Play Again
        </button>
      </div>
    </div>
  );
} 