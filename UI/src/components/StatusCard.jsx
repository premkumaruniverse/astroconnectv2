import React from 'react';

const StatusCard = ({ icon, title, value, change, period }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-shrink-0">
          <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-full">
            {React.cloneElement(icon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" })}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-baseline">
        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
            isPositive 
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {period}
        </p>
      </div>
    </div>
  );
};

export default StatusCard;
