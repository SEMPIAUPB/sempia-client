import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api/authService';
import type { User } from '../../services/contracts';

export default function ProfileView() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const updateUserStore = useAuthStore(state => state.setUser);

  // Modals state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form state - Profile
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Form state - Password
  const [passFormData, setPassFormData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      updateUserStore(data);
    } catch (err) {
      setErrorMsg('Error al cargar la información del perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditProfileOpen = () => {
    if (profile) {
      setEditFormData({
        email: profile.email,
        full_name: profile.full_name,
        birth_date: profile.birth_date,
        university: profile.university,
        current_semester: profile.current_semester,
        faculty: profile.faculty
      });
      setEditError('');
      setIsEditingProfile(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await authService.updateProfile(editFormData);
      await fetchProfile();
      setIsEditingProfile(false);
    } catch (error: any) {
      setEditError(error.response?.data?.email?.[0] || 'Ocurrió un error al actualizar el perfil.');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passFormData.new_password !== passFormData.confirm_password) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }
    setPassLoading(true);
    setPassError('');
    try {
      await authService.changePassword({
        old_password: passFormData.old_password,
        new_password: passFormData.new_password
      });
      setPassSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPassSuccess(false);
        setPassFormData({ old_password: '', new_password: '', confirm_password: '' });
      }, 2000);
    } catch (error: any) {
      setPassError(error.response?.data?.old_password?.[0] || error.response?.data?.new_password?.[0] || 'Ocurrió un error al cambiar la contraseña.');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-brand-gray">Cargando perfil...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {errorMsg}
      </div>
    );
  }

  if (!profile) return null;

  const hasAcademicInfo = profile.is_student && (profile.university || profile.current_semester || profile.faculty);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-black">Mi Perfil</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Cabecera del perfil */}
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-full bg-brand-purple flex items-center justify-center text-white text-3xl font-bold shadow-sm">
              {profile.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-brand-blue">
                {profile.role === 'SUPER_ADMIN' ? 'Super Administrador' : profile.role === 'ADMIN_TEACHER' ? 'Docente/Administrador' : 'Estudiante'}
              </div>
            </div>
          </div>

          {/* Información de la cuenta */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Información de la Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre de Usuario</label>
                <p className="mt-1 text-sm text-gray-900">{profile.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Correo Electrónico</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
              </div>
              {profile.birth_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.birth_date}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información académica (solo para estudiantes que la tengan) */}
          {hasAcademicInfo && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Información Académica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Universidad</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.university || 'No especificada'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Semestre en Curso</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.current_semester || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Facultad</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.faculty || 'No especificada'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex space-x-4">
             <button 
                onClick={handleEditProfileOpen}
                className="px-4 py-2 bg-brand-light text-brand-blue border border-brand-blue border-opacity-20 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
             >
                Actualizar Información
             </button>
             <button 
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
             >
                Cambiar Contraseña
             </button>
          </div>
        </div>
      </div>

      {/* Modal Editar Perfil */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Actualizar Información</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{editError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={editFormData.email || ''} 
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.full_name || ''} 
                  onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                />
              </div>
              {profile.is_student && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
                    <input 
                      type="text" 
                      value={editFormData.university || ''} 
                      onChange={e => setEditFormData({...editFormData, university: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                      <input 
                        type="number" 
                        min="1" max="20"
                        value={editFormData.current_semester || ''} 
                        onChange={e => setEditFormData({...editFormData, current_semester: parseInt(e.target.value) || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facultad</label>
                      <input 
                        type="text" 
                        value={editFormData.faculty || ''} 
                        onChange={e => setEditFormData({...editFormData, faculty: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="px-4 py-2 text-white bg-brand-blue hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
            </div>
            {passSuccess ? (
              <div className="p-8 text-center text-green-600 font-medium">
                ¡Contraseña actualizada exitosamente!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {passError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{passError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <input 
                    type="password" 
                    required
                    value={passFormData.old_password} 
                    onChange={e => setPassFormData({...passFormData, old_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    value={passFormData.new_password} 
                    onChange={e => setPassFormData({...passFormData, new_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    value={passFormData.confirm_password} 
                    onChange={e => setPassFormData({...passFormData, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" 
                  />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPassFormData({ old_password: '', new_password: '', confirm_password: '' });
                      setPassError('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={passLoading}
                    className="px-4 py-2 text-white bg-brand-blue hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {passLoading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
