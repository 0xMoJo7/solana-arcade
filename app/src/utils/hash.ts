import { PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';

export function generateGameHash(
  player: PublicKey,
  timestamp: number,
  gamesPlayed: number,
  programId: PublicKey
): Buffer {
  const data = Buffer.concat([
    player.toBuffer(),
    Buffer.from(new BigInt64Array([BigInt(timestamp)]).buffer),
    Buffer.from(new BigInt64Array([BigInt(gamesPlayed)]).buffer),
    programId.toBuffer(),
    Buffer.from("SOLANA_ARCADE_SECRET"),
  ]);

  return createHash('sha256').update(data).digest();
}

export function generateScoreHash(
  player: PublicKey,
  score: number,
  sessionHash: Buffer,
  programId: PublicKey
): Buffer {
  const data = Buffer.concat([
    player.toBuffer(),
    Buffer.from(new BigInt64Array([BigInt(score)]).buffer),
    sessionHash,
    programId.toBuffer(),
    Buffer.from("SOLANA_ARCADE_SECRET"),
  ]);

  return createHash('sha256').update(data).digest();
} 