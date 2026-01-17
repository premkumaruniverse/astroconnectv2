import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { features } from '../services/api';

const titleMap = {
  matching: 'Match Making',
  career: 'Career Insights',
  'mental-health': 'Mental Health',
  today: 'Today\'s Insight',
  love: 'Love Insights',
  education: 'Education Insights',
  reports: 'Astro Reports',
  community: 'Community',
};

const FeatureExplorePage = () => {
  const { featureId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insight, setInsight] = useState(null);
  const [reports, setReports] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [boyName, setBoyName] = useState('');
  const [girlName, setGirlName] = useState('');

  const normalizedId = featureId || '';
  const title = titleMap[normalizedId] || 'Explore Feature';

  useEffect(() => {
    setError('');
    setInsight(null);
    setReports([]);
    setMatchResult(null);
    if (!normalizedId) {
      return;
    }
    if (normalizedId === 'reports') {
      loadReports();
      return;
    }
    if (
      normalizedId === 'career' ||
      normalizedId === 'mental-health' ||
      normalizedId === 'today' ||
      normalizedId === 'love' ||
      normalizedId === 'education'
    ) {
      loadInsight(normalizedId);
    }
  }, [normalizedId]);

  const loadInsight = async (category) => {
    try {
      setLoading(true);
      const res = await features.getInsight(category);
      setInsight(res.data);
    } catch (e) {
      setError('Failed to load insight');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await features.getAvailableReports();
      setReports(res.data || []);
    } catch (e) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMatchResult(null);
    if (!boyName || !girlName) {
      setError('Please enter both names');
      return;
    }
    try {
      setLoading(true);
      const res = await features.checkMatching(
        { name: boyName },
        { name: girlName }
      );
      setMatchResult(res.data);
    } catch (e) {
      setError('Failed to calculate matching score');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (normalizedId === 'matching') {
      return (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Compatibility Check
          </h2>
          <form onSubmit={handleMatchSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Boy Name
              </label>
              <input
                type="text"
                value={boyName}
                onChange={(e) => setBoyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Girl Name
              </label>
              <input
                type="text"
                value={girlName}
                onChange={(e) => setGirlName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Compatibility'}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-500 break-words">{error}</p>
          )}
          {matchResult && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm text-gray-800 dark:text-amber-100">
              <p className="font-semibold mb-1">
                Score: {matchResult.score}/{matchResult.total}
              </p>
              <p className="mb-1">{matchResult.status}</p>
              <p className="text-xs text-gray-600 dark:text-amber-200">
                {matchResult.details}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (normalizedId === 'reports') {
      return (
        <div className="max-w-2xl mx-auto">
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading reports...
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 mb-2 break-words">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {report.description}
                </p>
              </div>
            ))}
          </div>
          {!loading && reports.length === 0 && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No reports available.
            </p>
          )}
        </div>
      );
    }

    if (normalizedId === 'community') {
      return (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Astro Community
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Join live sessions, Q&A, and discussions with astrologers and
              other users. Community features are being rolled out gradually.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400">
            More interactive features will be added here soon.
          </div>
        </div>
      );
    }

    if (normalizedId) {
      return (
        <div className="max-w-xl mx-auto">
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading insight...
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 mb-2 break-words">{error}</p>
          )}
          {insight && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {insight.insight}
              </p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        {renderContent()}
      </main>
    </div>
  );
};

export default FeatureExplorePage;

