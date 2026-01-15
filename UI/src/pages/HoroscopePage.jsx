import React, { useState, useEffect } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';

const RASHI_ICONS = {
  "Aries": "♈",
  "Taurus": "♉",
  "Gemini": "♊",
  "Cancer": "♋",
  "Leo": "♌",
  "Virgo": "♍",
  "Libra": "♎",
  "Scorpio": "♏",
  "Sagittarius": "♐",
  "Capricorn": "♑",
  "Aquarius": "♒",
  "Pisces": "♓"
};

const HoroscopePage = () => {
  const [horoscopes, setHoroscopes] = useState([]);
  const [selectedSign, setSelectedSign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoroscope = async () => {
      try {
        const res = await features.getDailyHoroscope();
        setHoroscopes(res.data);
        if (res.data.length > 0) {
          setSelectedSign(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching horoscope:", error);
        setError("Unable to load horoscope data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscope();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Daily Horoscope</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
             {error}
          </div>
        ) : (
          <>
            {/* Horizontal Scrollable List */}
            <div className="mb-8">
              <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide px-2">
                {horoscopes.map((item) => (
                  <button
                    key={item.sign}
                    onClick={() => setSelectedSign(item)}
                    className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl transition-all border ${
                      selectedSign?.sign === item.sign
                        ? 'bg-amber-500 text-white border-amber-600 scale-110 shadow-lg'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-slate-700'
                    }`}
                  >
                  <span className="text-4xl mb-2 animate-spin-slow">{RASHI_ICONS[item.sign] || "⭐"}</span>
                    <span className="text-sm font-medium whitespace-nowrap">{item.sign}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Sign Details */}
            {selectedSign && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-4xl text-amber-600 dark:text-amber-400">
                    {RASHI_ICONS[selectedSign.sign]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSign.sign}</h2>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Daily Prediction</p>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {selectedSign.prediction}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HoroscopePage;
