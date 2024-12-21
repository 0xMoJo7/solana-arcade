import { Game } from './components/Game';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
      <div className="game-section">
        <h1 className="title">Solana Arcade</h1>
        
        <div className="relative">
          {/* Left info panel */}
          <div className="info-panel left">
            <div className="mb-8">
              <h3 className="info-title">How to Play</h3>
              <p className="info-content">
                Deposit 0.01 SOL per game
                <br />
                Complete for hourly prizes
                <br />
                Top score wins the pot
              </p>
            </div>
            <div>
              <h3 className="info-title">Controls</h3>
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

          {/* Game */}
          <Game />

          {/* Right info panel */}
          <div className="info-panel right">
            <div className="mb-8">
              <h3 className="info-title">Current Pot</h3>
              <p className="info-content">
                0.24 SOL
                <br />
                Next payout: 42min
              </p>
            </div>
            <div>
              <h3 className="info-title">High Score</h3>
              <p className="info-content">
                12,400
                <br />
                by wallet...f4d2
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard">
          <h2 className="text-xl font-bold mb-4">Top Players</h2>
          {/* Leaderboard content will go here */}
        </div>

        {/* Source code */}
        <div className="source-code">
          <h2 className="text-xl font-bold mb-4">Smart Contract</h2>
          {/* Source code content will go here */}
        </div>
      </div>
    </main>
  );
}
