import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, ShareIcon } from '@heroicons/react/24/outline';
import { features } from '../services/api';
import Navbar from '../components/Navbar';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await features.getNewsById(id);
        setArticle(response.data);
      } catch (err) {
        console.error("Failed to fetch article", err);
        setError("Failed to load article. It may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 text-lg mb-4">{error || "Article not found"}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-emerald-500 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {article.image_url && (
            <div className="w-full h-64 md:h-96 relative">
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(article.created_at).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <button 
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Share article"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <div className="text-lg text-gray-600 dark:text-gray-300 mb-8 italic border-l-4 border-emerald-500 pl-4 py-1">
                {article.summary}
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default ArticleDetailPage;
