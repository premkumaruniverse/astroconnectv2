import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { features } from '../services/api';
import { SparklesIcon, BriefcaseIcon, HeartIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const CATEGORY_CONFIG = {
  career: {
    title: "Career Insights",
    icon: BriefcaseIcon,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  "mental-health": {
    title: "Mental Health Guidance",
    icon: SparklesIcon,
    color: "text-teal-600",
    bgColor: "bg-teal-100"
  },
  love: {
    title: "Love & Relationships",
    icon: HeartIcon,
    color: "text-rose-600",
    bgColor: "bg-rose-100"
  },
  education: {
    title: "Education & Learning",
    icon: AcademicCapIcon,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  }
};

const InsightPage = ({ category }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const config = CATEGORY_CONFIG[category] || {
    title: "Astrological Insight",
    icon: SparklesIcon,
    color: "text-amber-600",
    bgColor: "bg-amber-100"
  };

  const Icon = config.icon;

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setLoading(true);
        const response = await features.getInsight(category);
        setInsight(response.data);
      } catch (error) {
        console.error("Failed to fetch insight", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchInsight();
    }
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className={`${config.bgColor} p-8 text-center`}>
            <div className={`mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm`}>
              <Icon className={`h-10 w-10 ${config.color}`} />
            </div>
            <h1 className={`text-3xl font-bold ${config.color} mb-2`}>
              {config.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Daily Astrological Guidance
            </p>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-amber-50 dark:bg-slate-700/50 rounded-xl p-6 border border-amber-100 dark:border-slate-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 text-amber-500 mr-2" />
                    Your Reading for Today
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight?.insight || "Stars are aligning to bring you clarity. Check back later for more detailed insights."}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Lucky Color</h4>
                    <p className="text-gray-600 dark:text-gray-400">Blue & Gold</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Lucky Number</h4>
                    <p className="text-gray-600 dark:text-gray-400">7, 12, 21</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 text-center">
               <button 
                 onClick={() => window.history.back()}
                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
               >
                 ← Back to Dashboard
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightPage;
