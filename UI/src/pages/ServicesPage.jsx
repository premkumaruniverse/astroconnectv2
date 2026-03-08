import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  HeartIcon,
  BriefcaseIcon,
  SparklesIcon,
  CalendarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { features } from '../services/api';

const ICON_MAP = {
  "HeartIcon": HeartIcon,
  "BriefcaseIcon": BriefcaseIcon,
  "SparklesIcon": SparklesIcon,
  "CalendarIcon": CalendarIcon,
  "AcademicCapIcon": AcademicCapIcon,
  "DocumentTextIcon": DocumentTextIcon,
  "UserGroupIcon": UserGroupIcon
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await features.getServices();
        setServices(response.data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIcon = (iconName) => {
    return ICON_MAP[iconName] || SparklesIcon;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Vedic Services</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Unlock the secrets of your destiny with our curated range of professional astrological consultations and services.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = getIcon(service.icon_name);
              // Extract colors from the service.color (e.g., "bg-amber-500") if possible or use defaults
              const colorBase = service.color?.split('-')[1] || 'amber';

              return (
                <div
                  key={service.id}
                  onClick={() => navigate(service.link)}
                  className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-slate-700 h-full flex flex-col overflow-hidden"
                >
                  {/* Card Background Accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-${colorBase}-500/10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>

                  <div className="p-8 relative flex-1">
                    {/* Icon Container */}
                    <div className={`w-16 h-16 rounded-2xl bg-${colorBase}-500 bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`h-8 w-8 text-${colorBase}-600 dark:text-${colorBase}-400 group-hover:rotate-12 transition-transform duration-500`} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-amber-500 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm lg:text-base">
                      {service.description}
                    </p>
                  </div>

                  {/* Decorative Footer */}
                  <div className="h-2 w-full bg-gradient-to-r from-transparent via-gray-100 dark:via-slate-700 to-transparent"></div>

                  <div className="p-6 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <span className={`text-${colorBase}-600 dark:text-${colorBase}-400 font-bold text-sm tracking-wider uppercase`}>
                      Explore Service
                    </span>
                    <div className={`w-10 h-10 rounded-full bg-${colorBase}-500 text-white flex items-center justify-center shadow-lg transform group-hover:translate-x-2 transition-transform duration-300`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
