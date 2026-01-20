import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  BriefcaseIcon, 
  SparklesIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our wide range of astrological services designed to guide you through every aspect of life.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service) => {
              const Icon = getIcon(service.icon_name);
              return (
                <Link 
                  key={service.id} 
                  to={service.link}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-gray-700 flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
