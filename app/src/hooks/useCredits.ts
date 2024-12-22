import { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { getProgram, PROGRAM_ID } from '../program';
import toast from 'react-hot-toast';

export function useCredits() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);

  const fetchPlayerAccount = useCallback(async () => {
    if (!wallet) return null;

    const [playerAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player_account"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    return playerAccountPda;
  }, [wallet]);

  const fetchCredits = useCallback(async () => {
    if (!wallet) return;

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);
      const playerAccountPda = await fetchPlayerAccount();

      if (!playerAccountPda) return;

      try {
        const account = await program.account.playerAccount.fetch(playerAccountPda);
        setCredits(account.balance.toNumber() / LAMPORTS_PER_SOL / 10); // 0.1 SOL = 1 credit
      } catch (e) {
        console.log("No player account found yet");
        setCredits(0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast.error("Failed to fetch credits balance");
    }
  }, [wallet, connection, fetchPlayerAccount]);

  const depositCredits = useCallback(async (amount: number) => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Preparing transaction...");

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);
      const playerAccountPda = await fetchPlayerAccount();

      if (!playerAccountPda) {
        toast.error("Failed to create player account", { id: toastId });
        return;
      }

      const lamports = amount * LAMPORTS_PER_SOL / 10; // 0.1 SOL per credit

      setTransactionPending(true);
      toast.loading("Please approve the transaction...", { id: toastId });

      const signature = await program.methods
        .depositFunds(new BN(lamports))
        .accounts({
          playerAccount: playerAccountPda,
          player: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.loading("Confirming transaction...", { id: toastId });
      
      await connection.confirmTransaction(signature);
      await fetchCredits();

      toast.success(`Successfully added ${amount} credit${amount !== 1 ? 's' : ''}!`, { id: toastId });
    } catch (error) {
      console.error("Error depositing credits:", error);
      toast.error("Failed to deposit credits. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
      setTransactionPending(false);
    }
  }, [wallet, connection, fetchPlayerAccount, fetchCredits]);

  // Fetch credits whenever wallet changes
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits, wallet?.publicKey]);

  return {
    credits,
    loading,
    transactionPending,
    depositCredits,
    fetchCredits,
  };
} 