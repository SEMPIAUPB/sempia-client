import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginRequest } from '../../services/contracts';
import { authService } from '../../services/api/authService';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginView() {
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setErrorMsg('');
      const tokens = await authService.login(data);
      // Wait, getProfile requires token attached, which is handled by axios interceptor once setAuth is called.
      // But Zustand store update is synchronous. We must update the store first.
      useAuthStore.getState().setAuth(tokens.access, tokens.refresh, null as any); // Temporarily set null user
      
      const user = await authService.getProfile();
      setAuth(tokens.access, tokens.refresh, user);
      
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Credenciales inválidas o error en el servidor');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-center text-xl font-bold text-brand-black">
          Inicia sesión
        </h2>
        <p className="mt-1 text-center text-sm text-brand-gray">
          O <Link to="/auth/register" className="font-semibold text-brand-blue hover:text-brand-600 transition-colors">crea tu cuenta gratis</Link>
        </p>
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center" role="alert">{errorMsg}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario o Correo</label>
            <input 
              {...register("username")}
              type="text" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="tu@correo.com" 
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              {...register("password")}
              type="password" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="••••••••" 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
        </div>
        <div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'shadow-md'}`}>
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}
