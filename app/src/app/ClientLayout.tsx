'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { NextFont } from 'next/dist/compiled/@next/font';
require('@solana/wallet-adapter-react-ui/styles.css');

interface ClientLayoutProps {
  children: React.ReactNode;
  inter: NextFont;
}

export function ClientLayout({ children, inter }: ClientLayoutProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <body className={`${inter.className} bg-[#1A1A1A]`}>
            {children}
          </body>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 