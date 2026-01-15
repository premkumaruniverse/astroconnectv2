import React, { useState, useEffect } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import { CalendarIcon, SunIcon, MoonIcon, StarIcon } from '@heroicons/react/24/solid';

const PanchangRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </div>
    <span className="text-gray-900 dark:text-white font-semibold">{value}</span>
  </div>
);

const PanchangPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPanchang = async () => {
      try {
        const res = await features.getDailyPanchang();
        setData(res.data);
      } catch (error) {
        console.error("Error fetching panchang:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPanchang();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Daily Panchang</h1>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <p className="text-xl text-amber-600 dark:text-amber-400 font-medium">{data.date}</p>
            </div>
            
            <PanchangRow label="Tithi" value={data.tithi} icon={MoonIcon} />
            <PanchangRow label="Nakshatra" value={data.nakshatra} icon={StarIcon} />
            <PanchangRow label="Yog" value={data.yog} icon={SunIcon} />
            <PanchangRow label="Karan" value={data.karan} icon={CalendarIcon} />
            
            {/* Additional info could go here */}
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 text-center">
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Follow the cosmic rhythm to harmonize your life."
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Failed to load Panchang data.</div>
        )}
      </div>
    </div>
  );
};

export default PanchangPage;
