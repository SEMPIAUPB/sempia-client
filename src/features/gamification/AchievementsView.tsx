import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal, Loader2, AlertCircle, Calendar, Star } from 'lucide-react';
import { gamificationService } from '../../services/api/gamificationService';
import type { UserAchievement } from '../../services/api/gamificationService';

export default function AchievementsView() {
  const { data: achievements, isLoading, isError } = useQuery<UserAchievement[]>({
    queryKey: ['achievements'],
    queryFn: () => gamificationService.getAchievements(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <span className="ml-3 text-brand-gray font-medium">Cargando logros...</span>
      </div>
    );
  }

  if (isError || !achievements) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <span className="font-medium">Error al cargar los logros.</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-xl shadow-soft border border-brand-border text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-purple bg-opacity-10 text-brand-purple mb-4">
          <Medal className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-brand-black mb-2">Mis Logros e Insignias</h1>
        <p className="text-brand-gray max-w-2xl mx-auto">
          Cada desafío superado es un paso más en tu camino. Aquí se coleccionan todas las medallas, insignias y logros que has desbloqueado resolviendo problemas.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-brand-border p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Colección ({achievements.length})</h2>
          <span className="text-sm font-medium text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
            Nivel de Experiencia: {achievements.length >= 10 ? 'Maestro' : achievements.length >= 5 ? 'Avanzado' : 'Principiante'}
          </span>
        </div>

        {achievements.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes insignias</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Empieza a resolver ejercicios de programación en el catálogo para desbloquear tu primer logro. ¡Tú puedes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((ua) => (
              <div 
                key={ua.id} 
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-brand-purple transition-all duration-300"
              >
                <div className="absolute top-4 right-4 text-xs font-bold text-brand-gray flex items-center bg-gray-50 px-2 py-1 rounded">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(ua.awarded_at).toLocaleDateString()}
                </div>
                
                <div className="mt-4 mb-5 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-1 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {ua.achievement.image_url ? (
                      <img src={ua.achievement.image_url} alt={ua.achievement.title} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Medal className="w-12 h-12 text-brand-purple" />
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{ua.achievement.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{ua.achievement.description}</p>
                  <div className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                    {ua.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
