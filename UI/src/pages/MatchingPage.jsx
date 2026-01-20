import React, { useState } from 'react';
import { features } from '../services/api';
import { HeartIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/solid';

const MatchingPage = () => {
  const [boyDetails, setBoyDetails] = useState({ name: '', dob: '' });
  const [girlDetails, setGirlDetails] = useState({ name: '', dob: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    try {
      setLoading(true);
      // Simulate API call delay if needed, or just call real API
      const response = await features.checkMatching(boyDetails, girlDetails);
      setResult(response.data);
    } catch (error) {
      console.error("Matching failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <HeartIcon className="h-8 w-8 text-red-500" />
            Kundli Matching
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Check compatibility between partners for a happy married life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Boy's Details */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
              Boy's Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={boyDetails.name}
                  onChange={(e) => setBoyDetails({...boyDetails, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={boyDetails.dob}
                  onChange={(e) => setBoyDetails({...boyDetails, dob: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Girl's Details */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 text-pink-500 mr-2" />
              Girl's Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={girlDetails.name}
                  onChange={(e) => setGirlDetails({...girlDetails, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={girlDetails.dob}
                  onChange={(e) => setGirlDetails({...girlDetails, dob: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <button
            onClick={handleMatch}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Check Compatibility'}
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white text-center">
              <h2 className="text-3xl font-bold mb-2">{result.score} / {result.total}</h2>
              <p className="text-lg font-medium opacity-90">{result.status}</p>
            </div>
            <div className="p-8 text-center">
              <SparklesIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {result.details}
              </p>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  This match is considered auspicious for marriage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;
