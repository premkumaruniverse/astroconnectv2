import React, { useState, useEffect } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import { CalendarIcon, SunIcon, MoonIcon, StarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPanchang = async (date = null) => {
    setLoading(true);
    try {
      console.log('Fetching panchang for date:', date);
      const res = await features.getDailyPanchang(date);
      console.log('Panchang response:', res);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching panchang:", error);
      // Set fallback data if API fails
      setData({
        date: date || new Date().toISOString().split('T')[0],
        tithi: "Shukla Paksha Dashami",
        nakshatra: "Rohini",
        yog: "Indra",
        karan: "Taitila",
        sunrise: "06:30",
        sunset: "18:45",
        moonrise: "20:15",
        moonset: "08:30",
        auspicious_time: "Morning 10:00-12:00 is favorable for new ventures",
        inauspicious_time: "Rahu Kaal: 16:30-18:00",
        description: "A day of spiritual growth and positive energy"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanchang();
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchPanchang(newDate);
  };

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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xl text-amber-600 dark:text-amber-400 font-medium mt-2">{data.date}</p>
            </div>
            
            <div className="grid gap-4">
              <PanchangRow label="Tithi" value={data.tithi} icon={MoonIcon} />
              <PanchangRow label="Nakshatra" value={data.nakshatra} icon={StarIcon} />
              <PanchangRow label="Yog" value={data.yog} icon={SunIcon} />
              <PanchangRow label="Karan" value={data.karan} icon={CalendarIcon} />
            </div>

            {(data.sunrise || data.sunset || data.moonrise || data.moonset) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-amber-500" />
                  Celestial Timings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {data.sunrise && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sunrise</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">{data.sunrise}</p>
                    </div>
                  )}
                  {data.sunset && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sunset</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">{data.sunset}</p>
                    </div>
                  )}
                  {data.moonrise && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Moonrise</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{data.moonrise}</p>
                    </div>
                  )}
                  {data.moonset && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Moonset</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{data.moonset}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {data.auspicious_time && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Auspicious Time</h4>
                  <p className="text-green-700 dark:text-green-300">{data.auspicious_time}</p>
                </div>
              )}
              {data.inauspicious_time && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Inauspicious Time
                  </h4>
                  <p className="text-red-700 dark:text-red-300">{data.inauspicious_time}</p>
                </div>
              )}
            </div>
            
            {data.description && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 italic">{data.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">Failed to load Panchang data.</div>
        )}
      </div>
    </div>
  );
};

export default PanchangPage;
