import React, { useState, useEffect } from 'react';
import { features } from '../services/api';
import Navbar from '../components/Navbar';
import {
  DocumentTextIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ClockIcon as HistoryIcon
} from '@heroicons/react/24/solid';

const BrihatKundliPage = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'saved'
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    place: ''
  });
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await features.getKundliHistory();
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await features.searchKundli(query);
        setHistory(res.data);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else if (query.length === 0) {
      fetchHistory();
    }
  };

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

  const handleSelectSaved = (savedKundli) => {
    setKundliData(savedKundli.report_data);
    setActiveTab('new');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">Brihat Kundli</h1>

        {/* Tabs */}
        {!kundliData && (
          <div className="flex justify-center mb-8 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm w-fit mx-auto border border-gray-100 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-purple-500'}`}
            >
              New Chart
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-purple-500'}`}
            >
              Saved Charts
            </button>
          </div>
        )}

        {kundliData ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Info */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black uppercase mb-4">{kundliData.basic_info.name}'s Horoscope</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <span className="block text-[10px] uppercase font-bold opacity-60 mb-1">Rashi</span>
                    <span className="text-xl font-bold">{kundliData.basic_info.rashi}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <span className="block text-[10px] uppercase font-bold opacity-60 mb-1">Nakshatra</span>
                    <span className="text-xl font-bold">{kundliData.basic_info.nakshatra}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <span className="block text-[10px] uppercase font-bold opacity-60 mb-1">Lagna</span>
                    <span className="text-xl font-bold">{kundliData.basic_info.lagna}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <span className="block text-[10px] uppercase font-bold opacity-60 mb-1">Tithi</span>
                    <span className="text-xl font-bold">{kundliData.basic_info.tithi || "Dashami"}</span>
                  </div>
                </div>
              </div>
              <DocumentTextIcon className="absolute -bottom-10 -right-10 h-64 w-64 opacity-10" />
            </div>

            {/* Planetary Matrix */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <StarIcon className="h-7 w-7 text-amber-500" /> Planetary Matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kundliData.planetary_positions.map((planet, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600/50 hover:border-purple-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-purple-600 dark:text-purple-400 uppercase text-xs">{planet.planet}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 rounded-full text-purple-600 font-bold">{planet.strength}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{planet.sign}</span>
                      <span className="text-xs text-gray-500 font-bold">House {planet.house}</span>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-gray-400">{planet.degree}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Predictions</h2>
                <div className="space-y-6">
                  {Object.entries(kundliData.predictions).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-[10px] uppercase font-black text-purple-500 block mb-1 tracking-widest">{key}</span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Lucky Factors</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                      <span className="block text-[10px] uppercase font-bold text-amber-600 opacity-60 mb-1">Numbers</span>
                      <span className="font-bold">{kundliData.lucky_elements.numbers.join(', ')}</span>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                      <span className="block text-[10px] uppercase font-bold text-blue-600 opacity-60 mb-1">Colors</span>
                      <span className="font-bold">{kundliData.lucky_elements.colors.join(', ')}</span>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/30">
                      <span className="block text-[10px] uppercase font-bold text-green-600 opacity-60 mb-1">Days</span>
                      <span className="font-bold">{kundliData.lucky_elements.days.join(', ')}</span>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-800/30">
                      <span className="block text-[10px] uppercase font-bold text-pink-600 opacity-60 mb-1">Gemstone</span>
                      <span className="font-bold">{kundliData.lucky_elements.gemstone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl">
                  <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Spiritual Remedies</h2>
                  <ul className="space-y-4">
                    {kundliData.remedies.map((remedy, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="h-6 w-6 bg-purple-500 text-xs font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                        <p className="text-gray-300 text-sm italic">{remedy}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setKundliData(null)}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
            >
              Generate New Chart ↺
            </button>
          </div>
        ) : activeTab === 'new' ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2 text-purple-500" />Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Prem Kumar Gupta"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-2 text-purple-500" />Birth Place
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    placeholder="e.g. Noamundi, Jharkhand"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-2 text-purple-500" />Birth Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-2 text-purple-500" />Birth Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-3xl font-black uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Decoding Destiny...
                  </span>
                ) : 'Generate Brihat Kundli'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search saved charts by name..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:border-purple-500 focus:ring-0 transition-all text-lg font-bold"
              />
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {fetchingHistory ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSaved(item)}
                    className="group bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-purple-500 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-purple-600 transition-colors">{item.name}</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.dob} • {item.tob}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" /> {item.pob}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                      <HistoryIcon className="h-6 w-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-700">
                <DocumentTextIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest underline underline-offset-8">No saved charts found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrihatKundliPage;
