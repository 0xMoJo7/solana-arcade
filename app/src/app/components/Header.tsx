'use client';

export function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#1A1A1A]">
      <h1 className="text-4xl font-bold text-[#6F4FF0]">SOLANA ARCADE</h1>
      <div className="flex items-center gap-4">
        <div className="text-white px-4 py-2 bg-[#2D2D2D] rounded-lg">
          0 XP
        </div>
        <WalletConnect />
      </div>
    </header>
  );
} 