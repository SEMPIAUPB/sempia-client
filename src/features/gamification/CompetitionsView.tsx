import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Code2, 
  Users, 
  Flame, 
  CheckCircle2, 
  Swords, 
  ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gamificationService } from '../../services/api/gamificationService';
import type { Challenge, ChallengeExercise } from '../../services/api/gamificationService';

export default function CompetitionsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState<'exercises' | 'leaderboard'>('exercises');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: challenges, isLoading, isError } = useQuery<Challenge[]>({
    queryKey: ['activeChallenges'],
    queryFn: () => gamificationService.getActiveChallenges(),
  });

  // Keep selectedChallenge in sync with fresh query data
  const currentChallenge = challenges?.find(c => c.stable_id === selectedChallenge?.stable_id) || selectedChallenge;

  const joinMutation = useMutation({
    mutationFn: (challengeId: string) => gamificationService.joinChallenge(challengeId),
    onSuccess: (data, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
      showToast(data.message || "¡Te has registrado en el reto exitosamente!", "success");
      // If user joined from card, auto-select it into arena
      const joined = challenges?.find(c => c.stable_id === challengeId);
      if (joined) {
        setSelectedChallenge(joined);
      }
    },
    onError: () => {
      showToast("Ocurrió un error al unirte al reto.", "error");
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

  const getTimeRemainingText = (endDateString: string) => {
    const diff = new Date(endDateString).getTime() - Date.now();
    if (diff <= 0) return 'Finalizado';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} días y ${hours} horas restantes`;
    return `${hours} horas restantes`;
  };

  // Handler for Entering Competition
  const handleEnterChallenge = (challenge: Challenge) => {
    if (!challenge.is_joined) {
      // Auto-join upon entering
      joinMutation.mutate(challenge.stable_id);
    }
    setSelectedChallenge(challenge);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-purple p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center space-x-4 mb-4 relative z-10">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <Trophy className="w-9 h-9 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Arena de Competiciones</h1>
            <p className="text-blue-100 text-sm mt-0.5">Retos semanales y maratones algorítmicas universitarias</p>
          </div>
        </div>
        <p className="text-blue-100 max-w-3xl text-base leading-relaxed relative z-10">
          Demuestra tu velocidad y precisión resolviendo problemas en tiempo real contra tus compañeros de ingeniería. 
          Gana puntos para la clasificación general, sube de nivel y desbloquea insignias exclusivas de gladiador.
        </p>
      </div>

      {/* View Mode: If a Challenge is Selected, Show Arena Detail */}
      {currentChallenge ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back button and navigation breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-blue-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-brand-border transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a todos los retos
            </button>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                currentChallenge.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800 animate-pulse' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentChallenge.status === 'ACTIVE' ? '¡Competición En Vivo!' : 'Próximamente'}
              </span>
              {currentChallenge.is_joined && (
                <span className="px-3 py-1 bg-purple-100 text-brand-purple text-xs font-bold rounded-full flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Inscrito
                </span>
              )}
            </div>
          </div>

          {/* Arena Header Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-brand-border p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-brand-border">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Swords className="w-7 h-7 text-brand-blue" />
                  <h2 className="text-2xl md:text-3xl font-extrabold text-brand-black">{currentChallenge.title}</h2>
                </div>
                <p className="text-gray-600 max-w-2xl leading-relaxed text-sm md:text-base">
                  {currentChallenge.description}
                </p>
              </div>

              {/* Stats Box */}
              <div className="flex flex-wrap items-center gap-4 bg-brand-light p-4 rounded-xl border border-brand-border">
                <div className="text-center px-3">
                  <span className="block text-xs uppercase text-brand-gray font-semibold">Tu Puntaje</span>
                  <span className="text-2xl font-black text-brand-purple">{currentChallenge.user_score || 0} pts</span>
                </div>
                <div className="w-px h-10 bg-brand-border"></div>
                <div className="text-center px-3">
                  <span className="block text-xs uppercase text-brand-gray font-semibold">Participantes</span>
                  <span className="text-2xl font-black text-brand-blue">{currentChallenge.participants_count || 0}</span>
                </div>
                <div className="w-px h-10 bg-brand-border"></div>
                <div className="text-center px-3">
                  <span className="block text-xs uppercase text-brand-gray font-semibold">Ejercicios</span>
                  <span className="text-2xl font-black text-brand-black">{(currentChallenge.exercises || []).length}</span>
                </div>
              </div>
            </div>

            {/* Time & Timing details */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-brand-blue" />
                <span><strong>Inicio:</strong> {formatDate(currentChallenge.start_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-brand-red" />
                <span><strong>Cierre:</strong> {formatDate(currentChallenge.end_date)}</span>
              </div>
              {currentChallenge.status === 'ACTIVE' && (
                <div className="flex items-center font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Flame className="w-4 h-4 mr-1 text-amber-500" />
                  {getTimeRemainingText(currentChallenge.end_date)}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs inside the Arena */}
          <div className="flex border-b border-brand-border space-x-4">
            <button
              onClick={() => setActiveTab('exercises')}
              className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
                activeTab === 'exercises'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Problemas del Reto ({(currentChallenge.exercises || []).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
                activeTab === 'leaderboard'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Clasificación en Vivo ({(currentChallenge.leaderboard || []).length})</span>
            </button>
          </div>

          {/* Tab 1: Exercises */}
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              {(!currentChallenge.exercises || currentChallenge.exercises.length === 0) ? (
                <div className="bg-white rounded-xl p-8 text-center border border-brand-border text-gray-500">
                  No hay ejercicios configurados para este reto todavía.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentChallenge.exercises.map((ex: ChallengeExercise, index: number) => (
                    <div 
                      key={ex.id || ex.stable_id} 
                      className={`bg-white rounded-xl shadow-soft border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                        ex.is_solved ? 'border-green-300 bg-green-50/20' : 'border-brand-border'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-brand-blue font-bold text-xs flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <h3 className="text-lg font-bold text-brand-black">{ex.title}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-brand-purple">
                            {ex.difficulty} pts
                          </span>
                          {ex.is_solved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Resuelto
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              Pendiente
                            </span>
                          )}
                        </div>
                        {ex.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 pl-10">
                            {ex.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center">
                        <button
                          onClick={() => navigate(`/dashboard/exercise/${ex.stable_id}`)}
                          className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                            ex.is_solved 
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                              : 'bg-brand-blue hover:bg-blue-700 text-white shadow-md'
                          }`}
                        >
                          <span>{ex.is_solved ? 'Volver a Resolver' : 'Resolver Problema'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Live Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl shadow-soft border border-brand-border overflow-hidden">
              <div className="p-5 border-b border-brand-border bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-brand-black text-lg">Tabla de Clasificación del Reto</h3>
                  <p className="text-xs text-gray-500">Puntaje acumulado por los participantes en este reto</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-brand-blue">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Actualización en tiempo real</span>
                </div>
              </div>

              {(!currentChallenge.leaderboard || currentChallenge.leaderboard.length === 0) ? (
                <div className="p-8 text-center text-gray-500">
                  Aún no hay puntuaciones registradas en esta competición. ¡Sé el primero en resolver un ejercicio!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20">
                          Posición
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Puntuación
                        </th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentChallenge.leaderboard.map((item, idx) => {
                        const getPositionMedal = (pos: number) => {
                          if (pos === 1) return <span className="text-xl">🥇</span>;
                          if (pos === 2) return <span className="text-xl">🥈</span>;
                          if (pos === 3) return <span className="text-xl">🥉</span>;
                          return <span className="font-bold text-gray-500 text-sm">{pos}</span>;
                        };

                        return (
                          <tr key={item.username} className={`hover:bg-blue-50/40 transition-colors ${
                            idx === 0 ? 'bg-amber-50/30' : ''
                          }`}>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {getPositionMedal(item.rank || idx + 1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs uppercase">
                                  {item.username.substring(0, 2)}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{item.full_name || item.username}</div>
                                  <div className="text-xs text-gray-500">@{item.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-base font-extrabold text-brand-purple">
                                {item.score} pts
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500">
                              {new Date(item.joined_at).toLocaleDateString('es-ES', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* List Mode: Shows Cards for Current Week and Next Week */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-black">Calendario de Competiciones</h2>
              <p className="text-sm text-gray-500">Retos activos para esta semana y programados para la próxima semana</p>
            </div>
          </div>
          
          {challenges.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft border border-brand-border p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay retos programados</h3>
              <p className="text-gray-500">Mantente atento, pronto publicaremos los nuevos retos semanales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge) => {
                const isUpcoming = challenge.status === 'UPCOMING' || new Date(challenge.start_date) > new Date();
                const isJoined = challenge.is_joined;

                return (
                  <div 
                    key={challenge.stable_id || challenge.id} 
                    className="bg-white rounded-2xl shadow-soft border border-brand-border overflow-hidden flex flex-col hover:shadow-lg transition-all border-t-4 border-t-brand-blue"
                  >
                    <div className="p-6 md:p-7 flex-1 space-y-4">
                      
                      {/* Badge Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                            {isUpcoming ? 'Próxima Semana' : 'Semana Actual'}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 leading-snug">{challenge.title}</h3>
                        </div>
                        {isUpcoming ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full shrink-0">
                            Próximamente
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full flex items-center shrink-0">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping mr-1.5 inline-block"></span>
                            ¡En Vivo!
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {challenge.description}
                      </p>
                    
                      {/* Metadata Box */}
                      <div className="space-y-2.5 bg-brand-light p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2.5 text-brand-blue shrink-0" />
                          <strong className="mr-1">Inicio:</strong> <span>{formatDate(challenge.start_date)}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2.5 text-brand-red shrink-0" />
                          <strong className="mr-1">Cierre:</strong> <span>{formatDate(challenge.end_date)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Code2 className="w-4 h-4 mr-1 text-brand-purple" />
                            <span>{(challenge.exercises || []).length} ejercicios</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-brand-blue" />
                            <span>{challenge.participants_count || 0} inscritos</span>
                          </div>
                          {isJoined && (
                            <div className="flex items-center font-bold text-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              <span>Inscrito</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  
                    {/* Action Footer */}
                    <div className="p-5 bg-gray-50 border-t border-brand-border flex gap-3">
                      {!isJoined ? (
                        <button 
                          onClick={() => joinMutation.mutate(challenge.stable_id)}
                          disabled={joinMutation.isPending}
                          className="flex-1 flex justify-center items-center px-4 py-2.5 bg-white border-2 border-brand-blue text-brand-blue font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 shadow-sm text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isUpcoming ? "Pre-inscribirme" : "Inscribirme"}
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          {isUpcoming ? "Pre-inscrito" : "Inscrito en la arena"}
                        </div>
                      )}

                      <button 
                        onClick={() => handleEnterChallenge(challenge)}
                        className="flex-1 flex justify-center items-center px-4 py-2.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm"
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Entrar al Reto
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className={`px-5 py-3.5 rounded-xl shadow-xl text-white font-medium flex items-center space-x-3 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
