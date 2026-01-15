import React, { useState } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import { UserIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        {...props}
      />
    </div>
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const KundliPage = () => {
  const [step, setStep] = useState('input'); // input, loading, result
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    dob: '',
    tob: '',
    pob: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('loading');
    setError(null);
    try {
      const res = await features.generateKundli(formData);
      setResult(res.data);
      setStep('result');
    } catch (error) {
      console.error("Error generating kundli:", error);
      setError("Failed to generate Kundli. Please check your connection and try again.");
      setStep('input');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Janma Kundli</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 'input' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your name"
                icon={UserIcon}
                required
                value={formData.name}
                onChange={handleChange}
              />
              
              <SelectField
                label="Gender"
                name="gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                value={formData.gender}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  icon={CalendarIcon}
                  required
                  value={formData.dob}
                  onChange={handleChange}
                />
                <InputField
                  label="Time of Birth"
                  name="tob"
                  type="time"
                  icon={ClockIcon}
                  required
                  value={formData.tob}
                  onChange={handleChange}
                />
              </div>

              <InputField
                label="Place of Birth"
                name="pob"
                type="text"
                placeholder="City, State, Country"
                icon={MapPinIcon}
                required
                value={formData.pob}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                Generate Kundli
              </button>
            </form>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Analyzing planetary positions...</p>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-6">
            {/* Chart Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lagna Chart</h2>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl inline-block">
                <img src={result.chart_url} alt="Kundli Chart" className="max-w-full h-auto rounded-lg" />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Planetary Details</h3>
                <ul className="space-y-3">
                  {Object.entries(result.details).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Dosha Analysis</h3>
                 <div className="flex flex-wrap gap-2">
                   {result.doshas.map((dosha, idx) => (
                     <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                       {dosha}
                     </span>
                   ))}
                   {result.doshas.length === 0 && <span className="text-green-500">No major doshas found.</span>}
                 </div>
              </div>
            </div>

            <button
              onClick={() => setStep('input')}
              className="w-full py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Check Another Kundli
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KundliPage;
