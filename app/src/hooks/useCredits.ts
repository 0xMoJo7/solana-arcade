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

  // Get player's credit balance
  const fetchCredits = useCallback(async () => {
    if (!wallet) return;

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = getProgram(provider);

      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_account"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      try {
        const account = await program.account.playerAccount.fetch(playerAccountPda);
        setCredits(account.balance.toNumber() / LAMPORTS_PER_SOL / 10);
      } catch (e) {
        setCredits(0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
      toast.error("Failed to fetch credits balance");
    }
  }, [wallet, connection]);

  // Deposit funds for credits
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

      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_account"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const lamports = amount * LAMPORTS_PER_SOL / 10;

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
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      // Update credits balance
      await fetchCredits();

      toast.success(`Successfully added ${amount} credit${amount !== 1 ? 's' : ''}!`, { id: toastId });
    } catch (error) {
      console.error("Error depositing credits:", error);
      toast.error("Failed to deposit credits. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
      setTransactionPending(false);
    }
  }, [wallet, connection, fetchCredits]);

  // Fetch credits on wallet change
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