// frontend/src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../store/StoreContext';

export default function ProductsAdminRoute ({ children }) {
  const { user } = useContext(StoreContext);
  const isAdmin = user?.email === 'admin@gmail.com';

  return isAdmin ? children : <Navigate to='/' replace />;
}
