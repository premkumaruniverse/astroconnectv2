import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SparklesIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';
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
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (token && role === 'user') {
      fetchBalance();
    }
  }, [token, role, location.pathname]);

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
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={getDashboardLink()} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              AstroVeda Connect
            </span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            {token ? (
              <>
                {role === 'user' && (
                  <Link to="/wallet" className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#0f172a] hover:bg-gray-200 dark:hover:bg-[#0f172a]/80 border border-gray-200 dark:border-amber-500/30 rounded-full transition-all cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-gray-700 dark:text-amber-400 text-sm font-medium">₹ {balance.toFixed(2)}</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium text-sm transition-colors"
                >
                  {t('auth_login')}
                </Link>
                <Link 
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105"
                >
                  {t('auth_signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
        {token && role === 'user' && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-6 md:space-x-10 text-xs sm:text-sm py-2 overflow-x-auto scrollbar-hide justify-start md:justify-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                {t('nav_home')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                Services
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection('astro-shop')}
                className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                {t('nav_astro_shop')}
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection('live-astrologers')}
                className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                {t('nav_live')}
              </button>
              <button
                type="button"
                className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                {t('nav_history')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
