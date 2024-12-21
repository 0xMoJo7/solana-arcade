# Solana Arcade 🎮

An open-source arcade platform built on Solana where players can compete in classic games for rewards.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and pnpm (`npm install -g pnpm`)
- Rust and Cargo
- Solana CLI tools
- Anchor Framework

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-arcade.git
cd solana-arcade
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your environment:
```bash
cp app/.env.example app/.env
```

4. Start the development server:
```bash
pnpm dev
```

## 🏗️ Project Structure

```
solana-arcade/
├── app/                  # Next.js frontend
│   ├── src/             # Source code
│   └── public/          # Static files
├── program/             # Solana program
└── tests/              # Integration tests
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/)
- [Solana](https://solana.com/)
- [Anchor](https://www.anchor-lang.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
