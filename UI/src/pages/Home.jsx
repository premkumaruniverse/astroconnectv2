import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  SparklesIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  NewspaperIcon,
  FireIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  SunIcon,
  MoonIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import { astrologer, features } from '../services/api';

const FeatureCard = ({ icon: Icon, title, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3 group"
  >
    <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
      <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">{title}</span>
  </div>
);

const SectionHeader = ({ title, actionText, onAction }) => (
  <div className="flex justify-between items-center mb-4 px-2">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    {actionText && (
      <button 
        onClick={onAction}
        className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline"
      >
        {actionText}
      </button>
    )}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [panchang, setPanchang] = useState(null);
  const [news, setNews] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [astrologersList, setAstrologersList] = useState([]);
  const [insight, setInsight] = useState(null);
  const [horoscope, setHoroscope] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Parallel data fetching
      const [
        panchangRes, 
        newsRes, 
        shopRes, 
        astroRes, 
        insightRes,
        horoscopeRes
      ] = await Promise.all([
        features.getDailyPanchang(),
        features.getNews(),
        features.getShopItems(),
        astrologer.getAll(),
        features.getInsight('today'),
        features.getDailyHoroscope()
      ]);

      setPanchang(panchangRes.data);
      setNews(newsRes.data);
      setShopItems(shopRes.data);
      // Sort astrologers: Live first, then Online, then others
      const sortedAstrologers = astroRes.data.sort((a, b) => {
        if (a.is_live && !b.is_live) return -1;
        if (!a.is_live && b.is_live) return 1;
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        return 0;
      });
      setAstrologersList(sortedAstrologers);
      setInsight(insightRes.data);
      setHoroscope(horoscopeRes.data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const menuItems = [
    { title: 'Daily Panchang', icon: CalendarIcon, color: 'bg-orange-500', action: () => {} },
    { title: 'Brihat Kundli', icon: DocumentTextIcon, color: 'bg-purple-500', action: () => {} },
    { title: 'Astro Shop', icon: ShoppingBagIcon, color: 'bg-pink-500', action: () => {} },
    { title: 'News', icon: NewspaperIcon, color: 'bg-blue-500', action: () => {} },
    { title: 'Matching', icon: HeartIcon, color: 'bg-red-500', action: () => {} },
    { title: 'Horoscope', icon: SunIcon, color: 'bg-yellow-500', action: () => {} },
    { title: 'Career', icon: BriefcaseIcon, color: 'bg-green-500', action: () => {} },
    { title: 'Mental Health', icon: SparklesIcon, color: 'bg-teal-500', action: () => {} },
    { title: 'Today', icon: StarIcon, color: 'bg-indigo-500', action: () => {} },
    { title: 'Love', icon: HeartIcon, color: 'bg-rose-500', action: () => {} },
    { title: 'Education', icon: AcademicCapIcon, color: 'bg-cyan-500', action: () => {} },
    { title: 'Live', icon: VideoCameraIcon, color: 'bg-red-600', action: () => document.getElementById('live-astrologers').scrollIntoView({ behavior: 'smooth' }) },
    { title: 'Call & Chat', icon: ChatBubbleLeftRightIcon, color: 'bg-emerald-500', action: () => document.getElementById('live-astrologers').scrollIntoView({ behavior: 'smooth' }) }, // Or list view
    { title: 'Reports', icon: DocumentTextIcon, color: 'bg-gray-500', action: () => {} },
    { title: 'Community', icon: UserGroupIcon, color: 'bg-violet-500', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 space-y-8 pb-20">
        
        {/* Hero Section: Panchang & Insight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panchang Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-1">Daily Panchang</h2>
              <p className="text-amber-100 text-sm mb-4">{panchang?.date || "Loading..."}</p>
              
              <div className="space-y-2 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <MoonIcon className="h-4 w-4 text-amber-200" />
                  <span>{panchang?.tithi || "Loading..."}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-amber-200" />
                  <span>{panchang?.nakshatra}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SunIcon className="h-4 w-4 text-amber-200" />
                  <span>{panchang?.yog}</span>
                </div>
              </div>
            </div>
            <SparklesIcon className="absolute -bottom-4 -right-4 h-32 w-32 text-white opacity-10" />
          </div>

          {/* Today's Insight */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                Cosmic Insight
             </h3>
             <p className="text-gray-600 dark:text-gray-300 italic">
               "{insight?.insight || "Align your energy with the universe today."}"
             </p>
             <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs rounded-md">#Mindfulness</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-md">#Growth</span>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div>
          <SectionHeader title="Explore Features" />
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {menuItems.map((item, index) => (
              <FeatureCard key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Live Astrologers */}
        <div id="live-astrologers">
          <SectionHeader title="Live Astrologers" actionText="View All" onAction={() => {}} />
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {astrologersList.length > 0 ? astrologersList.map((astro) => (
              <div key={astro.id} className="min-w-[200px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold mb-3 overflow-hidden">
                       {astro.profile_image ? <img src={astro.profile_image} alt={astro.name} className="w-full h-full object-cover"/> : astro.name[0]}
                    </div>
                    {astro.is_live && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">LIVE</span>}
                 </div>
                 <h3 className="font-semibold text-gray-900 dark:text-white truncate w-full text-center">{astro.name}</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{astro.specialties?.[0] || "Vedic"}</p>
                 <button 
                   onClick={() => navigate(`/consultation/${astro.id}`)}
                   className="w-full py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                 >
                   Connect
                 </button>
              </div>
            )) : (
              <div className="text-gray-500 w-full text-center py-4">No astrologers online currently.</div>
            )}
          </div>
        </div>

        {/* Astro Shop Preview */}
        <div>
          <SectionHeader title="Astro Shop" actionText="Visit Store" onAction={() => {}} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 w-full relative">
                   {/* Placeholder for image */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <ShoppingBagIcon className="h-8 w-8" />
                   </div>
                </div>
                <div className="p-3">
                   <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</h4>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">₹{item.price}</span>
                      <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-amber-500 hover:text-white transition-colors">
                        <ShoppingBagIcon className="h-4 w-4" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div>
          <SectionHeader title="Latest News" actionText="Read More" onAction={() => {}} />
          <div className="space-y-4">
             {news.map((item) => (
               <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                     <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.summary}</p>
                     <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;
