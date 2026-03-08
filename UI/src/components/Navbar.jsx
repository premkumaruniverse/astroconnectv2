import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SparklesIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { wallet } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, t, languages } = useContext(LanguageContext);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('user_name');
  const profileImage = localStorage.getItem('profile_image');
  const [balance, setBalance] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (token && role === 'user') {
      fetchBalance();
    }
  }, [token, role, location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const fetchBalance = async () => {
    try {
      const response = await wallet.getBalance();
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'astrologer') return '/astro-dashboard';
    return '/dashboard';
  };

  const handleScrollToSection = (sectionId) => {
    const scrollToElement = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(scrollToElement, 200);
    } else {
      scrollToElement();
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[100] transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-20 gap-2 md:gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
            <Link to={getDashboardLink()} className="flex items-center space-x-3 shrink-0 group">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-amber-500/40 overflow-hidden shadow-2xl bg-black flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  <img
                    src="/logo.png"
                    alt="AstroVeda Logo"
                    className="w-full h-full object-cover scale-[1.6]"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-600 to-amber-700 tracking-tighter leading-none uppercase">
                  AstroVeda
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] leading-none uppercase ml-0.5">
                  Universal Wisdom
                </span>
              </div>
            </Link>
          </div>

          {/* Flagship AI Feature */}
          <button
            type="button"
            onClick={() => navigate('/ai-guru')}
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all border shadow-sm ${location.pathname === '/ai-guru'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-600 text-white shadow-amber-500/20'
              : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40'
              }`}
          >
            <SparklesIcon className={`h-4 w-4 md:h-5 md:w-5 ${location.pathname === '/ai-guru' ? 'text-white' : 'text-amber-500'}`} />
            <span className="hidden sm:inline font-black text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Veda AI</span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-4 lg:space-x-8 text-sm font-bold">
            {token && role === 'user' && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={`whitespace-nowrap transition-colors ${location.pathname === '/dashboard' ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300 hover:text-amber-500'}`}
              >
                {t('nav_home')}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/services')}
              className={`whitespace-nowrap transition-colors ${location.pathname === '/services' ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300 hover:text-amber-500'}`}
            >
              Services
            </button>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className={`whitespace-nowrap transition-colors ${location.pathname === '/shop' ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300 hover:text-amber-500'}`}
            >
              {t('nav_astro_shop')}
            </button>

            {token && role === 'user' && (
              <>
                <button
                  type="button"
                  onClick={() => handleScrollToSection('live-astrologers')}
                  className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-500 transition-colors"
                >
                  {t('nav_live')}
                </button>
                <button
                  type="button"
                  className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-500 transition-colors"
                >
                  {t('nav_history')}
                </button>
              </>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {token && role === 'user' && (
              <Link to="/wallet" className="flex items-center space-x-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-all">
                <span className="text-amber-600 dark:text-amber-400 text-xs md:text-sm font-black">₹{balance.toFixed(2)}</span>
              </Link>
            )}

            {token && (
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 group p-1.5 md:px-3 md:py-1.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-sm overflow-hidden">
                    {profileImage ? (
                      <img src={`http://localhost:8000${profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : userName ? (
                      <span className="text-[10px] font-black text-white uppercase">{userName[0]}</span>
                    ) : (
                      <UserCircleIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-black text-gray-700 dark:text-gray-200 group-hover:text-amber-500 uppercase tracking-tighter">
                    {userName || 'Account'}
                  </span>
                </button>
                <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-slate-800"></div>
              </div>
            )}

            {token ? (
              <button
                onClick={handleLogout}
                className="hidden sm:block px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold rounded-lg transition-all border border-red-500/20"
              >
                Logout
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold text-xs hover:text-amber-500 transition-colors">{t('auth_login')}</Link>
                <Link to="/signup" className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-lg hover:bg-amber-600 transition-all">Join</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 shadow-xl py-6 px-4 absolute top-full left-0 w-full flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {token && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-lg font-black text-white shadow-lg">
                {userName ? userName[0].toUpperCase() : <UserCircleIcon className="h-6 w-6" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{userName || 'Vedic Soul'}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Active Spiritual Path</span>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="ml-auto text-xs font-black text-amber-600 underline underline-offset-4"
              >
                EDIT
              </button>
            </div>
          )}
          <button
            onClick={() => navigate('/ai-guru')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold"
          >
            <SparklesIcon className="h-5 w-5" />
            Veda AI Spiritual Guide
          </button>

          {token && role === 'user' && (
            <button onClick={() => navigate('/dashboard')} className="flex items-center p-4 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
              {t('nav_home')}
            </button>
          )}

          <button onClick={() => navigate('/services')} className="flex items-center p-4 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Services
          </button>

          <button onClick={() => navigate('/shop')} className="flex items-center p-4 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            {t('nav_astro_shop')}
          </button>

          {token && role === 'user' && (
            <>
              <button onClick={() => handleScrollToSection('live-astrologers')} className="flex items-center p-4 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                {t('nav_live')}
              </button>
              <button className="flex items-center p-4 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                {t('nav_history')}
              </button>
            </>
          )}

          <div className="h-px bg-gray-100 dark:bg-slate-800 my-2"></div>

          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-amber-600 font-bold text-sm outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="p-4 flex gap-4">
            {token ? (
              <button onClick={handleLogout} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20">Logout</button>
            ) : (
              <>
                <Link to="/login" className="flex-1 py-4 text-center text-gray-700 dark:text-white font-bold border border-gray-200 dark:border-slate-700 rounded-xl">Login</Link>
                <Link to="/signup" className="flex-1 py-4 text-center bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20">Join Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
