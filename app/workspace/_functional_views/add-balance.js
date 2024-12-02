'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActiveButton } from '@/app/_components/global_components';
import { formatNumber, parseFormattedNumber } from '@/app/_utils/number-formatting';

const PRESET_DAYS = [1, 5, 10];

function CurrentBalanceSection({ currentBalance, dailyOperationCost, calculateRemainingDays }) {
  return (
    <div className="mb-8">
      <p className="text-gray-300 mb-1">Current Balance</p>
      <p className="text-3xl font-bold">£{formatNumber(currentBalance)}</p>
      <p className="text-sm text-gray-300 mt-2">Daily cost: £{formatNumber(dailyOperationCost)}</p>
      <p className="text-sm text-gray-300">Days left: {calculateRemainingDays()}</p>
    </div>
  );
}

function AmountInputSection({ amount, handleAmountChange, handleDaySelection, calculateDays }) {
  return (
    <div className="mb-8">
      <label className="block text-sm text-gray-300 mb-2">
        Amount to add
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-bold">£</span>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          className="w-full pl-8 pr-4 py-3 border border-[var(--gray)] rounded-lg 
                    focus:outline-none focus:border-[var(--primary-blue)]
                    text-foreground font-bold text-lg bg-white/5"
          placeholder="Enter amount"
          style={{ 
            WebkitTextFillColor: 'var(--foreground)',
            opacity: 1
          }}
        />
      </div>

      <div className="flex gap-3 mt-4 mb-2">
        {PRESET_DAYS.map(days => (
          <ActiveButton
            key={days}
            onClick={() => handleDaySelection(days)}
          >
            {days} {days === 1 ? 'day' : 'days'}
          </ActiveButton>
        ))}
      </div>

      <p className={`
        text-sm transition-colors duration-200
        ${amount ? 'text-gray-300' : 'text-background'}
      `}>
        This will fund {calculateDays()} days of operation
      </p>
    </div>
  );
}

export function AddBalance({ currentBalance, onBalanceUpdate, onClose, dailyOperationCost }) {
  const [amount, setAmount] = useState('');
  const [selectedDays, setSelectedDays] = useState(null);

  const handleDaySelection = (days) => {
    const newAmount = days * dailyOperationCost;
    setAmount(formatNumber(newAmount));
    setSelectedDays(days);
  };

  const handleAmountChange = (e) => {
    const rawValue = parseFormattedNumber(e.target.value);
    const value = rawValue.replace(/[^0-9]/g, '');
    setAmount(formatNumber(value));
    setSelectedDays(null);
  };

  const calculateDays = () => {
    if (!amount) return 0;
    const rawAmount = parseFloat(parseFormattedNumber(amount));
    return Math.floor(rawAmount / dailyOperationCost);
  };

  const calculateRemainingDays = () => {
    return Math.floor(parseFloat(currentBalance) / dailyOperationCost);
  };

  const handleProceedToPayment = () => {
    const rawAmount = parseFormattedNumber(amount);
    const newBalance = (parseFloat(currentBalance) + parseFloat(rawAmount)).toString();
    onBalanceUpdate(newBalance);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 border border-[var(--gray)] rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="text-gray-300 hover:text-foreground transform scale-125">
            <ArrowLeft size={31.2} />
          </button>
          <h2 className="text-2xl font-bold">Add Balance</h2>
        </div>

        <CurrentBalanceSection 
          currentBalance={currentBalance}
          dailyOperationCost={dailyOperationCost}
          calculateRemainingDays={calculateRemainingDays}
        />

        <AmountInputSection 
          amount={amount}
          handleAmountChange={handleAmountChange}
          handleDaySelection={handleDaySelection}
          calculateDays={calculateDays}
        />

        {/* Action Button */}
        <button
          disabled={!amount}
          onClick={handleProceedToPayment}
          className={`
            w-full py-3 px-4 rounded-lg font-bold transition-all
            ${amount 
              ? 'bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
