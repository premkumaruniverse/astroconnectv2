import React, { useState, useEffect } from 'react';
import { CreditCardIcon, BanknotesIcon, ClockIcon, CurrencyRupeeIcon, CheckCircleIcon, XCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import StatusCard from '../components/StatusCard';
import { wallet } from '../services/api';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await wallet.getBalance();
      setBalance(response.data.balance);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (amount && parseFloat(amount) > 0) {
      try {
        await wallet.addFunds(parseFloat(amount));
        await fetchWalletData();
        setShowAddMoney(false);
        setAmount('');
      } catch (err) {
        console.error("Failed to add funds", err);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="py-8 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            My Wallet
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Manage your wallet balance and transaction history
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Wallet Balance Card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  Available Balance
                </h2>
                <CurrencyRupeeIcon className="h-6 md:h-8 w-6 md:w-8 text-green-500" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-6">
                ₹{balance}
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="w-full bg-yellow-500 text-primary py-2 md:py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm md:text-base"
              >
                Add Money
              </button>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4 md:space-y-6">
              <StatusCard 
                icon={<ArrowTrendingDownIcon />}
                title="Total Spent"
                value="₹0"
                change={0}
                period="vs last month"
              />
              <StatusCard 
                icon={<ArrowTrendingUpIcon />}
                title="Total Added"
                value={`₹${transactions.filter(t => t.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0)}`}
                change={100}
                period="vs last month"
              />
            </div>
          </div>

          {/* Transaction History */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No transactions yet</div>
                ) : (
                  transactions.slice().reverse().map((transaction, index) => {
                    const { date, time } = formatDate(transaction.timestamp);
                    return (
                      <div key={index} className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 md:mr-4 ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : 'bg-red-100 dark:bg-red-900'
                            }`}>
                              {transaction.type === 'credit' ? (
                                <CheckCircleIcon className="h-5 md:h-6 w-5 md:w-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircleIcon className="h-5 md:h-6 w-5 md:w-6 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
                                {transaction.description}
                              </p>
                              <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <ClockIcon className="h-3 md:h-4 w-3 md:w-4 mr-1 flex-shrink-0" />
                                <span>{date} at {time}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`text-base md:text-lg font-semibold ${
                            transaction.type === 'credit' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Add Money to Wallet
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[100, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="px-3 md:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMoney}
                  className="px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
