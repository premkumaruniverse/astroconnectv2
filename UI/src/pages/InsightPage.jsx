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
              <div className="space-y-8">
                {/* Overview Section */}
                <div className="bg-amber-50/50 dark:bg-slate-700/30 rounded-2xl p-6 border border-amber-100 dark:border-slate-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <SparklesIcon className="h-5 w-5 text-amber-500 mr-2" />
                    {insight?.title || "Today's Guidance"}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg italic">
                    {insight?.overview || "The cosmic alignments today suggest a time for reflection and intentional movement."}
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="prose dark:prose-invert max-w-none">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Deep Analysis</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {insight?.detailed_analysis || insight?.insight || "The stars are in a unique position today, favoring internal growth over external expansion. Focus on your core values."}
                  </p>
                </div>

                {/* Key Takeaways */}
                {insight?.key_takeaways && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insight.key_takeaways.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{point}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Spiritual Remedy */}
                {insight?.spiritual_remedy && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-indigo-800/30">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5" />
                      Spiritual Remedy
                    </h4>
                    <p className="text-indigo-700 dark:text-indigo-400 italic">
                      {insight.spiritual_remedy}
                    </p>
                  </div>
                )}

                {/* Lucky Factors */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Color</span>
                    <span className="font-bold text-gray-900 dark:text-white capitalize">{insight?.lucky_factors?.color || "Gold"}</span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Number</span>
                    <span className="font-bold text-gray-900 dark:text-white">{insight?.lucky_factors?.number || "7"}</span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Direction</span>
                    <span className="font-bold text-gray-900 dark:text-white">{insight?.lucky_factors?.direction || "North"}</span>
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
