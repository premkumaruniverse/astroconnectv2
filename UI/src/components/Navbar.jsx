import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SparklesIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { wallet } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [balance, setBalance] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'astrologer') return '/astro-dashboard';
    return '/dashboard';
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getDashboardLink()} className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              AstroVeda
            </span>
          </Link>

          {/* Desktop Navigation */}
          {token && role === 'user' && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-medium">Home</Link>
              <button onClick={() => scrollToSection('astro-shop')} className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-medium">Astro Shop</button>
              <button onClick={() => scrollToSection('live-astrologers')} className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-medium">Live</button>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-medium">History</a>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hidden sm:block"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            {token ? (
              <div className="flex items-center space-x-4">
                 {role === 'user' && (
                    <Link to="/wallet" className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#0f172a] hover:bg-gray-200 dark:hover:bg-[#0f172a]/80 border border-gray-200 dark:border-amber-500/30 rounded-full transition-all cursor-pointer">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-gray-700 dark:text-amber-400 text-sm font-medium">₹ {balance.toFixed(2)}</span>
                    </Link>
                 )}
                <button 
                  onClick={handleLogout}
                  className="hidden md:block px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
                
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                 <div className="hidden md:flex items-center space-x-2">
                    <Link 
                      to="/login"
                      className="px-4 py-2 text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium text-sm transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105"
                    >
                      Signup
                    </Link>
                </div>
                 {/* Mobile Menu Button for non-auth */}
                 <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fadeIn">
            {token && role === 'user' && (
              <div className="space-y-2">
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Home</Link>
                <button onClick={() => scrollToSection('astro-shop')} className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Astro Shop</button>
                <button onClick={() => scrollToSection('live-astrologers')} className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Live</button>
                <a href="#" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">History</a>
                <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center justify-between">
                   <span>Wallet</span>
                   <span className="text-amber-600 dark:text-amber-400 font-bold">₹ {balance.toFixed(2)}</span>
                </Link>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
               <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
               <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>

            <div className="px-4">
              {token ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-600/10 text-red-500 font-medium rounded-lg hover:bg-red-600/20 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                   <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2 text-center text-slate-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 rounded-lg">Login</Link>
                   <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2 text-center bg-amber-500 text-white font-bold rounded-lg">Signup</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;