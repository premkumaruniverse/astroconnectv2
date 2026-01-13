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

const DetailModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pr-8">{title}</h3>
        <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {children}
        </div>
      </div>
    </div>
  );
};

const zodiacSigns = [
  { name: "Aries", icon: "♈" }, { name: "Taurus", icon: "♉" }, { name: "Gemini", icon: "♊" },
  { name: "Cancer", icon: "♋" }, { name: "Leo", icon: "♌" }, { name: "Virgo", icon: "♍" },
  { name: "Libra", icon: "♎" }, { name: "Scorpio", icon: "♏" }, { name: "Sagittarius", icon: "♐" },
  { name: "Capricorn", icon: "♑" }, { name: "Aquarius", icon: "♒" }, { name: "Pisces", icon: "♓" },
];

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
  const [horoscope, setHoroscope] = useState([]);
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'panchang', 'horoscope', 'kundli'
  const [selectedSign, setSelectedSign] = useState(null);

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
        horoscopeRes
      ] = await Promise.all([
        features.getDailyPanchang(),
        features.getNews(),
        features.getShopItems(),
        astrologer.getAll(),
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
      setHoroscope(horoscopeRes.data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleSignClick = (signName) => {
      const signData = horoscope.find(h => h.sign === signName);
      setSelectedSign(signData);
      setActiveModal('horoscope_detail');
  };

  const menuItems = [
    { title: 'Brihat Kundli', icon: DocumentTextIcon, color: 'bg-purple-500', action: () => {} },
    { title: 'Matching', icon: HeartIcon, color: 'bg-red-500', action: () => {} },
    { title: 'Career', icon: BriefcaseIcon, color: 'bg-green-500', action: () => {} },
    { title: 'Mental Health', icon: SparklesIcon, color: 'bg-teal-500', action: () => {} },
    { title: 'Today', icon: StarIcon, color: 'bg-indigo-500', action: () => {} },
    { title: 'Love', icon: HeartIcon, color: 'bg-rose-500', action: () => {} },
    { title: 'Education', icon: AcademicCapIcon, color: 'bg-cyan-500', action: () => {} },
    { title: 'Reports', icon: DocumentTextIcon, color: 'bg-gray-500', action: () => {} },
    { title: 'Community', icon: UserGroupIcon, color: 'bg-violet-500', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 space-y-8 pb-20">
        
        {/* Hero Section: Panchang, Kundli, Horoscope */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
            {/* Daily Panchang - Compact Horizontal Layout */}
            <div 
              onClick={() => setActiveModal('panchang')}
              className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex items-center justify-between h-24"
            >
              <div className="flex items-center gap-4 z-10">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <CalendarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold">Daily Panchang</h2>
                      <p className="text-amber-100 text-xs">{panchang?.date || "Today"}</p>
                  </div>
              </div>
              
              <div className="hidden sm:flex flex-col items-end gap-1 z-10 text-right">
                  <span className="text-xs font-medium bg-black/20 px-2 py-1 rounded-full">{panchang?.tithi?.split(' ')[0] || "Tithi"}</span>
                  <span className="text-xs font-medium bg-black/20 px-2 py-1 rounded-full">{panchang?.nakshatra || "Nakshatra"}</span>
              </div>
              
              <SparklesIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-white opacity-10 group-hover:opacity-20 transition-opacity" />
            </div>

            {/* Kundli Card - Compact Horizontal Layout */}
            <div 
              onClick={() => setActiveModal('kundli')}
              className="bg-purple-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:bg-purple-700 transition-colors flex items-center justify-between h-24"
            >
                <div className="flex items-center gap-4 z-10">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <DocumentTextIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Free Kundli</h3>
                        <p className="text-purple-100 text-xs">Get detailed report</p>
                    </div>
                </div>

                <div className="z-10">
                    <button className="px-3 py-1.5 bg-white text-purple-600 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap">
                        Create Now
                    </button>
                </div>
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white opacity-5 rounded-full -ml-6 -mb-6"></div>
            </div>

          {/* Horoscope (Compact Horizontal Scroll) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4 overflow-hidden h-24">
             <div className="flex items-center gap-2 min-w-max pl-2 border-r border-gray-100 dark:border-gray-700 pr-4">
                <SunIcon className="h-6 w-6 text-yellow-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    Daily<br/>Horoscope
                </h3>
             </div>
             
             <div className="flex overflow-x-auto gap-3 items-center scrollbar-hide snap-x h-full">
                 {zodiacSigns.map((sign) => (
                     <div 
                        key={sign.name}
                        onClick={() => handleSignClick(sign.name)}
                        className="flex flex-col items-center justify-center gap-1 min-w-[50px] cursor-pointer group snap-start h-full"
                     >
                         <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all transform group-hover:scale-110">
                             {sign.icon}
                         </div>
                         <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate w-full text-center">{sign.name}</span>
                     </div>
                 ))}
             </div>
          </div>

        </div>

        {/* Modals */}
        <DetailModal 
            isOpen={activeModal === 'panchang'} 
            onClose={() => setActiveModal(null)}
            title={`Daily Panchang - ${panchang?.date}`}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Tithi</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{panchang?.tithi}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Nakshatra</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{panchang?.nakshatra}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Yog</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{panchang?.yog}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Karan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{panchang?.karan}</span>
                    </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-700/50 rounded-xl border border-amber-100 dark:border-slate-600">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Today's Special</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Today is a good day for starting new ventures. Avoid travel in the North direction.
                        Rahukaal is from 10:30 AM to 12:00 PM.
                    </p>
                </div>
            </div>
        </DetailModal>

        <DetailModal 
            isOpen={activeModal === 'horoscope_detail'} 
            onClose={() => setActiveModal(null)}
            title={`${selectedSign?.sign} Horoscope`}
        >
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-4">
                    {zodiacSigns.find(z => z.name === selectedSign?.sign)?.icon}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {selectedSign?.prediction || "Loading prediction..."}
                </p>
                <div className="mt-6 w-full grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className="block text-xs text-gray-500">Lucky Color</span>
                        <span className="font-medium">Red</span>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className="block text-xs text-gray-500">Lucky Number</span>
                        <span className="font-medium">9</span>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className="block text-xs text-gray-500">Mood</span>
                        <span className="font-medium">Energetic</span>
                    </div>
                </div>
            </div>
        </DetailModal>

        <DetailModal 
            isOpen={activeModal === 'kundli'} 
            onClose={() => setActiveModal(null)}
            title="Create Your Kundli"
        >
             <form className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                     <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Enter your name" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                         <input type="date" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time of Birth</label>
                         <input type="time" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                     </div>
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Birth</label>
                     <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="City, Country" />
                 </div>
                 <button type="button" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors mt-2">
                     Generate Kundli
                 </button>
             </form>
        </DetailModal>

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
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide px-2">
            {astrologersList.length > 0 ? astrologersList.map((astro) => (
              <div key={astro.id} className="min-w-[200px] bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md flex flex-col relative overflow-hidden group hover:shadow-lg transition-all">
                 
                 {/* Status Badge (Top Right) */}
                 <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 z-10 ${
                    astro.is_live ? 'bg-red-500 text-white animate-pulse' : 
                    astro.is_online ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : 
                    'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                 }`}>
                    {astro.is_live ? (
                        <><VideoCameraIcon className="w-3 h-3" /> LIVE</>
                    ) : (
                        <>
                            <span className={`w-1.5 h-1.5 rounded-full ${astro.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span>{astro.is_online ? 'Online' : 'Offline'}</span>
                        </>
                    )}
                 </div>

                 {/* Profile Image */}
                 <div className="self-center mt-6 mb-3 relative">
                    <div className={`w-20 h-20 rounded-full p-1 ${astro.is_live ? 'bg-gradient-to-tr from-red-500 to-orange-500' : (astro.is_online ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700')}`}>
                         <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white dark:border-slate-800">
                            {astro.profile_image ? <img src={astro.profile_image} alt={astro.name} className="w-full h-full object-cover"/> : astro.name[0]}
                         </div>
                    </div>
                    {/* Rating Badge */}
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full px-2 py-0.5 flex items-center gap-1 text-[10px] whitespace-nowrap">
                        <StarIcon className="w-3 h-3 text-yellow-400" />
                        <span className="font-bold text-gray-700 dark:text-gray-200">{astro.rating || "4.5"}</span>
                     </div>
                 </div>

                 {/* Info */}
                 <div className="text-center mt-2 flex-1 flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate w-full text-sm">{astro.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate w-full">{astro.specialties?.[0] || "Vedic Astrologer"}</p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                         ₹{astro.rate || "25"}/min
                    </p>
                 </div>

                 {/* Action Button */}
                 <button 
                   onClick={() => navigate(`/consultation/${astro.id}`)}
                   disabled={!astro.is_online && !astro.is_live}
                   className={`w-full py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                       astro.is_live ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-none' :
                       astro.is_online ? 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' :
                       'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-500'
                   }`}
                 >
                   {astro.is_live ? <><VideoCameraIcon className="w-3 h-3" /> Join Live</> : 
                    astro.is_online ? <><ChatBubbleLeftRightIcon className="w-3 h-3" /> Chat / Call</> : 
                    'Offline'}
                 </button>
              </div>
            )) : (
              <div className="text-gray-500 w-full text-center py-4">No astrologers online currently.</div>
            )}
          </div>
        </div>

        {/* Astro Shop Preview */}
        <div id="astro-shop">
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
