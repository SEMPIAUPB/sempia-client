import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, User, Loader2, AlertCircle } from 'lucide-react';
import { gamificationService } from '../../services/api/gamificationService';
import type { GamificationProfile } from '../../services/api/gamificationService';

export default function RankingView() {
  const { data: ranking, isLoading, isError } = useQuery<GamificationProfile[]>({
    queryKey: ['ranking'],
    queryFn: () => gamificationService.getRanking(),
  });

  const getPositionIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-gray-500 font-bold text-lg">{index + 1}</span>;
    }
  };

  const getRowStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500";
      case 1: return "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400";
      case 2: return "bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-600";
      default: return "hover:bg-brand-light border-l-4 border-transparent";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <span className="ml-3 text-brand-gray font-medium">Cargando clasificación...</span>
      </div>
    );
  }

  if (isError || !ranking) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <span className="font-medium">Error al cargar el ranking.</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-soft border border-brand-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light text-brand-blue mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-brand-black mb-2">Clasificación General</h1>
        <p className="text-brand-gray">
          Compara tu rendimiento, puntos y rachas con otros estudiantes de SEMPIA.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 text-center">
                  Posición
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Puntaje
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Racha Más Alta
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.map((profile, idx) => (
                <tr key={profile.id} className={`transition-colors ${getRowStyle(idx)}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      {getPositionIcon(idx)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
                        {profile.user?.username?.substring(0, 2).toUpperCase() || <User className="w-5 h-5" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{profile.user?.full_name}</div>
                        <div className="text-sm text-gray-500">@{profile.user?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Nivel {profile.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {profile.points} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.highest_streak} días
                  </td>
                </tr>
              ))}
              
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aún no hay usuarios en el ranking. ¡Sé el primero en resolver un ejercicio!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
