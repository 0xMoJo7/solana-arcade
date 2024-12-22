import { useState } from 'react';

interface DepositModalProps {
  onDeposit: (amount: number) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function DepositModal({ onDeposit, onClose, isLoading }: DepositModalProps) {
  const [amount, setAmount] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDeposit(amount);
  };

  return (
    <div className="deposit-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Amount (SOL)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount..."
            disabled={isLoading}
          />
        </div>

        <div className="preview">
          <span className="preview-label">You'll receive</span>
          <span className="preview-amount">{(amount * 10).toFixed(0)} credits</span>
        </div>

        <div className="button-group">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="deposit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              'Deposit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 