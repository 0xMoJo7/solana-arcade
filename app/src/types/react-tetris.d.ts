declare module 'react-tetris' {
  export interface GameState {
    piece: {
      position: {
        x: number;
        y: number;
      };
    };
    points: number;
    linesCleared: number;
    state: 'PLAYING' | 'PAUSED' | 'LOST';
  }

  export interface GameboardProps {
    children: (props: {
      Gameboard: React.ComponentType;
      points: number;
      linesCleared: number;
      state: 'PLAYING' | 'PAUSED' | 'LOST';
    }) => React.ReactElement;
    onTick?: (gameState: GameState) => Record<string, boolean>;
  }

  const Tetris: React.FC<GameboardProps>;
  export default Tetris;
} 