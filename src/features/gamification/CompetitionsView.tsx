import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Clock, Calendar, CheckCircle, ArrowRight, Loader2, AlertCircle, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gamificationService } from '../../services/api/gamificationService';
import type { Challenge } from '../../services/api/gamificationService';

export default function CompetitionsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading, isError } = useQuery<Challenge[]>({
    queryKey: ['activeChallenges'],
    queryFn: () => gamificationService.getActiveChallenges(),
  });

  const joinMutation = useMutation({
    mutationFn: (challengeId: string) => gamificationService.joinChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <span className="ml-3 text-brand-gray font-medium">Cargando retos...</span>
      </div>
    );
  }

  if (isError || !challenges) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <span className="font-medium">Error al cargar los retos semanales.</span>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-8 rounded-xl shadow-lg text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Trophy className="w-10 h-10 text-yellow-300" />
          <h1 className="text-3xl font-bold">Retos Semanales</h1>
        </div>
        <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
          Pon a prueba tus habilidades compitiendo en tiempo real contra otros estudiantes. 
          Resuelve los ejercicios seleccionados antes de que termine el tiempo y gana puntos extra para el ranking.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-black">Retos Activos</h2>
        
        {challenges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft border border-brand-border p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay retos activos</h3>
            <p className="text-gray-500">Mantente atento, pronto publicaremos el próximo reto semanal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full animate-pulse">
                      ¡En Vivo!
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-3">{challenge.description}</p>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-brand-blue" />
                      <strong>Inicio:</strong> <span className="ml-2">{formatDate(challenge.start_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-brand-red" />
                      <strong>Cierre:</strong> <span className="ml-2">{formatDate(challenge.end_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Code2 className="w-4 h-4 mr-2 text-brand-purple" />
                      <strong>Ejercicios:</strong> <span className="ml-2">{challenge.exercises.length} disponibles</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-brand-border flex gap-3">
                  <button 
                    onClick={() => {
                      // Attempt to join. If it fails because already joined, we catch it or ignore.
                      joinMutation.mutate(challenge.stable_id);
                      alert("Te has unido al reto exitosamente. ¡A programar!");
                    }}
                    disabled={joinMutation.isPending}
                    className="flex-1 flex justify-center items-center px-4 py-2 bg-white border border-brand-blue text-brand-blue font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Participar
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/problems')} // In a real app, filter problems by challenge ID
                    className="flex-1 flex justify-center items-center px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ir a Ejercicios
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
