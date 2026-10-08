import React from 'react';
import { Award, Code, Activity, Target, Zap, Trophy, TrendingUp, Lock } from 'lucide-react';
import GraphVisualization from '../skills/GraphVisualization';
import { useAuthStore } from '../../store/authStore';

export default function DashboardView() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Section: Profile and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Profile Card */}
        <div className="bg-white rounded-xl shadow-soft p-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
              Lv. 1
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-brand-black">{user?.full_name || 'Estudiante'}</h2>
          <p className="text-sm text-brand-gray">@{user?.username || 'usuario'}</p>
          
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs text-brand-gray mb-1">
              <span>XP: 2,450</span>
              <span>Siguiente: 3,000</span>
            </div>
            <div className="w-full bg-brand-border rounded-full h-3">
              <div className="bg-brand-purple h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* Learning Analytics Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4">Métricas de Aprendizaje</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Code className="h-6 w-6 text-brand-blue mb-2" />
              <span className="text-2xl font-bold text-brand-black">128</span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Problemas</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Target className="h-6 w-6 text-brand-red mb-2" />
              <span className="text-2xl font-bold text-brand-black">68%</span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Tasa de Éxito</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Zap className="h-6 w-6 text-brand-yellow mb-2" />
              <span className="text-2xl font-bold text-brand-black">12 <span className="text-sm font-normal">días</span></span>
              <span className="text-xs text-brand-gray uppercase tracking-wider">Racha Actual</span>
            </div>
            <div className="flex flex-col p-4 bg-brand-light rounded-xl">
              <Activity className="h-6 w-6 text-brand-purple mb-2" />
              <span className="text-2xl font-bold text-brand-black">14.5 <span className="text-sm font-normal">hrs</span></span>
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
            <SkillBar name="Estructuras de Datos (Arrays)" percentage={85} color="bg-brand-blue" />
            <SkillBar name="Grafos (BFS/DFS)" percentage={65} color="bg-brand-purple" />
            <SkillBar name="Árboles (Segment Tree)" percentage={50} color="bg-brand-yellow" />
            <SkillBar name="Algoritmos Golosos" percentage={75} color="bg-brand-red" />
            <SkillBar name="Programación Dinámica" percentage={40} color="bg-brand-black" />
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-brand-blue" />
            Recomendaciones para ti
          </h3>
          <div className="space-y-3">
            <RecommendationCard 
              title="Caminos Cortos (Dijkstra)" 
              difficulty="300 pts"
              match="95%" 
              reason="Para mejorar tu 65% en Grafos"
            />
            <RecommendationCard 
              title="Mochila 0-1 (Knapsack)" 
              difficulty="500 pts"
              match="88%" 
              reason="Desafío basado en Programación Dinámica"
            />
            <RecommendationCard 
              title="Rango Máximo (Segment Tree)" 
              difficulty="200 pts"
              match="82%" 
              reason="Consolida tu base de Árboles"
            />
          </div>
        </div>
      </div>

      {/* Knowledge Graph Full-Width Section */}
      <div className="w-full h-[700px]">
        <GraphVisualization />
      </div>

      {/* Gamification Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-brand-yellow" />
            Logros Recientes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 border border-brand-border rounded-lg">
              <div className="bg-brand-yellow bg-opacity-20 p-2 rounded-full mr-3">
                <Trophy className="h-6 w-6 text-brand-yellow" />
              </div>
              <div>
                <p className="font-semibold text-brand-black text-sm">Rey de los Grafos</p>
                <p className="text-xs text-brand-gray">Resuelve 10 problemas de grafos seguidos.</p>
              </div>
            </div>
            <div className="flex items-center p-3 border border-brand-border rounded-lg">
              <div className="bg-brand-red bg-opacity-20 p-2 rounded-full mr-3">
                <Zap className="h-6 w-6 text-brand-red" />
              </div>
              <div>
                <p className="font-semibold text-brand-black text-sm">Mente Veloz</p>
                <p className="text-xs text-brand-gray">Primera solución Aceptada sin Errores.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm text-brand-blue font-semibold hover:underline">
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
    <div className="flex flex-col p-3 border border-brand-border hover:border-brand-blue transition-colors rounded-lg cursor-pointer bg-brand-light bg-opacity-50">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-brand-black">{title}</span>
        <span className="text-xs font-bold text-brand-blue bg-blue-100 px-2 py-1 rounded-md">{match} Coincidencia</span>
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
