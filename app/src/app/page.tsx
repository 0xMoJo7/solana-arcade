import { Game } from './components/Game';
import { WalletConnect } from './components/WalletConnect';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center p-4">
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="title">Solana Arcade</h1>
          <div className="title-effect"></div>
        </div>
        <WalletConnect />
        <Game />
      </div>
    </main>
  );
}
