'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Tetris = dynamic(() => import('react-tetris'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#2D2D2D] flex items-center justify-center">
      <div className="text-white text-xl">Loading game...</div>
    </div>
  ),
});

export function Game() {
  useEffect(() => {
    // Track piece rotation and update CSS variable
    const updatePieceRotation = () => {
      const pieces = document.querySelectorAll('[class*="piece"]:not(.piece-preview)');
      pieces.forEach(piece => {
        const transform = window.getComputedStyle(piece).transform;
        if (transform !== 'none') {
          const values = transform.split('(')[1].split(')')[0].split(',');
          const a = values[0];
          const b = values[1];
          const angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
          piece.style.setProperty('--piece-rotation', `-${angle}deg`);
        }
      });
    };

    const observer = new MutationObserver(updatePieceRotation);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto bg-[#2D2D2D] p-6 rounded-lg shadow-xl">
      <Tetris>
        {({ 
          Gameboard, 
          points, 
          linesCleared 
        }) => (
          <div className="flex gap-8">
            <div className="flex-1 bg-[#1A1A1A] p-4 rounded-lg">
              <div className="tetris-container">
                <div className="tetris-game">
                  <div className="game-board">
                    <Gameboard />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-48 text-white space-y-6">
              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Stats</h3>
                <div className="text-sm space-y-1">
                  <p>Points: {points}</p>
                  <p>Lines: {linesCleared}</p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Controls</h3>
                <div className="text-sm space-y-1">
                  <p>← → : Move</p>
                  <p>↑ : Rotate</p>
                  <p>↓ : Soft Drop</p>
                  <p>Space : Hard Drop</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Tetris>
    </div>
  );
} 