'use client';

import { useEffect } from 'react';

interface GameOverModalProps {
  score: number;
  walletAddress: string;
  onClose: () => void;
}

export function GameOverModal({ score, walletAddress, onClose }: GameOverModalProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const modal = document.querySelector('.game-over-modal');
      modal?.classList.add('show');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose} />
      <div className="game-over-modal relative bg-[#1A1A1A] border-2 border-[#6F4FF0] rounded-xl p-8 text-center transform scale-95 opacity-0 transition-all duration-300">
        <h2 className="text-5xl font-bold text-[#6F4FF0] mb-8 font-orbitron animate-pulse">
          GAME OVER
        </h2>
        <div className="mb-6">
          <div className="text-lg text-gray-400 mb-2">Final Score</div>
          <div className="text-4xl font-bold text-[#6F4FF0]">{score}</div>
        </div>
        <div className="mb-8">
          <div className="text-sm text-gray-500">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</div>
        </div>
        <div className="text-gray-300 mb-8">
          Check the leaderboard to see where you rank!
        </div>
        <button 
          onClick={onClose}
          className="bg-[#6F4FF0] text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-80 transition-all"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
} 