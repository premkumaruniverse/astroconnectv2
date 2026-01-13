import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const VerificationPending = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1e293b] p-10 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
            <ClockIcon className="h-10 w-10 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Verification Pending
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Thank you for applying to join AstroVeda Connect. Your application is currently under review by our administration team.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">What happens next?</h3>
            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>Our team will review your credentials</li>
              <li>You may receive a call for a brief interview</li>
              <li>Verification typically takes 24-48 hours</li>
              <li>You will receive an email once approved</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VerificationPending;
