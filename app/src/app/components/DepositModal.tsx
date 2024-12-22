import { useState } from 'react';

interface DepositModalProps {
  onDeposit: (amount: number) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function DepositModal({ onDeposit, onClose, isLoading }: DepositModalProps) {
  const [amount, setAmount] = useState(1);
  console.log('DepositModal rendered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting deposit:', amount);
    await onDeposit(amount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose} style={{ zIndex: 9999 }} />
      <div className="relative bg-[#1A1A1A] border-2 border-[#6F4FF0] rounded-xl p-8 text-center" style={{ zIndex: 10000 }}>
        <h2 className="text-3xl font-bold text-[#6F4FF0] mb-6 font-orbitron">
          Add Credits
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">Amount (SOL)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#2D2D2D] border border-[#6F4FF0] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6F4FF0]"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              {(amount * 10).toFixed(0)} credits ({amount} SOL)
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 border border-[#6F4FF0] text-[#6F4FF0] rounded-lg hover:bg-[#6F4FF0] hover:bg-opacity-10 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-[#6F4FF0] text-white rounded-lg hover:bg-opacity-80 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 