import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  SparklesIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  NewspaperIcon,
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
import { LanguageContext } from '../context/LanguageContext';
import { astrologer, features } from '../services/api';
import AIGuruChat from '../components/AIGuruChat';

const FeatureCard = ({ icon: Icon, title, color, action }) => (
  <div 
    onClick={action}
    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3 group"
  >
    <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
      <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">{title}</span>
  </div>
);

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
  const [latestNewsId, setLatestNewsId] = useState(null);
  const [hasNewNews, setHasNewNews] = useState(false);
  const [isGuruOpen, setIsGuruOpen] = useState(false);
  const { t } = useContext(LanguageContext);

  const fetchDashboardData = async () => {
    try {
      // Parallel data fetching
      const [
        panchangRes, 
        newsRes, 
        shopRes, 
        astroRes
      ] = await Promise.all([
        features.getDailyPanchang(),
        features.getNews(),
        features.getShopItems(),
        astrologer.getAll()
      ]);

      setPanchang(panchangRes.data);
      setNews(newsRes.data);
      if (newsRes.data && newsRes.data.length > 0) {
        setLatestNewsId(newsRes.data[0].id);
      }
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchDashboardData, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newsRes = await features.getNews();
        if (newsRes.data && newsRes.data.length > 0) {
          const newestId = newsRes.data[0].id;
          if (latestNewsId && newestId !== latestNewsId) {
            setHasNewNews(true);
          }
          setLatestNewsId(newestId);
        }
        setNews(newsRes.data);
      } catch (error) {
        console.error("Error updating news:", error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [latestNewsId]);

  const handleViewLatestNews = () => {
    setHasNewNews(false);
    if (latestNewsId) {
      navigate(`/article/${latestNewsId}`);
    } else {
      const section = document.getElementById('articles-blog');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    let ws;
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
      const wsBase = apiUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      ws = new WebSocket(`${wsBase}/ws/notifications`);
      ws.onmessage = async (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data?.type === 'news_added') {
            setHasNewNews(true);
            try {
              const res = await features.getNews();
              setNews(res.data);
              if (res.data && res.data.length > 0) {
                setLatestNewsId(res.data[0].id);
              }
            } catch (e) {
            }
          } else if (data?.type === 'news_deleted') {
            try {
              const res = await features.getNews();
              setNews(res.data);
              if (res.data && res.data.length > 0) {
                setLatestNewsId(res.data[0].id);
              }
            } catch (e) {
            }
          }
        } catch (e) {
        }
      };
    } catch (e) {
    }
    return () => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      } catch (e) {
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const astroRes = await astrologer.getAll();
        const sortedAstrologers = astroRes.data.sort((a, b) => {
          if (a.is_live && !b.is_live) return -1;
          if (!a.is_live && b.is_live) return 1;
          if (a.is_online && !b.is_online) return -1;
          if (!a.is_online && b.is_online) return 1;
          return 0;
        });
        setAstrologersList(sortedAstrologers);
      } catch (error) {
        console.error("Error updating astrologers list:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { title: 'AI Guru', icon: SparklesIcon, color: 'bg-amber-500', action: () => setIsGuruOpen(true) },
    { title: 'Matching', icon: HeartIcon, color: 'bg-red-500', action: () => navigate('/matching') },
    { title: 'Career', icon: BriefcaseIcon, color: 'bg-green-500', action: () => navigate('/career') },
    { title: 'Mental Health', icon: SparklesIcon, color: 'bg-teal-500', action: () => navigate('/mental-health') },
    { title: 'Today', icon: StarIcon, color: 'bg-indigo-500', action: () => navigate('/today') },
    { title: 'Love', icon: HeartIcon, color: 'bg-rose-500', action: () => navigate('/love') },
    { title: 'Education', icon: AcademicCapIcon, color: 'bg-cyan-500', action: () => navigate('/education') },
    { title: 'Reports', icon: DocumentTextIcon, color: 'bg-gray-500', action: () => navigate('/reports') },
    { title: 'Community', icon: UserGroupIcon, color: 'bg-violet-500', action: () => navigate('/services') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {isGuruOpen && <AIGuruChat onClose={() => setIsGuruOpen(false)} />}
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 space-y-8 pb-20">
        {hasNewNews && (
          <div className="mb-4 px-3">
            <div className="flex items-center justify-between bg-emerald-500 text-white px-4 py-3 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <BoltIcon className="h-5 w-5" />
                <span className="text-sm font-medium">New article update available</span>
              </div>
              <button
                onClick={handleViewLatestNews}
                className="text-xs font-semibold underline underline-offset-2"
              >
                View
              </button>
            </div>
          </div>
        )}
        {/* Quick Row: Panchang, Kundli, Horoscope */}
        <div className="px-1">
          <div className="grid grid-cols-3 gap-2 items-stretch">
            {/* Panchang Card */}
            <div 
              onClick={() => navigate('/panchang')}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-2 md:p-3 lg:p-4 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow h-24 md:h-32 lg:h-36 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-white/90" />
                <h2 className="text-sm md:text-base font-bold">Daily Panchang</h2>
              </div>
              <div className="mt-1">
                <p className="text-amber-100 text-[11px] md:text-xs md:mb-2">{panchang?.date || "Loading..."}</p>
                <div className="hidden md:grid grid-cols-3 gap-2 text-[12px] font-medium">
                  <div className="flex items-center gap-1">
                    <MoonIcon className="h-4 w-4 text-amber-200" />
                    <span className="truncate">{panchang?.tithi || "..."}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-amber-200" />
                    <span className="truncate">{panchang?.nakshatra || "..."}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SunIcon className="h-4 w-4 text-amber-200" />
                    <span className="truncate">{panchang?.yog || "..."}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kundli Card */}
            <div 
              onClick={() => {
                console.log('Navigating to Brihat Kundli');
                navigate('/brihat-kundli');
              }}
              className="bg-white dark:bg-slate-800 rounded-lg p-2 md:p-3 lg:p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow h-24 md:h-32 lg:h-36 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Brihat Kundli</h2>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-300">Quick generate</p>
                <button className="px-2 md:px-3 py-1 md:py-2 bg-purple-600 text-white rounded-md text-[11px] md:text-sm font-semibold hover:bg-purple-700">Open</button>
              </div>
            </div>

            {/* Horoscope Card */}
            <div 
              onClick={() => navigate('/horoscope')}
              className="bg-white dark:bg-slate-800 rounded-lg p-2 md:p-3 lg:p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow h-24 md:h-32 lg:h-36 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <SunIcon className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Horoscope</h2>
              </div>
              <div className="md:hidden flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                <span>12 Rashi</span><span>•</span><span>Daily</span>
              </div>
              <div className="hidden md:flex overflow-x-auto gap-2 scrollbar-hide mt-1">
                {Object.entries(RASHI_ICONS).map(([sign, icon]) => (
                  <button
                    key={sign}
                    onClick={() => navigate('/horoscope')}
                    className="min-w-[110px] flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-3xl md:text-4xl leading-none animate-spin-slow">{icon}</span>
                    <span className="text-[12px] md:text-sm font-medium text-gray-800 dark:text-gray-200">{sign}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div>
          <SectionHeader title={t('home_explore_features')} />
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {menuItems.map((item, index) => (
              <FeatureCard key={index} icon={item.icon} title={item.title} color={item.color} action={item.action} />
            ))}
          </div>
        </div>

        {/* Live Astrologers */}
        <div id="live-astrologers">
          <SectionHeader title={t('home_live_astrologers')} actionText="View All" onAction={() => {}} />
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
                 <div className="flex items-center justify-between w-full mb-2">
                   <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                     ₹{astro.rate ?? 0}/min
                   </span>
                   <span className="text-[11px] flex items-center gap-1">
                     <span
                       className={`inline-block w-2 h-2 rounded-full ${
                         astro.is_online ? 'bg-green-500' : 'bg-gray-400'
                       }`}
                     />
                     <span className="text-gray-600 dark:text-gray-300">
                       {astro.is_online ? 'Online' : 'Offline'}
                     </span>
                   </span>
                 </div>
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
        <div id="astro-shop">
          <SectionHeader title={t('home_astro_shop')} actionText="Visit Store" onAction={() => {}} />
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
        <div id="articles-blog">
          <SectionHeader title={t('home_latest_news')} actionText="Read More" onAction={() => {}} />
          <div className="space-y-4">
             {news.map((item) => (
               <div 
                 key={item.id} 
                 onClick={() => navigate(`/article/${item.id}`)}
                 className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
               >
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                     <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.summary}</p>
                     <span className="text-xs text-gray-400">
                       {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                     </span>
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
