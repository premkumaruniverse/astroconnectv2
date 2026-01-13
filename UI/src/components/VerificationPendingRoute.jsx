import React from 'react';
import { Navigate } from 'react-router-dom';
import VerificationPending from '../pages/VerificationPending';

const VerificationPendingRoute = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <VerificationPending />;
};

export default VerificationPendingRoute;