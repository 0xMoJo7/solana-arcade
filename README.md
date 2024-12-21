# Solana Arcade 🎮

A decentralized Tetris game on Solana where players compete for hourly prizes. Play games, earn XP, and win SOL!

## 🎯 Game Mechanics

- Each game costs 0.01 SOL to play
- All entry fees go into an hourly prize pool
- Highest score each hour wins the entire pot
- Earn 100 XP for each game played
- Global leaderboard tracks top scores

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Blockchain**: Solana (1.14.17), Anchor Framework (0.27.0)
- **Game Engine**: React Tetris

## 📋 Prerequisites

- Node.js 18+
- Rust 1.68.0
- Solana CLI Tools
- Anchor 0.27.0
- pnpm

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-arcade.git
cd solana-arcade
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the Solana program:
```bash
anchor build
```

4. Start the development server:
```bash
pnpm dev
```

## 📁 Project Structure

```
solana-arcade/
├── app/                    # Next.js frontend
│   └── src/
│       └── app/
│           ├── components/ # React components
│           └── ...
├── programs/              # Solana programs
│   └── solana-arcade/     # Main game program
└── tests/                 # Program tests
```

## 🎮 Smart Contract Features

- Game credits management (deposit/withdraw)
- Secure score verification
- Automated hourly payouts
- XP system and tracking
- Global leaderboard
- Player statistics

## 🔗 Useful Links

- [Solana Docs](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [React Tetris](https://github.com/brandly/react-tetris)

## 📄 License

[MIT License](LICENSE)
