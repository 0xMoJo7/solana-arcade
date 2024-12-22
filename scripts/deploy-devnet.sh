#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment to devnet...${NC}"

# 1. Create deployment wallet if it doesn't exist
if [ ! -f scripts/deploy-keys/deploy-wallet.json ]; then
    echo "Creating new deployment wallet..."
    mkdir -p scripts/deploy-keys
    solana-keygen new --outfile scripts/deploy-keys/deploy-wallet.json --no-bip39-passphrase
fi

# 2. Get address and show faucet instructions
DEPLOY_ADDRESS=$(solana address -k scripts/deploy-keys/deploy-wallet.json)
echo -e "${GREEN}Deploy address: ${DEPLOY_ADDRESS}${NC}"

# Switch to devnet
solana config set --url devnet

# Check balance
BALANCE=$(solana balance $DEPLOY_ADDRESS --url devnet | awk '{print $1}')
echo -e "Current balance: ${BALANCE} SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${RED}Insufficient balance for deployment${NC}"
    echo -e "Please fund your wallet using the Solana Faucet:"
    echo -e "${GREEN}https://faucet.solana.com/${NC}"
    echo -e "Request 2 SOL for address: ${DEPLOY_ADDRESS}"
    echo -e "Press any key once you have funded the wallet..."
    read -n 1 -s
    
    # Verify new balance
    NEW_BALANCE=$(solana balance $DEPLOY_ADDRESS --url devnet | awk '{print $1}')
    echo -e "\nNew balance: ${NEW_BALANCE} SOL"
    
    if (( $(echo "$NEW_BALANCE < 2" | bc -l) )); then
        echo -e "${RED}Still insufficient balance. Please make sure to fund the wallet with at least 2 SOL${NC}"
        exit 1
    fi
fi

# 3. Build and get program ID
echo "Building program..."
anchor build

PROGRAM_ID=$(solana address -k target/deploy/solana_arcade-keypair.json)
echo -e "${GREEN}Program ID: ${PROGRAM_ID}${NC}"

# 4. Update program ID in files
sed -i '' "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/solana-arcade/src/lib.rs
sed -i '' "s/solana_arcade = \".*\"/solana_arcade = \"$PROGRAM_ID\"/" Anchor.toml

# 5. Update TypeScript files and generate types
echo "Generating IDL types..."
mkdir -p app/src/types/program

# Update program/index.ts to use the generated types
cat > app/src/program/index.ts << EOL
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, SolanaArcade } from "../types/program";

export const PROGRAM_ID = new PublicKey("$PROGRAM_ID");

export function getProgram(provider: AnchorProvider) {
  return new Program<SolanaArcade>(IDL, PROGRAM_ID, provider);
}
EOL

# 6. Final build and deploy
echo "Rebuilding and deploying..."
anchor build
anchor deploy

# 7. Initialize game state
echo -e "${GREEN}Initializing game state...${NC}"
anchor run init-game

echo -e "${GREEN}Deployment and initialization complete!${NC}"
echo -e "${GREEN}Program ID: ${PROGRAM_ID}${NC}" 