import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, SolanaArcade } from "../types/program";

export const PROGRAM_ID = new PublicKey("A7kodx7FgCheVy4gXtnWMn2SLeEBSxtTjN86yKzFeHbx");

export function getProgram(provider: AnchorProvider) {
  return new Program<SolanaArcade>(IDL, PROGRAM_ID, provider);
}
