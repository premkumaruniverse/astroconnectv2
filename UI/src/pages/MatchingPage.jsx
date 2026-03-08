import React, { useState } from 'react';
import { features } from '../services/api';
import { HeartIcon, UserGroupIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

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
                  onChange={(e) => setBoyDetails({ ...boyDetails, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={boyDetails.dob}
                  onChange={(e) => setBoyDetails({ ...boyDetails, dob: e.target.value })}
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
                  onChange={(e) => setGirlDetails({ ...girlDetails, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={girlDetails.dob}
                  onChange={(e) => setGirlDetails({ ...girlDetails, dob: e.target.value })}
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <div className={`p-8 text-center text-white ${result.score >= 25 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : result.score >= 18 ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
              <div className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-md mb-4">
                <HeartIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-5xl font-black mb-2">{result.score} <span className="text-2xl opacity-70">/ {result.total}</span></h2>
              <p className="text-xl font-bold uppercase tracking-widest">{result.status}</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Conclusion & Detail */}
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                  {result.conclusion || result.details}
                </p>
              </div>

              {/* Score Breakdown (Ashtakoot) */}
              {result.ashtakoot_score && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.ashtakoot_score).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl text-center border border-gray-100 dark:border-slate-600/50">
                      <span className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">{key}</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Manglik Analysis */}
                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                  <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    Manglik Analysis
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {result.manglik_analysis || "No significant Manglik Dosha detected for either individual."}
                  </p>
                </div>

                {/* Relationship Advice */}
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                  <h4 className="text-indigo-800 dark:text-indigo-400 font-bold mb-3 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Spiritual Advice
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {result.relationship_advice || "Focus on communication and mutual respect for a lasting bond."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;
