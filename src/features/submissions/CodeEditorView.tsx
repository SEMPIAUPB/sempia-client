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
             onClick={handleRequestHint}
             className="flex items-center px-5 py-2.5 bg-brand-yellow text-brand-black rounded-xl hover:bg-opacity-90 font-bold transition-all shadow-sm"
           >
             <HelpCircle className="w-4 h-4 mr-2" />
             Pista IA
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="flex items-center px-6 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-opacity-90 font-bold transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Play className="w-4 h-4 mr-2" />
             {isSubmitting ? 'Evaluando...' : 'Enviar código'}
           </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Problem Statement */}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-brand-border p-6 overflow-y-auto bg-white">
          <h3 className="text-lg font-bold text-brand-black mb-4">Descripción del Problema</h3>
          <div className="prose prose-sm prose-brand max-w-none text-brand-black" dangerouslySetInnerHTML={{ __html: exercise.statement }} />
          
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
        
        {/* Code Editor */}
        <div className="w-full lg:w-2/3 flex flex-col bg-[#1e1e1e]">
          <div className="flex justify-end p-2 bg-[#2d2d2d] border-b border-[#1e1e1e]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'python' | 'cpp')}
              className="bg-[#1e1e1e] text-gray-300 text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex-1 min-h-[500px]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>
      
      {submissionResult && (
        <div className={`p-5 border-t font-medium ${
          submissionResult.verdict === 'ACCEPTED' ? 'text-green-700 bg-green-50 border-green-200' : 
          submissionResult.verdict === 'SYSTEM_ERROR' ? 'text-orange-700 bg-orange-50 border-orange-200' : 
          'text-red-700 bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold">
                Veredicto: {submissionResult.verdict.replace(/_/g, ' ')}
              </span>
              {submissionResult.error_details && (
                <span className="text-sm mt-1">{submissionResult.error_details}</span>
              )}
            </div>
            {submissionResult.time_used_ms !== null && (
              <div className="text-right text-sm">
                <p>Tiempo: <span className="font-bold">{submissionResult.time_used_ms} ms</span></p>
                <p>Memoria: <span className="font-bold">{submissionResult.memory_used_kb} KB</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
