import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while the user session is being verified
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // If not loading and no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user is logged in but has the wrong role, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;