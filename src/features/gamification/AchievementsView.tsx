import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal, Loader2, AlertCircle, Calendar, Star, Lock, Shield, Target, Award } from 'lucide-react';
import { gamificationService } from '../../services/api/gamificationService';
import type { CatalogAchievement } from '../../services/api/gamificationService';

export default function AchievementsView() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const { data: achievements, isLoading, isError } = useQuery<CatalogAchievement[]>({
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

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.is_unlocked;
    if (filter === 'locked') return !a.is_unlocked;
    return true;
  });

  const getCategory = (stableId: string) => {
    if (stableId.includes('GRAPH') || stableId.includes('DATA') || stableId.includes('DP')) {
      return { id: 'skills', label: 'Habilidades Especiales', icon: <Target className="w-5 h-5 text-red-500" /> };
    }
    if (stableId.includes('GLADIATOR')) {
      return { id: 'comp', label: 'Competencias', icon: <Shield className="w-5 h-5 text-blue-500" /> };
    }
    return { id: 'general', label: 'Generales', icon: <Award className="w-5 h-5 text-yellow-500" /> };
  };

  const grouped = filteredAchievements.reduce((acc, ach) => {
    const cat = getCategory(ach.stable_id).label;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ach);
    return acc;
  }, {} as Record<string, CatalogAchievement[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-xl shadow-soft border border-brand-border text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-purple bg-opacity-10 text-brand-purple mb-4">
          <Medal className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-brand-black mb-2">Catálogo de Logros</h1>
        <p className="text-brand-gray max-w-2xl mx-auto">
          Descubre todas las insignias disponibles en la plataforma. Completa retos y ejercicios para desbloquearlas todas.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-brand-border p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Colección</h2>
            <span className="text-sm font-medium text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
              {unlockedCount} / {achievements.length} Desbloqueados
            </span>
          </div>

          <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('unlocked')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'unlocked' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Obtenidos
            </button>
            <button 
              onClick={() => setFilter('locked')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'locked' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Faltantes
            </button>
          </div>
        </div>

        {Object.entries(grouped).length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay insignias aquí</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Intenta cambiar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([catName, achs]) => (
              <div key={catName}>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b border-gray-100 pb-2">
                  {getCategory((achs[0] || {stable_id: ''}).stable_id).icon}
                  <span className="ml-2">{catName}</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achs.map((ach) => (
                    <div 
                      key={ach.id} 
                      className={`group relative bg-white border rounded-2xl p-6 transition-all duration-300 ${
                        ach.is_unlocked 
                          ? 'border-gray-200 hover:shadow-lg hover:border-brand-purple' 
                          : 'border-dashed border-gray-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      {ach.is_unlocked ? (
                        <div className="absolute top-4 right-4 text-xs font-bold text-brand-gray flex items-center bg-gray-50 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3 mr-1" />
                          {ach.awarded_at ? new Date(ach.awarded_at).toLocaleDateString() : 'Obtenido'}
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 text-xs font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded">
                          <Lock className="w-3 h-3 mr-1" />
                          Bloqueado
                        </div>
                      )}
                      
                      <div className="mt-4 mb-5 flex justify-center">
                        <div className={`w-24 h-24 rounded-full p-1 flex items-center justify-center transition-transform duration-300 ${ach.is_unlocked ? 'bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:scale-110' : 'bg-gray-100'}`}>
                          {ach.image_url ? (
                            <img 
                              src={ach.image_url} 
                              alt={ach.title} 
                              className="w-full h-full object-cover rounded-full" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <Medal className={`w-12 h-12 ${ach.is_unlocked ? 'text-brand-purple' : 'text-gray-400'} ${ach.image_url ? 'hidden' : ''}`} />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{ach.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{ach.description}</p>
                        {ach.is_unlocked && ach.reason && (
                          <div className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                            {ach.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
