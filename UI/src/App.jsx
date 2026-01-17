import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AstrologerDashboard from './pages/AstrologerDashboard';
import AdminPanel from './pages/AdminPanel';
import ConsultationRoom from './pages/ConsultationRoom';
import ApplyAstrologer from './pages/ApplyAstrologer';
import Wallet from './pages/Wallet';
import PanchangPage from './pages/PanchangPage';
import HoroscopePage from './pages/HoroscopePage';
import KundliPage from './pages/KundliPage';
import AstroShop from './pages/AstroShop';
import FeatureExplorePage from './pages/FeatureExplorePage';

import VerificationPendingRoute from './components/VerificationPendingRoute';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const verificationStatus = localStorage.getItem('verification_status');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on their actual role
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'astrologer') {
        if (verificationStatus === 'pending') return <Navigate to="/verification-pending" replace />;
        return <Navigate to="/astro-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Specific check for astrologers accessing their dashboard
  if (userRole === 'astrologer' && verificationStatus === 'pending') {
      return <Navigate to="/verification-pending" replace />;
  }

  return children;
};

// Smart Root Component
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const verificationStatus = localStorage.getItem('verification_status');
  
  if (token) {
     if (role === 'admin') return <Navigate to="/admin" replace />;
     if (role === 'astrologer') {
        if (verificationStatus === 'pending') return <Navigate to="/verification-pending" replace />;
        return <Navigate to="/astro-dashboard" replace />;
     }
     return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/panchang" element={<PanchangPage />} />
        <Route path="/horoscope" element={<HoroscopePage />} />
        <Route path="/kundli" element={<KundliPage />} />
        <Route path="/feature/:featureId" element={<FeatureExplorePage />} />
        <Route path="/matching" element={<Navigate to="/feature/matching" replace />} />
        <Route path="/career" element={<Navigate to="/feature/career" replace />} />
        <Route path="/mental-health" element={<Navigate to="/feature/mental-health" replace />} />
        <Route path="/today" element={<Navigate to="/feature/today" replace />} />
        <Route path="/love" element={<Navigate to="/feature/love" replace />} />
        <Route path="/education" element={<Navigate to="/feature/education" replace />} />
        <Route path="/reports" element={<Navigate to="/feature/reports" replace />} />
        <Route path="/community" element={<Navigate to="/feature/community" replace />} />
        <Route
          path="/shop"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <AstroShop />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/verification-pending" 
          element={<VerificationPendingRoute />} 
        />

        {/* User (Client) Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultation/:id" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ConsultationRoom />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultation-room/:sessionId" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer']}>
              <ConsultationRoom />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Wallet />
            </ProtectedRoute>
          } 
        />

        {/* Astrologer Routes */}
        <Route 
          path="/astro-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['astrologer']}>
              <AstrologerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/apply-astrologer" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer']}>
              <ApplyAstrologer />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
