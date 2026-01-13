import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApplyAstrologer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to verification pending page
    navigate('/verification-pending');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
};

export default ApplyAstrologer;