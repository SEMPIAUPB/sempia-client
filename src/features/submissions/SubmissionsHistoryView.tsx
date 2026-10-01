import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Code } from 'lucide-react';
import { submissionsService } from '../../services/api/submissionsService';
import type { Submission, PaginatedResponse } from '../../services/contracts';

export default function SubmissionsHistoryView() {
  const [data, setData] = useState<PaginatedResponse<Submission> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await submissionsService.getSubmissions(page);
        setData(response);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [page]);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'ACCEPTED':
        return 'text-green-600 font-bold';
      case 'WRONG_ANSWER':
        return 'text-red-600 font-bold';
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-orange-500 font-bold';
      case 'MEMORY_LIMIT_EXCEEDED':
        return 'text-orange-500 font-bold';
      case 'RUNTIME_ERROR':
        return 'text-purple-600 font-bold';
      case 'COMPILATION_ERROR':
        return 'text-gray-600 font-bold';
      case 'PENDING':
      case 'QUEUED':
      case 'PROCESSING':
        return 'text-blue-500 animate-pulse';
      default:
        return 'text-gray-700 font-medium';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    const map: Record<string, string> = {
      'ACCEPTED': 'Accepted',
      'WRONG_ANSWER': 'Wrong answer',
      'TIME_LIMIT_EXCEEDED': 'Time limit exceeded',
      'MEMORY_LIMIT_EXCEEDED': 'Memory limit exceeded',
      'RUNTIME_ERROR': 'Runtime error',
      'COMPILATION_ERROR': 'Compilation error',
      'PENDING': 'In queue...',
      'QUEUED': 'In queue...',
      'PROCESSING': 'Running...',
    };
    return map[verdict] || verdict;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Envíos</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa tus soluciones pasadas y veredictos del juez virtual.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Autor</th>
                <th className="px-4 py-3 font-medium">Problema</th>
                <th className="px-4 py-3 font-medium">Lenguaje</th>
                <th className="px-4 py-3 font-medium">Veredicto</th>
                <th className="px-4 py-3 font-medium text-right">Tiempo</th>
                <th className="px-4 py-3 font-medium text-right">Memoria</th>
                <th className="px-4 py-3 font-medium text-center">Código</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">Cargando envíos...</td>
                </tr>
              ) : data?.results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">No tienes envíos registrados aún.</td>
                </tr>
              ) : (
                data?.results.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{sub.id}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(sub.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-brand-black">{sub.author_username}</td>
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/exercise/${sub.exercise_stable_id}`} className="text-brand-blue hover:underline font-medium">
                        {sub.exercise_stable_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.language === 'python' ? 'Python 3' : sub.language === 'cpp' ? 'C++17' : sub.language}</td>
                    <td className={`px-4 py-3 ${getVerdictStyle(sub.verdict || sub.state)}`}>
                      {getVerdictLabel(sub.verdict || sub.state)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {sub.time_used_ms != null ? `${sub.time_used_ms} ms` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {sub.memory_used_kb != null ? `${sub.memory_used_kb} KB` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-gray-400 hover:text-brand-blue transition-colors"
                        title="Ver código fuente"
                      >
                        <Code size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{page}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data?.previous || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data?.next || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">
                Envío #{selectedSubmission.id} - {selectedSubmission.exercise_stable_id}
              </h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto bg-[#1e1e1e]">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-all">
                {selectedSubmission.source_code}
              </pre>
            </div>
            {selectedSubmission.error_details && (
              <div className="p-4 bg-red-50 border-t border-red-100">
                <h4 className="text-red-800 font-bold text-sm mb-1">Detalles del Error:</h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">{selectedSubmission.error_details}</pre>
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
