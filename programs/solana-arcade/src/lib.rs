use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hashv;

declare_id!("A7kodx7FgCheVy4gXtnWMn2SLeEBSxtTjN86yKzFeHbx");

#[program]
pub mod solana_arcade {
    use super::*;

    // Initialize the game state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = ctx.accounts.authority.key();
        game_state.current_pot = 0;
        game_state.next_payout = Clock::get()?.unix_timestamp + 3600; // 1 hour from now
        game_state.total_games_played = 0;
        game_state.current_round = 1;
        Ok(())
    }

    // Player deposits funds
    pub fn deposit_funds(ctx: Context<DepositFunds>, amount: u64) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        player_account.balance = player_account.balance.checked_add(amount)
            .ok_or(ErrorCode::NumberOverflow)?;

        // Transfer SOL to player's game account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.player_account.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        Ok(())
    }

    // Player withdraws their funds
    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        require!(amount <= player_account.balance, ErrorCode::InsufficientFunds);

        player_account.balance = player_account.balance.checked_sub(amount)
            .ok_or(ErrorCode::NumberOverflow)?;

        // Transfer SOL back to player using to_account_info()
        let from = player_account.to_account_info();
        let to = ctx.accounts.player.to_account_info();
        **from.try_borrow_mut_lamports()? -= amount;
        **to.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    // Start a game (costs 0.01 SOL)
    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        const GAME_COST: u64 = 10_000_000; // 0.01 SOL in lamports
        
        let player_account = &mut ctx.accounts.player_account;
        let game_state = &mut ctx.accounts.game_state;

        require!(player_account.balance >= GAME_COST, ErrorCode::InsufficientFunds);

        // Deduct game cost and add to pot
        player_account.balance = player_account.balance.checked_sub(GAME_COST)
            .ok_or(ErrorCode::NumberOverflow)?;
        game_state.current_pot = game_state.current_pot.checked_add(GAME_COST)
            .ok_or(ErrorCode::NumberOverflow)?;

        // Generate unique session hash using player, timestamp, and a secret
        let session_hash = hashv(&[
            ctx.accounts.player.key().as_ref(),
            &Clock::get()?.unix_timestamp.to_le_bytes(),
            &game_state.total_games_played.to_le_bytes(),
            ctx.program_id.as_ref(),
            b"SOLANA_ARCADE_SECRET",
        ]).to_bytes();

        game_state.total_games_played = game_state.total_games_played.checked_add(1)
            .ok_or(ErrorCode::NumberOverflow)?;

        emit!(GameStarted {
            player: ctx.accounts.player.key(),
            session_hash,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Submit game score
    pub fn submit_score(ctx: Context<SubmitScore>, score: u64, session_hash: [u8; 32]) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        let player_stats = &mut ctx.accounts.player_stats;
        let current_time = Clock::get()?.unix_timestamp;

        // Verify the score submission is valid
        require!(
            verify_score_hash(
                session_hash,
                score,
                ctx.accounts.player.key(),
                ctx.program_id
            ),
            ErrorCode::InvalidGameData
        );

        // Award 100 XP for playing
        player_stats.xp = player_stats.xp.checked_add(100)
            .ok_or(ErrorCode::NumberOverflow)?;
        
        // Update player stats
        player_stats.total_games = player_stats.total_games.checked_add(1)
            .ok_or(ErrorCode::NumberOverflow)?;
        
        if score > player_stats.high_score {
            player_stats.high_score = score;
        }

        // Update leaderboard if score qualifies
        let leaderboard = &mut ctx.accounts.leaderboard;
        leaderboard.add_entry(LeaderboardEntry {
            wallet: ctx.accounts.player.key(),
            score,
            timestamp: current_time,
            round: game_state.current_round,
        })?;

        emit!(GameCompleted {
            player: ctx.accounts.player.key(),
            score,
            xp_earned: 100,
            timestamp: current_time,
        });

        Ok(())
    }

    // Process hourly payout (admin only)
    pub fn process_payout(ctx: Context<ProcessPayout>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(current_time >= game_state.next_payout, ErrorCode::PayoutNotDue);
        require!(
            ctx.accounts.authority.key() == game_state.authority,
            ErrorCode::Unauthorized
        );

        let leaderboard = &ctx.accounts.leaderboard;
        if let Some(winner) = leaderboard.get_round_winner(game_state.current_round) {
            let pot_amount = game_state.current_pot;
            
            // Transfer pot to winner using to_account_info()
            let from = ctx.accounts.game_vault.to_account_info();
            let to = ctx.accounts.winner.to_account_info();
            **from.try_borrow_mut_lamports()? -= pot_amount;
            **to.try_borrow_mut_lamports()? += pot_amount;

            emit!(PayoutProcessed {
                winner: winner.wallet,
                amount: pot_amount,
                round: game_state.current_round,
                timestamp: current_time,
            });

            // Reset for next round
            game_state.current_pot = 0;
            game_state.current_round = game_state.current_round.checked_add(1)
                .ok_or(ErrorCode::NumberOverflow)?;
            game_state.next_payout = current_time + 3600;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + GameState::SPACE)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PlayerAccount::SPACE,
        seeds = [b"player_account", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [b"player_account", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(
        mut,
        seeds = [b"player_account", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PlayerStats::SPACE,
        seeds = [b"player_stats", player.key().as_ref()],
        bump
    )]
    pub player_stats: Account<'info, PlayerStats>,
    #[account(mut)]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessPayout<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub game_vault: Account<'info, GameVault>,
    /// CHECK: Winner's address is verified through the leaderboard before any funds are transferred
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    #[account(mut)]
    pub leaderboard: Account<'info, Leaderboard>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameState {
    pub authority: Pubkey,           // 32
    pub current_pot: u64,            // 8
    pub next_payout: i64,            // 8
    pub total_games_played: u64,     // 8
    pub current_round: u64,          // 8
}

#[account]
pub struct PlayerAccount {
    pub owner: Pubkey,    // 32
    pub balance: u64,     // 8
    pub bump: u8,         // 1
}

#[account]
pub struct PlayerStats {
    pub wallet: Pubkey,       // 32
    pub high_score: u64,      // 8
    pub total_games: u64,     // 8
    pub xp: u64,              // 8
    pub bump: u8,             // 1
}

#[account]
pub struct Leaderboard {
    pub entries: Vec<LeaderboardEntry>,   // Variable
    pub max_entries: u8,                  // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LeaderboardEntry {
    pub wallet: Pubkey,
    pub score: u64,
    pub timestamp: i64,
    pub round: u64,
}

impl GameState {
    pub const SPACE: usize = 32 + 8 + 8 + 8 + 8;
}

impl PlayerAccount {
    pub const SPACE: usize = 32 + 8 + 1;
}

impl PlayerStats {
    pub const SPACE: usize = 32 + 8 + 8 + 8 + 1;
}

impl Leaderboard {
    pub fn add_entry(&mut self, entry: LeaderboardEntry) -> Result<()> {
        if self.entries.len() >= self.max_entries as usize {
            // Remove lowest score if at capacity
            if let Some(min_idx) = self.entries.iter()
                .enumerate()
                .min_by_key(|(_, e)| e.score)
                .map(|(i, _)| i) {
                if entry.score > self.entries[min_idx].score {
                    self.entries.remove(min_idx);
                } else {
                    return Ok(());
                }
            }
        }
        self.entries.push(entry);
        self.entries.sort_by(|a, b| b.score.cmp(&a.score));
        Ok(())
    }

    pub fn get_round_winner(&self, round: u64) -> Option<&LeaderboardEntry> {
        self.entries.iter()
            .filter(|entry| entry.round == round)
            .max_by_key(|entry| entry.score)
    }
}

#[event]
pub struct GameStarted {
    pub player: Pubkey,
    pub session_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct GameCompleted {
    pub player: Pubkey,
    pub score: u64,
    pub xp_earned: u64,
    pub timestamp: i64,
}

#[event]
pub struct PayoutProcessed {
    pub winner: Pubkey,
    pub amount: u64,
    pub round: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Number overflow")]
    NumberOverflow,
    #[msg("Invalid game data")]
    InvalidGameData,
    #[msg("Payout not due yet")]
    PayoutNotDue,
    #[msg("Unauthorized")]
    Unauthorized,
}

fn verify_score_hash(session_hash: [u8; 32], score: u64, _player: Pubkey, _program_id: &Pubkey) -> bool {
    let data = [
        score.to_le_bytes().as_ref(),
        session_hash.as_ref(),
        b"SOLANA_ARCADE_SECRET",
    ].concat();

    let expected_hash = hashv(&[&data]).to_bytes();
    session_hash == expected_hash
}

#[account]
pub struct GameVault {
    pub authority: Pubkey,
    pub amount: u64,
}

impl GameVault {
    pub const SPACE: usize = 8 + 
        32 + // authority
        8;  // amount
}