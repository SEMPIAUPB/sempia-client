import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light"
      style={{
        backgroundImage: `radial-gradient(var(--color-brand-border) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}
    >
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-soft">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-brand-blue flex items-center justify-center mb-3 shadow-md">
             <span className="text-white font-extrabold text-2xl leading-none">S</span>
          </div>
          <h1 className="text-3xl font-black tracking-wider text-brand-blue">SEMPIA</h1>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
