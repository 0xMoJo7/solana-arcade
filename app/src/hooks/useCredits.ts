import { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, SystemProgram, PublicKey } from '@solana/web3.js';
import { getProgram } from '../program';

export function useCredits() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get player's credit balance
  const fetchCredits = useCallback(async () => {
    if (!wallet) return;

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);

      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_account"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const account = await program.account.playerAccount.fetch(playerAccountPda);
      setCredits(account.balance.toNumber() / LAMPORTS_PER_SOL / 10); // 0.1 SOL = 1 credit
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
    }
  }, [wallet, connection]);

  // Deposit funds for credits
  const depositCredits = useCallback(async (amount: number) => {
    if (!wallet) return;
    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);

      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_account"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const lamports = new BN(amount * LAMPORTS_PER_SOL / 10); // 0.1 SOL per credit

      await program.methods
        .depositFunds(lamports)
        .accounts({
          playerAccount: playerAccountPda,
          player: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchCredits();
    } catch (error) {
      console.error("Error depositing credits:", error);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, fetchCredits]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    depositCredits,
    fetchCredits,
  };
} 