import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Code2, Map, Network, Trophy, Medal, BarChart3, User, Bell, LogOut, History, Menu, Brain, Moon, Sun, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardLayout() {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    if (location.pathname.includes('/dashboard/exercise/')) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [location.pathname]);

  const { data: progressData } = useQuery({
    queryKey: ['skillProgress'],
    queryFn: async () => {
      const { apiClient } = await import('../services/api/apiClient');
      const res = await apiClient.get<any[]>('/skills/progress/');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  let showDiagnosticBanner = false;
  if (progressData) {
    const dataArr = Array.isArray(progressData) ? progressData : (progressData.results || []);
    if (dataArr.length > 0) {
      const isInitialized = dataArr.some((p: any) => p.is_initialized);
      if (!isInitialized && location.pathname !== '/diagnostic') {
        showDiagnosticBanner = true;
      }
    }
  }

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        const { authService } = await import('../services/api/authService');
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout API failed', error);
      }
    }
    useAuthStore.getState().clearAuth();
    window.location.href = '/auth/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'ADMIN_TEACHER', 'SUPER_ADMIN'] },
    { name: 'Problemas', path: '/dashboard/problems', icon: Code2, roles: ['STUDENT', 'ADMIN_TEACHER', 'SUPER_ADMIN'] },
    { name: 'Historial de Envíos', path: '/dashboard/submissions', icon: History, roles: ['STUDENT', 'ADMIN_TEACHER', 'SUPER_ADMIN'] },
    { name: 'Ruta de Aprendizaje', path: '/dashboard/path', icon: Map, roles: ['STUDENT'] },
    { name: 'Grafo de Habilidades', path: '/dashboard/skills', icon: Network, roles: ['STUDENT'] },
    { name: 'Competiciones', path: '/dashboard/competitions', icon: Trophy, roles: ['STUDENT'] },
    { name: 'Logros', path: '/dashboard/achievements', icon: Medal, roles: ['STUDENT'] },
    { name: 'Ranking', path: '/dashboard/ranking', icon: BarChart3, roles: ['STUDENT', 'ADMIN_TEACHER', 'SUPER_ADMIN'] },
    { name: 'Administración', path: '/dashboard/admin', icon: Settings, roles: ['ADMIN_TEACHER', 'SUPER_ADMIN'] },
    { name: 'Perfil', path: '/dashboard/profile', icon: User, roles: ['STUDENT', 'ADMIN_TEACHER', 'SUPER_ADMIN'] },
  ].filter(item => item.roles.includes(user?.role || 'STUDENT'));

  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans text-brand-black">
      
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white shadow-sm border-b border-brand-border flex items-center justify-between px-6 z-10 sticky top-0 transition-colors">
        <div className="flex items-center">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="mr-4 text-brand-gray hover:text-brand-blue transition-colors focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="w-8 h-8 rounded-md bg-brand-blue flex items-center justify-center mr-3">
             <span className="text-white font-bold text-lg leading-none">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-brand-blue">SEMPIA</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-brand-gray hover:text-brand-blue transition-colors p-1"
            title="Alternar tema"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-brand-gray hover:text-brand-blue transition-colors relative p-1"
            >
              <Bell className="h-5 w-5" />
            </button>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-soft-lg py-2 z-50 border border-brand-border">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-sm font-semibold text-brand-black">Notificaciones</p>
                  </div>
                  <div className="px-4 py-6 text-center text-brand-gray text-sm">
                    No tienes notificaciones nuevas.
                  </div>
                </div>
              </>
            )}
          </div>
          
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
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-brand-border overflow-y-auto transition-all duration-300 ease-in-out`}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 text-brand-blue'
                      : 'text-brand-gray hover:bg-brand-light hover:text-brand-black'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-blue' : 'text-brand-gray'} ${!isSidebarCollapsed && 'mr-3'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {showDiagnosticBanner && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mr-4 shadow-inner">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">¡Comienza tu Ruta de Aprendizaje!</h3>
                  <p className="text-sm text-gray-600">
                    Aún no has realizado el examen diagnóstico. Aunque puedes usar la plataforma libremente, te recomendamos hacerlo para adaptar la ruta a tus conocimientos.
                  </p>
                </div>
              </div>
              <Link
                to="/diagnostic"
                className="whitespace-nowrap px-6 py-2.5 bg-brand-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                Realizar Diagnóstico
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
