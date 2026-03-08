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
  BoltIcon,
  ChevronRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import { LanguageContext } from '../context/LanguageContext';
import { astrologer, features, shop, API_URL } from '../services/api';
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
    // 1. Fetch fast data first
    features.getNews().then(res => {
      setNews(res.data);
      if (res.data && res.data.length > 0) {
        setLatestNewsId(res.data[0].id);
      }
    }).catch(err => console.error("News error:", err));

    shop.getProducts().then(res => {
      setShopItems(res.data);
    }).catch(err => console.error("Shop error:", err));

    astrologer.getAll().then(res => {
      const sortedAstrologers = res.data.sort((a, b) => {
        if (a.is_live && !b.is_live) return -1;
        if (!a.is_live && b.is_live) return 1;
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        return 0;
      });
      setAstrologersList(sortedAstrologers);
    }).catch(err => console.error("Astro error:", err));

    // 2. Fetch potentially slow data independently
    features.getDailyPanchang().then(res => {
      setPanchang(res.data);
    }).catch(err => console.error("Panchang error:", err));
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
    { title: 'Matching', icon: HeartIcon, color: 'bg-red-500', action: () => navigate('/matching') },
    { title: 'Career', icon: BriefcaseIcon, color: 'bg-green-500', action: () => navigate('/career') },
    { title: 'Mental Health', icon: SparklesIcon, color: 'bg-teal-500', action: () => navigate('/mental-health') },
    { title: 'Today', icon: StarIcon, color: 'bg-indigo-500', action: () => navigate('/today') },
    { title: 'Love', icon: HeartIcon, color: 'bg-rose-500', action: () => navigate('/love') },
    { title: 'Education', icon: AcademicCapIcon, color: 'bg-cyan-500', action: () => navigate('/education') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {isGuruOpen && <AIGuruChat onClose={() => setIsGuruOpen(false)} />}
      <Navbar />

      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-6 space-y-4 md:space-y-8 pb-20">

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 items-stretch">
            {/* Panchang Card */}
            <div
              onClick={() => navigate('/panchang')}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-[2rem] p-3 sm:p-6 text-white shadow-xl shadow-amber-500/20 cursor-pointer hover:shadow-2xl transition-all h-14 sm:h-64 flex items-center sm:flex-col sm:justify-between group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 w-full sm:mb-6">
                <div className="p-1.5 sm:p-3 bg-white/20 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform flex-shrink-0 shadow-inner">
                  <CalendarIcon className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-sm sm:text-2xl font-black uppercase tracking-tighter">Daily Panchang</h2>
              </div>

              <div className="hidden sm:flex flex-col flex-1 w-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-amber-100 text-[10px] md:text-xs font-black opacity-80 tracking-widest">{panchang?.date || "2026-03-08"}</p>
                  <div className="w-12 h-px bg-white/20"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <MoonIcon className="h-4 w-4 text-amber-200" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-center leading-tight line-clamp-2">{panchang?.tithi || "..."}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <StarIcon className="h-4 w-4 text-amber-200" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-center leading-tight line-clamp-2">{panchang?.nakshatra || "..."}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <SunIcon className="h-4 w-4 text-amber-200" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-center leading-tight line-clamp-2">{panchang?.yog || "..."}</span>
                  </div>
                </div>
              </div>

              <div className="sm:hidden ml-auto">
                <ChevronRightIcon className="h-5 w-5 text-white/50" />
              </div>
            </div>

            {/* Kundli Card */}
            <div
              onClick={() => navigate('/brihat-kundli')}
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-2xl transition-all h-14 sm:h-64 flex items-center sm:flex-col group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 w-full sm:mb-6">
                <div className="p-1.5 sm:p-3 bg-purple-500/10 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform text-purple-600 dark:text-purple-400 flex-shrink-0 shadow-inner">
                  <DocumentTextIcon className="h-5 w-5 md:h-8 md:w-8" />
                </div>
                <h2 className="text-sm sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Brihat Kundli</h2>
              </div>
              <div className="hidden sm:flex flex-col flex-1 w-full">
                <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-2">Detailed Vedic Astrology charts for your destiny.</p>
                <p className="text-[10px] md:text-xs font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full w-fit mb-4">New Release</p>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-purple-500 transition-colors">Generate Chart</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg group-hover:bg-purple-700 transition-all group-hover:scale-110">
                    <BoltIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="sm:hidden ml-auto">
                <ChevronRightIcon className="h-5 w-5 text-gray-300 dark:text-gray-500" />
              </div>
            </div>

            {/* Horoscope Card */}
            <div
              onClick={() => navigate('/horoscope')}
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-2xl transition-all h-14 sm:h-64 flex items-center sm:flex-col group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 w-full sm:mb-6">
                <div className="p-1.5 sm:p-3 bg-yellow-500/10 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform text-yellow-500 flex-shrink-0 shadow-inner">
                  <SunIcon className="h-5 w-5 md:h-8 md:w-8" />
                </div>
                <h2 className="text-sm sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Horoscope</h2>
              </div>
              <div className="hidden sm:flex flex-col flex-1 w-full">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-gray-600 dark:text-gray-400 tracking-wider uppercase">12 Zodiac Signs</span>
                  <span className="px-3 py-1 bg-amber-500/10 rounded-lg text-[10px] font-black text-amber-600 tracking-wider uppercase">Daily Guidance</span>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-amber-500 transition-colors">Explore Rashi</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                    <ChevronRightIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="sm:hidden ml-auto">
                <ChevronRightIcon className="h-5 w-5 text-gray-300 dark:text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div>
          <SectionHeader title={t('home_explore_features')} />
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {menuItems.map((item, index) => (
              <FeatureCard key={index} icon={item.icon} title={item.title} color={item.color} action={item.action} />
            ))}
          </div>
        </div>

        {/* Live Astrologers */}
        <div id="live-astrologers">
          <SectionHeader title={t('home_live_astrologers')} actionText="View All" onAction={() => { }} />
          <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide -mx-4 px-4 snap-x">
            {astrologersList.length > 0 ? astrologersList.map((astro) => (
              <div key={astro.id} className="min-w-[240px] md:min-w-[280px] bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center group snap-center hover:shadow-xl transition-all">
                <div className="relative mb-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-orange-400">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-2xl font-black overflow-hidden border-2 border-white dark:border-slate-800">
                      {astro.profile_image ? <img src={`${API_URL}${astro.profile_image}`} alt={astro.name} className="w-full h-full object-cover" /> : astro.name[0]}
                    </div>
                  </div>
                  {astro.is_live && <span className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg animate-pulse ring-4 ring-white dark:ring-slate-800">LIVE</span>}
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white truncate w-full text-center group-hover:text-amber-600 transition-colors uppercase tracking-tight">{astro.name}</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">{astro.specialties?.[0] || "Vedic Path"}</p>
                <div className="flex items-center justify-between w-full mb-5 px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Rate</span>
                    <span className="text-sm font-black text-amber-600">₹{astro.rate ?? 0}/min</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                    <span className={`flex items-center gap-1.5 text-xs font-black ${astro.is_online ? 'text-emerald-500' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${astro.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      {astro.is_online ? 'AVAILABLE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/consultation/${astro.id}`)}
                  className="w-full py-3 bg-gray-900 dark:bg-amber-500 text-white font-black rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest"
                >
                  Start Journey
                </button>
              </div>
            )) : (
              <div className="text-gray-500 w-full text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700 font-bold uppercase tracking-widest">No spiritual guides online currently.</div>
            )}
          </div>
        </div>

        {/* Astro Shop Preview */}
        <div id="astro-shop">
          <SectionHeader title={t('home_astro_shop')} actionText="View All" onAction={() => navigate('/shop')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {shopItems.slice(0, 4).map((item) => (
              <div key={item.id} onClick={() => navigate('/shop')} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group cursor-pointer hover:shadow-2xl transition-all flex flex-col h-full">
                <div className="h-48 md:h-56 bg-gray-50 dark:bg-slate-900 w-full relative overflow-hidden flex items-center justify-center p-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="p-8 bg-amber-500/10 rounded-full text-amber-500 group-hover:scale-110 transition-transform duration-700">
                      <ShoppingBagIcon className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest shadow-sm">
                    {item.category}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-black text-gray-900 dark:text-white text-base truncate mb-2 uppercase tracking-tight">{item.name}</h4>
                  <div className="flex justify-between items-end mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Price</span>
                      <span className="text-xl font-black text-amber-600">₹{item.price}</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-900 dark:bg-amber-500 rounded-2xl text-white flex items-center justify-center shadow-lg group-hover:bg-amber-600 transition-colors transform group-hover:-translate-y-1">
                      <ShoppingBagIcon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div id="articles-blog" className="pb-10">
          <SectionHeader title={t('home_latest_news')} actionText="View All" onAction={() => { }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {news.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/article/${item.id}`)}
                className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 cursor-pointer hover:shadow-xl transition-all group"
              >
                <div className="w-full sm:w-32 h-40 sm:h-32 bg-gray-50 dark:bg-slate-700 rounded-2xl flex-shrink-0 overflow-hidden relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500/20">
                      <NewspaperIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Spiritual Insights</span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Sacred Date'}
                    </span>
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 line-clamp-1 uppercase tracking-tight group-hover:text-amber-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">{item.summary}</p>
                  <div className="mt-auto flex items-center gap-1 text-xs font-black text-gray-900 dark:text-amber-500 uppercase tracking-widest group-hover:gap-2 transition-all">
                    Read Wisdom <span>→</span>
                  </div>
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
