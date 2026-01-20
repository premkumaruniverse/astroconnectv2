import React, { useState } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import { DocumentTextIcon, StarIcon, UserIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';

const BrihatKundliPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    place: ''
  });
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await features.generateKundli(formData);
      setKundliData(res.data);
    } catch (error) {
      console.error('Error generating kundli:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Brihat Kundli</h1>
        
        {!kundliData ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />Birth Place
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />Birth Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />Birth Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Kundli'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><span className="font-medium">Name:</span> {kundliData.basic_info.name}</div>
                <div><span className="font-medium">Rashi:</span> {kundliData.basic_info.rashi}</div>
                <div><span className="font-medium">Nakshatra:</span> {kundliData.basic_info.nakshatra}</div>
                <div><span className="font-medium">Lagna:</span> {kundliData.basic_info.lagna}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Planetary Positions</h2>
              <div className="grid gap-3">
                {kundliData.planetary_positions.map((planet, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="font-medium">{planet.planet}</span>
                    <span>{planet.sign} - House {planet.house}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{planet.degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Predictions</h2>
                <div className="space-y-3">
                  <div><span className="font-medium text-blue-600">Personality:</span> {kundliData.predictions.personality}</div>
                  <div><span className="font-medium text-green-600">Career:</span> {kundliData.predictions.career}</div>
                  <div><span className="font-medium text-red-600">Health:</span> {kundliData.predictions.health}</div>
                  <div><span className="font-medium text-pink-600">Relationships:</span> {kundliData.predictions.relationships}</div>
                  <div><span className="font-medium text-yellow-600">Finances:</span> {kundliData.predictions.finances}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lucky Elements</h2>
                <div className="space-y-2">
                  <div><span className="font-medium">Numbers:</span> {kundliData.lucky_elements.numbers.join(', ')}</div>
                  <div><span className="font-medium">Colors:</span> {kundliData.lucky_elements.colors.join(', ')}</div>
                  <div><span className="font-medium">Days:</span> {kundliData.lucky_elements.days.join(', ')}</div>
                  <div><span className="font-medium">Direction:</span> {kundliData.lucky_elements.direction}</div>
                  <div><span className="font-medium">Gemstone:</span> {kundliData.lucky_elements.gemstone}</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Remedies</h2>
              <ul className="list-disc list-inside space-y-2">
                {kundliData.remedies.map((remedy, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{remedy}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setKundliData(null)}
              className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Generate New Kundli
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrihatKundliPage;