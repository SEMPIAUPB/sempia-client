import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type Register } from '../../services/contracts';
import { authService } from '../../services/api/authService';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterView() {
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      is_student: true,
      university: 'Universidad Pontificia Bolivariana'
    }
  });

  const isStudent = watch('is_student');

  const onSubmit = async (data: Register) => {
    try {
      setErrorMsg('');
      await authService.register(data);
      // Auto-login after register
      const tokens = await authService.login({ username: data.username, password: data.password });
      useAuthStore.getState().setAuth(tokens.access, tokens.refresh, null as any); 
      
      const user = await authService.getProfile();
      setAuth(tokens.access, tokens.refresh, user);
      
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data) {
        const dataErrors = error.response.data;
        const errorMessages = [];
        if (dataErrors.username) errorMessages.push('Ya existe un estudiante con este nombre de usuario.');
        if (dataErrors.email) errorMessages.push('Ya existe un estudiante con este correo electrónico.');
        
        if (errorMessages.length > 0) {
          setErrorMsg(errorMessages.join(' '));
        } else {
          setErrorMsg(Object.values(dataErrors).flat().join(' ') || 'Error al registrar el usuario');
        }
      } else {
        setErrorMsg('Error de conexión o problema en el servidor');
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-center text-xl font-bold text-brand-black">
          Crea tu cuenta
        </h2>
        <p className="mt-1 text-center text-sm text-brand-gray">
          O <Link to="/auth/login" className="font-semibold text-brand-blue hover:text-brand-600 transition-colors">inicia sesión aquí</Link>
        </p>
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center" role="alert">{errorMsg}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              {...register("full_name")}
              type="text" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="Juan Pérez" 
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <input 
              {...register("username")}
              type="text" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="jperez123" 
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              {...register("email")}
              type="email" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="correo@ejemplo.com" 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              {...register("password")}
              type="password" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
              placeholder="Mínimo 8 caracteres" 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input 
              {...register("birth_date")}
              type="date" 
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
            />
            {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date.message}</p>}
          </div>

          <div className="flex items-center">
            <input
              {...register("is_student")}
              type="checkbox"
              id="is_student"
              className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
            />
            <label htmlFor="is_student" className="ml-2 block text-sm text-gray-900">
              Soy estudiante
            </label>
          </div>

          {isStudent && (
            <div className="space-y-4 border-l-2 border-brand-blue pl-4 pt-2 pb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
                <input 
                  {...register("university")}
                  type="text" 
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre en curso</label>
                <input 
                  {...register("current_semester")}
                  type="number" 
                  min="1" max="20"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
                  placeholder="Ej: 5" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facultad</label>
                <input 
                  {...register("faculty")}
                  type="text" 
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow" 
                  placeholder="Ej: Ingeniería" 
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-start">
              <input
                {...register("accept_policies")}
                type="checkbox"
                id="accept_policies"
                className="mt-1 h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
              />
              <label htmlFor="accept_policies" className="ml-2 block text-sm text-gray-700">
                Acepto las políticas de tratamiento de datos y autorizo el uso de mi información para fines estadísticos de la plataforma.
              </label>
            </div>
            {errors.accept_policies && <p className="text-red-500 text-xs mt-1">{errors.accept_policies.message}</p>}
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'shadow-md'}`}>
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  );
}
