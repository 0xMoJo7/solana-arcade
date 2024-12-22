import { useCallback, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';

export function useGame() {
  const [gameSeed, setGameSeed] = useState<Buffer | null>(null);
  
  const generateScoreHash = useCallback((score: number) => {
    if (!gameSeed) return null;
    
    const data = Buffer.concat([
      Buffer.from(new BigInt64Array([BigInt(score)]).buffer),
      gameSeed,
      Buffer.from("SOLANA_ARCADE_SECRET"),
    ]);

    return createHash('sha256').update(data).digest();
  }, [gameSeed]);

  return {
    generateScoreHash,
    setGameSeed,
  };
} 