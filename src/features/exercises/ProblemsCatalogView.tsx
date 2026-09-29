import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exercisesService } from '../../services/api/exercisesService';
import type { ExerciseList } from '../../services/contracts';

const DifficultyBadge = ({ level }: { level: 1 | 2 | 3 }) => {
  const map = {
    1: { label: 'Fácil', color: 'bg-green-100 text-green-800 border-green-200' },
    2: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    3: { label: 'Difícil', color: 'bg-red-100 text-red-800 border-red-200' },
  };
  const config = map[level] || map[1];
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function ProblemsCatalogView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  // Simple debounce implementation
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: exercises, isLoading, isError } = useQuery({
    queryKey: ['exercises', debouncedSearch],
    queryFn: () => exercisesService.getExercises(debouncedSearch),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft">
        <h1 className="text-2xl font-bold text-brand-black mb-2">Catálogo de Problemas</h1>
        <p className="text-brand-gray text-sm mb-6">
          Explora los problemas disponibles, fíltralos por dificultad y mejora tus habilidades de programación competitiva.
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-brand-border rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent sm:text-sm transition-shadow"
              placeholder="Buscar problemas por título..."
            />
          </div>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-brand-border rounded-lg shadow-sm text-sm font-medium text-brand-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
            <Filter className="h-4 w-4 mr-2 text-brand-gray" />
            Filtros
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
          </div>
        ) : isError ? (
          <div className="p-10 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-medium">Error al cargar los problemas.</p>
          </div>
        ) : exercises?.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-brand-gray opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-brand-black">No se encontraron problemas</h3>
            <p className="mt-1 text-sm text-brand-gray">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {exercises?.map((exercise) => (
              <li 
                key={exercise.id} 
                className="hover:bg-brand-light transition-colors cursor-pointer group"
                onClick={() => navigate(`/dashboard/exercise/${exercise.stable_id}`)}
              >
                <div className="px-6 py-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-600 truncate">
                        {exercise.title}
                      </h3>
                      {exercise.status === 'DRAFT' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Borrador
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.skills?.map(skill => (
                        <span key={skill.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-purple bg-opacity-10 text-brand-purple">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                    <DifficultyBadge level={exercise.difficulty} />
                    <button className="text-brand-blue hover:text-brand-600 text-sm font-medium">
                      Resolver &rarr;
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
