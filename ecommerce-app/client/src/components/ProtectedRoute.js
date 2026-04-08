import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, children, requiredRole }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
