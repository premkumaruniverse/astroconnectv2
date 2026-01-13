import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, astrologer } from '../services/api';
import { SparklesIcon, UserIcon, StarIcon } from '@heroicons/react/24/solid';

const Signup = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialties: '', // Comma separated for input
    experience: '',
    languages: '', // Comma separated for input
    bio: ''
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
      // 1. Create User Account
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      };

      const response = await auth.signup(signupData);
      const { access_token, role: userRole, name } = response.data;
      
      // Store auth data
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user_name', name);

      // 2. If Astrologer, submit application details
      if (role === 'astrologer') {
        const astroData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          experience: parseInt(formData.experience) || 0,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
          languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
          bio: formData.bio
        };
        
        await astrologer.apply(astroData);
        localStorage.setItem('verification_status', 'pending');
        navigate('/verification-pending');
      } else {
        // User flow
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400">
          Or{' '}
          <Link to="/login" className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-[#1e293b] py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-700 sm:rounded-lg sm:px-10 transition-colors duration-300">
          
          {/* Role Selection */}
          <div className="flex rounded-md shadow-sm mb-6" role="group">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
                role === 'user'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              } focus:z-10 focus:ring-2 focus:ring-amber-500 transition-colors`}
            >
              <div className="flex items-center justify-center">
                <UserIcon className="h-5 w-5 mr-2" />
                User
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('astrologer')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border ${
                role === 'astrologer'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              } focus:z-10 focus:ring-2 focus:ring-amber-500 transition-colors`}
            >
               <div className="flex items-center justify-center">
                <StarIcon className="h-5 w-5 mr-2" />
                Astrologer
              </div>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Common Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Phone Number {role === 'user' && <span className="text-gray-400 font-normal">(Optional)</span>}
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required={role === 'astrologer'}
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Astrologer Specific Fields */}
            {role === 'astrologer' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                            Experience (Years)
                        </label>
                        <div className="mt-1">
                            <input
                            id="experience"
                            name="experience"
                            type="number"
                            required
                            min="0"
                            value={formData.experience}
                            onChange={handleChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="languages" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                            Languages
                        </label>
                        <div className="mt-1">
                            <input
                            id="languages"
                            name="languages"
                            type="text"
                            placeholder="e.g. Hindi, English"
                            required
                            value={formData.languages}
                            onChange={handleChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="specialties" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                        Specialties
                    </label>
                    <div className="mt-1">
                        <input
                        id="specialties"
                        name="specialties"
                        type="text"
                        placeholder="e.g. Vedic, Tarot, Numerology"
                        required
                        value={formData.specialties}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                        Bio
                    </label>
                    <div className="mt-1">
                        <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        required
                        value={formData.bio}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors"
                        />
                    </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : role === 'astrologer' ? 'Submit Application' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
