import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaArcade } from "../target/types/solana_arcade";

module.exports = async function (provider: anchor.Provider) {
  // Create game state account
  const program = anchor.workspace.SolanaArcade as Program<SolanaArcade>;
  const gameState = anchor.web3.Keypair.generate();
  
  try {
    await program.methods
      .initialize()
      .accounts({
        gameState: gameState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gameState])
      .rpc();
      
    console.log("Game state initialized!");
    console.log("Game state address:", gameState.publicKey.toString());
  } catch (err) {
    console.error("Error initializing game state:", err);
    process.exit(1);
  }
}; 