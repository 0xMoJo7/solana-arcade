'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

export function WalletConnect() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
      <div className="xp-display">
        <span className="xp-amount">0 XP</span>
        <span className="xp-emoji">✨</span>
      </div>
      <WalletMultiButton />
    </div>
  );
} 