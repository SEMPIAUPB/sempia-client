import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exercisesService } from '../../services/api/exercisesService';

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
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Combine tags and current input for search
  const currentSearchTerm = [...tags, inputValue].filter(t => t.trim().length > 0).join(' ');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(currentSearchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSearchTerm]);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value ? Number(e.target.value) : undefined);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const { data: exercises, isLoading, isError } = useQuery({
    queryKey: ['exercises', debouncedSearch, difficulty, page],
    queryFn: () => exercisesService.getExercises(debouncedSearch, difficulty, undefined, page),
    keepPreviousData: true,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-brand-border">
        <h1 className="text-2xl font-bold text-brand-black mb-2">Catálogo de Problemas</h1>
        <p className="text-brand-gray text-sm mb-6">
          Explora los problemas disponibles, fíltralos por dificultad o busca por título, ID y habilidades (ej. "Grafos", "Programación Dinámica").
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 flex flex-wrap items-center bg-white border border-brand-border rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent transition-shadow">
            <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
            {tags.map(tag => (
              <span key={tag} className="flex items-center bg-brand-light text-brand-blue text-xs font-medium px-2 py-1 rounded mr-2 mb-1 mt-1">
                {tag}
                <button 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-brand-blue hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[200px] border-none bg-transparent focus:ring-0 p-1 text-sm text-brand-black placeholder-gray-400 outline-none"
              placeholder={tags.length === 0 ? "Buscar por título, ID o habilidad (Presiona Enter para agregar etiqueta)..." : "Agregar otra etiqueta..."}
            />
          </div>
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-brand-gray pointer-events-none" />
            <select
              value={difficulty || ''}
              onChange={handleDifficultyChange}
              className="pl-9 pr-8 py-2 border border-brand-border rounded-lg text-sm text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer appearance-none"
            >
              <option value="">Todas las dificultades</option>
              <option value="1">Fácil</option>
              <option value="2">Medio</option>
              <option value="3">Difícil</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
          </div>
        ) : isError ? (
          <div className="p-10 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-medium">Error al cargar los problemas.</p>
          </div>
        ) : exercises?.results?.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-brand-gray opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-brand-black">No se encontraron problemas</h3>
            <p className="mt-1 text-sm text-brand-gray">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-brand-border">
              {exercises?.results?.map((exercise) => (
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
                          <span key={skill.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-purple bg-opacity-10 text-brand-purple border border-brand-purple border-opacity-20">
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

            {/* Pagination Controls */}
            <div className="bg-gray-50 px-6 py-3 border-t border-brand-border flex items-center justify-between">
              <p className="text-sm text-brand-gray">
                Mostrando página <span className="font-medium text-brand-black">{page}</span>
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!exercises?.previous}
                  className="p-2 border border-brand-border rounded bg-white text-brand-gray hover:bg-gray-50 hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!exercises?.next}
                  className="p-2 border border-brand-border rounded bg-white text-brand-gray hover:bg-gray-50 hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
