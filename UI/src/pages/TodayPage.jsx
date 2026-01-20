import React, { useState, useEffect } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import { StarIcon, SunIcon, HeartIcon, BriefcaseIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const TodayPage = () => {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayInsights = async () => {
      try {
        const res = await features.getTodayInsights();
        setTodayData(res.data);
      } catch (error) {
        console.error('Error fetching today insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Today's Cosmic Guidance</h1>
        
        {todayData && (
          <div className="space-y-6">
            {/* Cosmic Energy */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <SunIcon className="h-6 w-6" />
                Cosmic Energy: {todayData.cosmic_energy.level}
              </h2>
              <p className="mb-2">{todayData.cosmic_energy.description}</p>
              <div className="flex gap-4 text-sm">
                <span>Dominant: {todayData.cosmic_energy.dominant_planet}</span>
                <span>Energy Color: {todayData.cosmic_energy.energy_color}</span>
              </div>
            </div>

            {/* Daily Predictions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-pink-600 mb-2 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />Love & Relationships
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{todayData.daily_prediction.love}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-green-600 mb-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />Career & Work
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{todayData.daily_prediction.career}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />Health & Wellness
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{todayData.daily_prediction.health}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-yellow-600 mb-2 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5" />Finance & Money
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{todayData.daily_prediction.finance}</p>
              </div>
            </div>

            {/* Lucky Elements */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Lucky Elements</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Number</p>
                  <p className="font-bold text-2xl text-amber-600">{todayData.lucky_elements.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                  <p className="font-bold text-amber-600">{todayData.lucky_elements.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Direction</p>
                  <p className="font-bold text-amber-600">{todayData.lucky_elements.direction}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-bold text-amber-600">{todayData.lucky_elements.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gemstone</p>
                  <p className="font-bold text-amber-600">{todayData.lucky_elements.gemstone}</p>
                </div>
              </div>
            </div>

            {/* Do & Avoid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-6">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-4">✓ Do Today</h3>
                <ul className="space-y-2">
                  {todayData.do_today.map((item, idx) => (
                    <li key={idx} className="text-green-700 dark:text-green-300">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-6">
                <h3 className="font-bold text-red-800 dark:text-red-400 mb-4">✗ Avoid Today</h3>
                <ul className="space-y-2">
                  {todayData.avoid_today.map((item, idx) => (
                    <li key={idx} className="text-red-700 dark:text-red-300">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mantra & Advice */}
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-xl p-6 text-center">
              <h3 className="font-bold text-purple-800 dark:text-purple-400 mb-3">Today's Mantra</h3>
              <p className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4">{todayData.mantra_of_day}</p>
              <p className="text-purple-600 dark:text-purple-400 italic">{todayData.spiritual_advice}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayPage;