import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Code2, Map, Network, Trophy, Medal, BarChart3, User, Bell, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardLayout() {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    useAuthStore.getState().clearAuth();
    window.location.href = '/auth/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problemas', path: '/dashboard/problems', icon: Code2 },
    { name: 'Ruta de Aprendizaje', path: '/dashboard/path', icon: Map },
    { name: 'Grafo de Habilidades', path: '/dashboard/skills', icon: Network },
    { name: 'Competiciones', path: '/dashboard/competitions', icon: Trophy },
    { name: 'Logros', path: '/dashboard/achievements', icon: Medal },
    { name: 'Ranking', path: '/dashboard/ranking', icon: BarChart3 },
    { name: 'Perfil', path: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans text-brand-black">
      
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white shadow-sm border-b border-brand-border flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-brand-blue flex items-center justify-center mr-3">
             <span className="text-white font-bold text-lg leading-none">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-brand-blue">SEMPIA</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-brand-gray hover:text-brand-blue transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-brand-red rounded-full"></span>
          </button>
          <button className="text-brand-gray hover:text-brand-blue transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-medium cursor-pointer ring-2 ring-transparent hover:ring-brand-purple transition-all select-none">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-soft-lg py-1 z-50 border border-brand-border">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-sm font-medium text-brand-black truncate">{user?.full_name}</p>
                    <p className="text-xs text-brand-gray truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-brand-border overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 text-brand-blue'
                      : 'text-brand-gray hover:bg-brand-light hover:text-brand-black'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-brand-blue' : 'text-brand-gray'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
