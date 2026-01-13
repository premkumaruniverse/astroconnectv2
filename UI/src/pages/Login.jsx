import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await auth.login(formData);

      const { access_token, role, name, id, verification_status } = response.data;
      
      // Store auth data
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_id', id);
      if (verification_status) {
        localStorage.setItem('verification_status', verification_status);
      }

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'astrologer') {
        if (verification_status === 'pending') {
          navigate('/verification-pending');
        } else {
          navigate('/astro-dashboard');
        }
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400">
          Or{' '}
          <Link to="/signup" className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1e293b] py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-700 sm:rounded-lg sm:px-10 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-gray-900 bg-amber-600 dark:bg-amber-500 hover:bg-amber-500 dark:hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
