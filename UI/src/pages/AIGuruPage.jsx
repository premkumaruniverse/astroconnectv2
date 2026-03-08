import React from 'react';
import Navbar from '../components/Navbar';
import AIGuruChat from '../components/AIGuruChat';
import { useNavigate } from 'react-router-dom';

const AIGuruPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            {/* Full page container for the chat */}
            <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-64px)] flex flex-col pt-6">
                <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 relative">
                    <AIGuruChat onClose={() => navigate('/dashboard')} isPage={true} />
                </div>
            </div>
        </div>
    );
};

export default AIGuruPage;
