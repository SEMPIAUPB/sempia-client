import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, HelpCircle, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { exercisesService } from '../../services/api/exercisesService';
import { submissionsService } from '../../services/api/submissionsService';

export default function CodeEditorView() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState('# Escribe tu solución aquí\n');
  const [language, setLanguage] = useState<'python' | 'cpp'>('python');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const { data: exercise, isLoading, isError } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exercisesService.getExercise(id!),
    enabled: !!id,
  });

  const pollSubmission = async (submissionId: number) => {
    try {
      const result = await submissionsService.getSubmission(submissionId);
      if (result.state === 'COMPLETED' || result.state === 'ERROR') {
        setSubmissionResult(result);
        setIsSubmitting(false);
      } else {
        setTimeout(() => pollSubmission(submissionId), 1000);
      }
    } catch (error) {
      console.error("Error polling submission:", error);
      setIsSubmitting(false);
      setSubmissionResult({ verdict: 'SYSTEM_ERROR', error_details: 'Error connecting to server.' });
    }
  };

  const handleSubmit = async () => {
    if (!id || !code.trim()) return;
    
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      const result = await submissionsService.submitCode({
        exercise_id: id,
        source_code: code,
        language: language
      });
      
      pollSubmission(result.id);
    } catch (error) {
      console.error("Error submitting code:", error);
      setIsSubmitting(false);
      setSubmissionResult({ verdict: 'SYSTEM_ERROR', error_details: 'Failed to submit code.' });
    }
  };

  const handleRequestHint = () => {
    alert("Solicitando tutoría por IA...");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-xl shadow-soft">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <span className="ml-2 text-brand-gray font-medium">Cargando ejercicio...</span>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-xl shadow-soft">
        <div className="text-center text-red-500 font-medium">Error al cargar el ejercicio.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-soft overflow-hidden border border-brand-border">
      <div className="flex bg-brand-light border-b border-brand-border p-5 justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-black">{exercise.title}</h2>
          <p className="text-sm text-brand-gray mt-1">Tiempo límite: {exercise.time_limit_ms}ms | Memoria: {exercise.memory_limit_kb}KB</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="flex items-center px-4 py-2 bg-brand-blue text-white text-sm rounded-lg hover:bg-opacity-90 font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Play className="w-4 h-4 mr-2" />
             {isSubmitting ? 'Evaluando...' : 'Enviar código'}
           </button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-brand-light">
        {/* Columna Izquierda: Problem Statement */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-brand-border overflow-y-auto bg-white flex flex-col">
          <div className="p-5 flex-1">
            <h3 className="text-lg font-bold text-brand-black mb-4">Descripción del Problema</h3>
            <div className="prose prose-sm max-w-none text-brand-black" dangerouslySetInnerHTML={{ __html: exercise.statement }} />
            
            {exercise.test_cases && exercise.test_cases.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-brand-black mb-2">Casos de Prueba de Ejemplo</h4>
                {exercise.test_cases.filter(tc => tc.case_type === 'VISIBLE').map((tc, idx) => (
                  <div key={tc.id || idx} className="bg-brand-light p-4 rounded-lg border border-brand-border">
                    <div className="mb-2">
                      <span className="text-xs font-bold text-brand-gray uppercase tracking-wider">Entrada:</span>
                      <pre className="mt-1 text-sm font-mono text-brand-black whitespace-pre-wrap">{tc.inputs || '(Vacío)'}</pre>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-brand-gray uppercase tracking-wider">Salida Esperada:</span>
                      <pre className="mt-1 text-sm font-mono text-brand-black whitespace-pre-wrap">{tc.expected_outputs}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Columna Central: Code Editor */}
        <div className="lg:col-span-6 flex flex-col bg-[#1e1e1e] border-b lg:border-b-0">
          <div className="flex justify-between items-center p-2 bg-[#2d2d2d] border-b border-[#1e1e1e]">
            <span className="text-xs text-gray-400 font-mono ml-2">solucion.{language === 'python' ? 'py' : 'cpp'}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'python' | 'cpp')}
              className="bg-[#1e1e1e] text-gray-300 text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex-1 relative min-h-[400px]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all"
              }}
            />
          </div>
          
          {/* Panel de Veredicto integrado al editor */}
          {submissionResult && (
            <div className={`p-4 border-t font-medium ${
              submissionResult.verdict === 'ACCEPTED' ? 'text-green-400 bg-[#1e1e1e] border-green-900/50' : 
              submissionResult.verdict === 'SYSTEM_ERROR' ? 'text-orange-400 bg-[#1e1e1e] border-orange-900/50' : 
              'text-red-400 bg-[#1e1e1e] border-red-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-base font-bold">
                    Veredicto: {submissionResult.verdict.replace(/_/g, ' ')}
                  </span>
                  {submissionResult.error_details && (
                    <span className="text-xs font-mono mt-1 text-gray-300 opacity-80">{submissionResult.error_details}</span>
                  )}
                </div>
                {submissionResult.time_used_ms !== null && (
                  <div className="text-right text-xs text-gray-400">
                    <p>Tiempo: <span className="font-mono text-gray-200">{submissionResult.time_used_ms} ms</span></p>
                    <p>Memoria: <span className="font-mono text-gray-200">{submissionResult.memory_used_kb} KB</span></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: AI Panel */}
        <div className="lg:col-span-3 border-l border-brand-border bg-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-brand-border bg-brand-light flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">IA</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-black leading-tight">Asistente SEMPIA</h3>
              <p className="text-xs text-brand-gray">Tutoría Inteligente</p>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <HelpCircle className="w-12 h-12 text-brand-purple opacity-20 mb-4" />
            <h4 className="text-brand-black font-bold mb-2">Tutoría Desactivada</h4>
            <p className="text-sm text-brand-gray px-4">
              La integración con IA para pistas dinámicas y análisis de código estará disponible en la siguiente fase (Módulo 5).
            </p>
            <button 
              disabled
              className="mt-6 px-4 py-2 bg-gray-100 text-gray-400 font-medium text-sm rounded-lg border border-gray-200 cursor-not-allowed"
            >
              Generar Pista (Próximamente)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
