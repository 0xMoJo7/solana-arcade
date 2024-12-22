import { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, web3 } from '@project-serum/anchor';
import { getProgram, PROGRAM_ID } from '../program';
import { PublicKey } from '@solana/web3.js';

export function useGameState() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [currentPot, setCurrentPot] = useState<number>(0);
  const [nextPayout, setNextPayout] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGameState = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);

      // Get game state PDA
      const [gameStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_state")],
        PROGRAM_ID
      );

      // Fetch game state
      const gameState = await program.account.gameState.fetch(gameStatePda);
      setCurrentPot(gameState.currentPot.toNumber() / 1e9); // Convert lamports to SOL
      setNextPayout(new Date(gameState.nextPayout.toNumber() * 1000));
    } catch (error) {
      console.error("Error fetching game state:", error);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection]);

  useEffect(() => {
    fetchGameState();
    // Set up interval to refresh game state
    const interval = setInterval(fetchGameState, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchGameState]);

  return {
    currentPot,
    nextPayout,
    loading,
    refreshGameState: fetchGameState
  };
} 