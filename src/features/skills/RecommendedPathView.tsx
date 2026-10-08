import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Map, Loader2, AlertCircle, Sparkles, Brain, Code2, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';

interface Exercise {
  id: number;
  stable_id: string;
  title: string;
  difficulty: number;
  skills: any[];
}

export default function RecommendedPathView() {
  const navigate = useNavigate();
  const { data: exercises, isLoading, isError } = useQuery<Exercise[]>({
    queryKey: ['recommendedExercises'],
    queryFn: async () => {
      const res = await apiClient.get<Exercise[]>('/skills/recommended/');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <span className="ml-3 text-brand-gray font-medium">Calculando tu ruta óptima...</span>
      </div>
    );
  }

  if (isError || !exercises) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <span className="font-medium">Error al cargar las recomendaciones.</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-brand-purple to-brand-blue p-8 rounded-xl shadow-lg text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Map className="w-10 h-10" />
          <h1 className="text-3xl font-bold">Ruta de Aprendizaje</h1>
        </div>
        <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
          El motor DKT ha analizado tu nivel en el grafo de habilidades. Aquí tienes los ejercicios que te llevarán al siguiente nivel sin frustrarte ni aburrirte.
        </p>
        <button 
          onClick={() => navigate('/diagnostic')}
          className="mt-6 px-6 py-2 bg-white text-brand-blue font-bold rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Brain className="w-4 h-4 inline mr-2" />
          Volver a tomar Diagnóstico
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-black flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
          Recomendados para ti
        </h2>
        
        {exercises.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft border border-brand-border p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Felicidades!</h3>
            <p className="text-gray-500">Parece que has dominado todas las habilidades base. Ve al catálogo para buscar retos más difíciles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{exercise.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      exercise.difficulty <= 100 ? 'bg-green-100 text-green-800' :
                      exercise.difficulty <= 300 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {exercise.difficulty} pts
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Recomendado basado en tu grafo de progreso actual.</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => navigate(`/dashboard/exercise/${exercise.stable_id}`)}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Resolver
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
