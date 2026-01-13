import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
    ChartBarIcon, 
    CurrencyDollarIcon, 
    UserGroupIcon, 
    StarIcon, 
    VideoCameraIcon,
    ClockIcon,
    BoltIcon,
    CurrencyRupeeIcon,
    SignalIcon,
    EyeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { astrologer, sessions } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300 transform hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const BirthDetailsModal = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;
    
    const dob = user?.date_of_birth || "Not provided";
    const time = user?.time_of_birth || "Not provided";
    const place = user?.place_of_birth || "Not provided";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Birth Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                         <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                         <p className="font-semibold text-gray-900 dark:text-white">{dob}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                         <p className="text-sm text-gray-500 dark:text-gray-400">Time of Birth</p>
                         <p className="font-semibold text-gray-900 dark:text-white">{time}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                         <p className="text-sm text-gray-500 dark:text-gray-400">Place of Birth</p>
                         <p className="font-semibold text-gray-900 dark:text-white">{place}</p>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AstrologerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null); // For birth details
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState(0);
  const [currentLoginMinutes, setCurrentLoginMinutes] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (profile) {
          let minutes = profile.total_login_minutes;
          if (profile.is_online && profile.last_online_time) {
              const lastOnline = new Date(profile.last_online_time);
              const now = new Date();
              const diff = Math.floor((now - lastOnline) / 1000 / 60);
              minutes += diff;
          }
          setCurrentLoginMinutes(minutes);
      }
  }, [profile]);

  const fetchData = async () => {
    try {
      const profileRes = await astrologer.getProfile();
      setProfile(profileRes.data);
      setNewRate(profileRes.data.rate);
      
      const sessionsRes = await astrologer.getSessions();
      setActiveSessions(sessionsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
          // Handle missing profile logic if needed
      }
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
      try {
          const res = await astrologer.updateStatus(!profile.is_online);
          setProfile(res.data);
      } catch (err) {
          console.error("Failed to update status", err);
      }
  };

  const handleRateUpdate = async () => {
      try {
          const res = await astrologer.updateRate(newRate);
          setProfile(res.data);
          setEditingRate(false);
      } catch (err) {
          console.error("Failed to update rate", err);
      }
  };

  const toggleBoost = async () => {
      try {
          const res = await astrologer.toggleBoost();
          setProfile(res.data);
      } catch (err) {
          console.error("Failed to toggle boost", err);
      }
  };

  const handleGoLive = async () => {
      try {
          const res = await astrologer.goLive();
          setProfile(res.data);
      } catch (err) {
          console.error("Failed to toggle live", err);
      }
  };

  const handleJoinCall = (sessionId) => {
      navigate(`/consultation-room/${sessionId}`);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.name?.charAt(0)}
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center">
                    <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
                    {profile.rating?.toFixed(1) || "New"} • {profile.specialties?.join(', ') || "Vedic Astrologer"}
                </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="flex flex-col items-end">
                 <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Availability</span>
                 <button 
                    onClick={toggleStatus}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${profile.is_online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                 >
                    <span className={`${profile.is_online ? 'translate-x-9' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform`} />
                 </button>
                 <span className="text-xs mt-1 font-medium text-gray-600 dark:text-gray-400">
                     {profile.is_online ? 'Online' : 'Offline'}
                 </span>
             </div>
          </div>
        </div>

        {/* Go Live Button */}
        <div className="flex justify-center mb-8">
            <button 
                onClick={handleGoLive}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-red-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-1"
            >
                <SignalIcon className="w-6 h-6 mr-2 animate-pulse" />
                Go Live
                <div className="absolute -top-3 -right-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                </div>
            </button>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button onClick={toggleBoost} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${profile.is_boosted ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-700 hover:border-purple-500'}`}>
                <BoltIcon className={`h-8 w-8 mb-2 ${profile.is_boosted ? 'text-purple-600 animate-pulse' : 'text-gray-400'}`} />
                <span className="font-semibold">{profile.is_boosted ? 'Boost Active' : 'Boost Profile'}</span>
            </button>

            <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-500 mb-2" />
                {editingRate ? (
                    <div className="flex items-center space-x-2">
                        <input 
                            type="number" 
                            value={newRate} 
                            onChange={(e) => setNewRate(e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-black"
                        />
                        <button onClick={handleRateUpdate} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setEditingRate(true)}>
                        <span className="font-semibold text-xl">₹{profile.rate}/min</span>
                        <span className="text-xs text-gray-500">(Edit)</span>
                    </div>
                )}
                <span className="text-sm text-gray-500 mt-1">Consultation Rate</span>
            </div>

            <button onClick={handleGoLive} className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col items-center justify-center transition-all group">
                <SignalIcon className="h-8 w-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-gray-900 dark:text-white">Go Live</span>
            </button>

             <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                <EyeIcon className="h-8 w-8 text-blue-500 mb-2" />
                <span className="font-semibold text-xl">{profile.followers_count || 0}</span>
                <span className="text-sm text-gray-500 mt-1">Followers</span>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Earnings" value={`₹${profile.earnings ? profile.earnings.toFixed(2) : '0.00'}`} icon={CurrencyDollarIcon} color="bg-green-500" />
          <StatCard title="Total Calls" value={profile.total_calls || 0} icon={UserGroupIcon} color="bg-blue-500" />
          <StatCard title="Avg. Rating" value={profile.rating || 5.0} icon={StarIcon} color="bg-amber-500" />
          <StatCard title="Login Hours" value={(currentLoginMinutes / 60).toFixed(1) + 'h'} icon={ClockIcon} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Queue */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <VideoCameraIcon className="h-6 w-6 mr-2 text-amber-500" />
                        Live Consultation Queue
                    </h2>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
                        {activeSessions.length} Active
                    </span>
                </div>
                
                <div className="space-y-4">
                    {activeSessions.length > 0 ? (
                        activeSessions.map((session) => (
                            <div key={session.id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-md">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                            U{session.user_id}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Incoming Request</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                Started: {new Date(session.start_time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => setSelectedSession(session)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                                    >
                                        Birth Details
                                    </button>
                                    <button 
                                        onClick={() => handleJoinCall(session.id)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center font-medium shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                                    >
                                        <VideoCameraIcon className="w-5 h-5 mr-2" />
                                        Accept & Join
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            <VideoCameraIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p>No active requests at the moment.</p>
                            <p className="text-sm mt-1">Make sure you are marked as "Online" to receive calls.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Reviews</h2>
                <div className="space-y-4">
                     <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                        <StarIcon className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        No reviews yet.
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Birth Details Modal */}
      <BirthDetailsModal 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        user={selectedSession ? { id: selectedSession.user_id } : {}}
      />
    </div>
  );
};

export default AstrologerDashboard;
