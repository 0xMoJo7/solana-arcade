import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaArcade } from "../target/types/solana_arcade";
import { expect } from 'chai';

describe("solana-arcade", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaArcade as Program<SolanaArcade>;

  it("Initializes the game state", async () => {
    const gameState = anchor.web3.Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        gameState: gameState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gameState])
      .rpc();

    const state = await program.account.gameState.fetch(gameState.publicKey);
    expect(state.authority.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(state.currentPot.toNumber()).to.equal(0);
  });
});
