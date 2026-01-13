import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  SparklesIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  PaperAirplaneIcon,
  SunIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  SignalIcon,
  BoltIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { astrologer, chat, users } from '../services/api';

const UserProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        date_of_birth: '',
        time_of_birth: '',
        place_of_birth: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                date_of_birth: profile.date_of_birth || '',
                time_of_birth: profile.time_of_birth || '',
                place_of_birth: profile.place_of_birth || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await users.updateProfile(formData);
            onUpdate(res.data);
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time of Birth</label>
                        <input type="time" name="time_of_birth" value={formData.time_of_birth} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Birth</label>
                        <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Home = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', content: 'Namaste! I am your AI Vedic Guru. Share your birth details or ask a question.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [astrologersList, setAstrologersList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkBackendHealth();
    fetchAstrologers();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role === 'user') {
          try {
              const res = await users.getProfile();
              setUserProfile(res.data);
          } catch (err) {
              console.error("Failed to fetch user profile", err);
          }
      }
  };

  const checkBackendHealth = async () => {
    try {
      await axios.get('http://localhost:8000/health');
      setBackendStatus('connected');
    } catch (error) {
      console.error("Backend health check failed:", error);
      setBackendStatus('disconnected');
    }
  };

  const fetchAstrologers = async () => {
    try {
      const response = await astrologer.getAll();
      setAstrologersList(response.data);
    } catch (err) {
      console.error("Failed to fetch astrologers", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = { role: 'user', content: chatMessage };
    setChatHistory([...chatHistory, newMessage]);
    setChatMessage('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ user_message: chatMessage });
      const aiResponse = { role: 'assistant', content: response.data.response || "I have received your message." };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorResponse = { role: 'assistant', content: "Apologies, I am having trouble connecting to the cosmic wisdom (Backend Error)." };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <div className="p-4 h-[calc(100vh-64px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
        
        {/* Left Panel - Dashboard & Tools */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Astro-Dashboard */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex-1 min-h-[300px] flex flex-col items-center justify-center relative border border-gray-200 dark:border-gray-700/50 shadow-xl transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 absolute top-6 left-6">Astro-Dashboard</h2>
            
            {/* Status Indicator */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-gray-400">{backendStatus === 'connected' ? 'System Online' : 'Offline'}</span>
            </div>

            {/* Circular Chart Placeholder */}
            <div className="relative w-48 h-48 mt-8">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="8" strokeDasharray="180 251.2" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="50 251.2" strokeDashoffset="-180" />
              </svg>
              {/* Inner details */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 rounded-full border border-gray-600 flex items-center justify-center bg-[#0f172a]">
                    <div className="text-xs text-gray-400">Planets</div>
                 </div>
              </div>
              
              {/* Decorative elements simulating the chart in the image */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs text-purple-400">Sun</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-xs text-yellow-400">Moon</div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full text-xs text-gray-500 dark:text-gray-400">
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0f172a] p-2 rounded-lg transition-colors"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Sun: 10° Leo</div>
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0f172a] p-2 rounded-lg transition-colors"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Moon: 24° Pis</div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 h-auto border border-gray-200 dark:border-gray-700/50 shadow-xl transition-colors duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Daily Insights</h3>
            <div className="space-y-3">
               <div className="p-3 bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-colors">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Horoscope</span>
                  <SunIcon className="h-5 w-5 text-amber-400" />
               </div>
               <div className="p-3 bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-colors">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Kundli Matching</span>
                  <HeartIcon className="h-5 w-5 text-pink-400" />
               </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Marketplace */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-[#1e293b] rounded-2xl p-6 overflow-y-auto border border-gray-200 dark:border-gray-700/50 shadow-xl scrollbar-hide transition-colors duration-300">
           <div className="flex items-center justify-between mb-8">
              <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Live Astrologers</h1>
                  <p className="text-amber-500 dark:text-amber-400 text-sm font-medium">Ancient Wisdom, AI Precision, Instant Guidance.</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-100 dark:bg-[#0f172a] text-slate-600 dark:text-gray-300 rounded-lg text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Filter</button>
                 <button className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors">Sort</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {astrologersList.length === 0 ? (
                 <div className="col-span-2 text-center text-slate-500 dark:text-gray-400 py-10">
                    No astrologers available right now.
                 </div>
              ) : (
                astrologersList.map((astro) => (
                  <div key={astro.email} className={`bg-slate-50 dark:bg-[#0f172a] p-4 rounded-xl border transition-all group ${astro.is_boosted ? 'border-amber-500/50 dark:border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'}`}>
                     <div className="flex items-start gap-4">
                        <div className="relative">
                           <div className={`w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold border-2 transition-colors text-slate-700 dark:text-gray-300 ${astro.is_live ? 'border-red-500' : (astro.is_boosted ? 'border-amber-500' : 'border-slate-200 dark:border-gray-700 group-hover:border-amber-500/50')}`}>
                              {astro.name.charAt(0)}
                           </div>
                           <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-50 dark:border-[#0f172a] ${astro.is_live ? 'bg-red-500 animate-pulse' : (astro.is_online ? 'bg-green-500' : 'bg-gray-400')}`}></span>
                           {astro.is_live && (
                               <span className="absolute -bottom-2 -left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">LIVE</span>
                           )}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                  <h3 className="font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-1">
                                      {astro.name}
                                      {astro.is_boosted && <BoltIcon className="h-3 w-3 text-amber-500" />}
                                  </h3>
                                  <p className="text-xs text-slate-500 dark:text-gray-400">{astro.specialties?.join(', ')}</p>
                              </div>
                              <div className="flex items-center text-amber-500 dark:text-amber-400 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                 <StarIcon className="h-3 w-3 mr-1" /> {astro.rating || 5.0}
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between mt-3">
                              <span className="text-sm font-medium text-slate-700 dark:text-gray-200">₹{astro.rate || 25}/min</span>
                              {astro.is_live ? (
                                  <button 
                                    onClick={() => navigate(`/consultation/${astro.id}`)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 animate-pulse"
                                  >
                                     connect
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => navigate(`/consultation/${astro.id}`)}
                                    disabled={!astro.is_online}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                        astro.is_online 
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-gray-900' 
                                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                  >
                                     {astro.is_online ? 'Connect' : 'Offline'}
                                  </button>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Right Panel - AI Guru */}
        <div className="col-span-12 lg:col-span-3 bg-white dark:bg-[#1e293b] rounded-2xl p-0 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-xl transition-colors duration-300">
           <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-slate-50/50 dark:bg-[#0f172a]/50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-gray-100">AI Guru</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
                       Online 24/7
                    </p>
                 </div>
              </div>
           </div>
           
           {/* Chat Area */}
           <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-[#0f172a]/30">
              {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-amber-500 text-white dark:text-gray-900 rounded-tr-none' 
                        : 'bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 rounded-tl-none shadow-sm'
                     }`}>
                        {msg.content}
                     </div>
                  </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 p-3 rounded-2xl rounded-tl-none text-xs italic shadow-sm">
                        Consulting the stars...
                     </div>
                  </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <form onSubmit={handleSendMessage} className="relative">
                 <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about your destiny..."
                    className="w-full bg-slate-100 dark:bg-[#0f172a] text-slate-800 dark:text-gray-200 text-sm rounded-xl py-3 pl-4 pr-12 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-amber-500/50 placeholder-slate-400 dark:placeholder-gray-500 transition-colors"
                 />
                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 text-white dark:text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                 >
                    <PaperAirplaneIcon className="h-4 w-4" />
                 </button>
              </form>
           </div>
        </div>

      </div>
    </div>
    <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onUpdate={setUserProfile}
    />
  </div>
  );
};

export default Home;
