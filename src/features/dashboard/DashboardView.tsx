import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Code, Activity, Target, Zap, Trophy, TrendingUp, Lock } from 'lucide-react';
import GraphVisualization from '../skills/GraphVisualization';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/api/dashboardService';
import { gamificationService } from '../../services/api/gamificationService';
import { skillsService } from '../../services/api/skillsService';

export default function DashboardView() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommended-exercises'],
    queryFn: skillsService.getRecommendedExercises
  });

  const { data: achievements } = useQuery({
    queryKey: ['recent-achievements'],
    queryFn: gamificationService.getAchievements
  });

  const m = metrics?.learning_metrics;
  const g = metrics?.gamification;
  const skills = metrics?.top_skills || [];
  const recentAchievements = achievements ? achievements.filter((a: any) => a.is_unlocked).slice(0, 2) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Section: Profile and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Profile Card */}
        <div className="bg-white rounded-xl shadow-soft p-6 flex flex-col items-center text-center h-full justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold ring-4 ring-[var(--color-bg-light)] shadow-md">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded-full ring-2 ring-[var(--color-bg-light)]">
              Lv. {g?.level || 1}
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-brand-black">{user?.full_name || 'Estudiante'}</h2>
          <p className="text-sm text-brand-gray">@{user?.username || 'usuario'}</p>
          
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs text-brand-gray mb-1">
              <span>XP: {g?.points || 0}</span>
              <span>Siguiente: {g?.next_level_points || 100}</span>
            </div>
            <div className="w-full bg-brand-border rounded-full h-3">
              <div className="bg-brand-purple h-3 rounded-full transition-all duration-1000" style={{ width: `${g?.progress_percentage || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Learning Analytics Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6 h-full flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-brand-black mb-4">Métricas de Aprendizaje</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Code className="h-6 w-6 text-brand-blue mb-2" />
              <span className="text-2xl font-bold text-brand-black">{m?.problems_solved || 0}</span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Problemas</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Target className="h-6 w-6 text-brand-red mb-2" />
              <span className="text-2xl font-bold text-brand-black">{m?.success_rate || 0}%</span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Tasa de Éxito</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Zap className="h-6 w-6 text-brand-yellow mb-2" />
              <span className="text-2xl font-bold text-brand-black">{m?.current_streak || 0} <span className="text-sm font-normal">días</span></span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Racha Actual</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Activity className="h-6 w-6 text-brand-purple mb-2" />
              <span className="text-2xl font-bold text-brand-black">{m?.training_hours || 0} <span className="text-sm font-normal">hrs</span></span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Entrenamiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Skills and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Skills Progress */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4">Dominio de Habilidades</h3>
          <div className="space-y-4">
            {skills.length === 0 ? (
              <p className="text-sm text-brand-gray text-center py-4">Aún no hay progreso en habilidades.</p>
            ) : (
              skills.map((skill: any, idx: number) => {
                const colors = ['bg-brand-blue', 'bg-brand-purple', 'bg-brand-yellow', 'bg-brand-red', 'bg-brand-black'];
                return (
                  <SkillBar key={skill.name} name={skill.name} percentage={skill.percentage} color={colors[idx % colors.length]} />
                );
              })
            )}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-brand-blue" />
            Recomendaciones para ti
          </h3>
          <div className="space-y-3">
            {!recommended || recommended.length === 0 ? (
              <p className="text-sm text-brand-gray text-center py-4">No hay recomendaciones disponibles por ahora.</p>
            ) : (
              recommended.slice(0,3).map((rec: any) => (
                <div key={rec.id} onClick={() => navigate(`/dashboard/exercise/${rec.stable_id}`)}>
                  <RecommendationCard 
                    title={rec.title} 
                    difficulty={`${rec.difficulty} pts`}
                    match="Coincidencia Ideal" 
                    reason={`Recomendado para mejorar en: ${rec.skills?.[0]?.name || 'Algoritmia'}`}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Knowledge Graph Full-Width Section */}
      <div className="w-full h-[700px] bg-white rounded-xl shadow-soft p-6 flex flex-col relative overflow-hidden">
        <h3 className="text-lg font-semibold text-brand-black mb-4 flex items-center z-10 bg-white bg-opacity-80 p-2 rounded-md w-fit">
          <TrendingUp className="h-5 w-5 mr-2 text-brand-purple" />
          Mapa de Conocimiento
        </h3>
        <div className="absolute inset-0 top-20">
          <GraphVisualization />
        </div>
      </div>

      {/* Gamification Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-brand-yellow" />
            Logros Recientes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-brand-gray col-span-2 text-center py-4">Aún no has desbloqueado logros.</p>
            ) : (
              recentAchievements.map((ua: any) => (
                <div key={ua.id} className="flex items-center p-3 border border-brand-border rounded-lg bg-white">
                  <div className="bg-brand-purple bg-opacity-10 p-2 rounded-full mr-3 shrink-0">
                    {ua.image_url && !imgError[ua.id] ? (
                      <img 
                        src={ua.image_url} 
                        alt={ua.title} 
                        className="w-8 h-8 rounded-full object-cover" 
                        onError={() => setImgError(prev => ({...prev, [ua.id]: true}))}
                      />
                    ) : (
                      <Trophy className="h-6 w-6 text-brand-purple" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-black text-sm leading-tight">{ua.title}</p>
                    <p className="text-xs text-brand-gray mt-0.5 line-clamp-2">{ua.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => navigate('/dashboard/achievements')}
            className="w-full mt-4 py-2 text-sm text-brand-blue font-semibold hover:underline"
          >
            Ver todas las insignias
          </button>
        </div>
      </div>
      
    </div>
  );
}

function SkillBar({ name, percentage, color }: { name: string, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-brand-black">{name}</span>
        <span className="text-brand-gray">{percentage}%</span>
      </div>
      <div className="w-full bg-brand-border rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function RecommendationCard({ title, difficulty, match, reason }: { title: string, difficulty: string, match: string, reason: string }) {
  return (
    <div className="flex flex-col p-3 border border-brand-border hover:border-brand-blue transition-colors rounded-lg cursor-pointer bg-brand-light">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-brand-black">{title}</span>
        <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md">{match}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-brand-gray">{reason}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${difficulty.includes('200') || difficulty.includes('300') ? 'bg-brand-yellow text-black' : difficulty.includes('400') || difficulty.includes('500') ? 'bg-brand-red text-white' : 'bg-brand-blue text-white'}`}>
          {difficulty}
        </span>
      </div>
    </div>
  );
}
