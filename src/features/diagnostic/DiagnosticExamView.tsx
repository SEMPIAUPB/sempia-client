import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';

interface DiagnosticChoice {
  id: number;
  text: string;
}

interface DiagnosticQuestion {
  id: number;
  text: string;
  skill_name: string;
  choices: DiagnosticChoice[];
}

export default function DiagnosticExamView() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const { data: questions, isLoading, isError } = useQuery<DiagnosticQuestion[]>({
    queryKey: ['diagnosticExam'],
    queryFn: async () => {
      const res = await apiClient.get<DiagnosticQuestion[]>('/skills/diagnostic/');
      // If backend returns paginated, extract results. Assuming direct array here.
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any[]) => {
      await apiClient.post('/skills/diagnostic/submit/', { answers: payload });
    },
    onSuccess: () => {
      navigate('/dashboard');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light">
        <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
        <span className="ml-4 text-xl font-medium text-brand-gray">Preparando examen diagnóstico...</span>
      </div>
    );
  }

  if (isError || !questions) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light">
        <div className="bg-white p-8 rounded-xl shadow-soft text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error al cargar la prueba</h2>
          <p className="text-gray-600 mb-6">No pudimos contactar al servidor para obtener las preguntas.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-brand-blue text-white rounded-lg font-bold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // If there are no questions seeded in the DB, just let them skip
  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light">
        <div className="bg-white p-8 rounded-xl shadow-soft text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Examen Omitido</h2>
          <p className="text-gray-600 mb-6">No hay preguntas diagnósticas configuradas actualmente. Puedes iniciar directamente.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-brand-blue text-white rounded-lg font-bold w-full">
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQ.id] !== undefined;

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      const payload = Object.entries(answers).map(([qId, cId]) => ({
        question_id: parseInt(qId),
        choice_id: cId
      }));
      submitMutation.mutate(payload);
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-blue text-white mb-4 shadow-lg">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-brand-black mb-2">Examen Diagnóstico</h1>
          <p className="text-brand-gray">
            Pregunta {currentStep + 1} de {questions.length}
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-6 overflow-hidden">
            <div 
              className="bg-brand-blue h-2 transition-all duration-300 ease-out" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-brand-border">
          <div className="p-8">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-4">
              Tópico: {currentQ.skill_name}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQ.text}</h2>
            
            <div className="space-y-3">
              {currentQ.choices.map((choice) => {
                const isSelected = answers[currentQ.id] === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: choice.id })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-brand-blue bg-blue-50 text-brand-blue' 
                        : 'border-gray-200 hover:border-brand-purple hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        isSelected ? 'border-brand-blue' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />}
                      </div>
                      <span className="font-medium">{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-5 border-t border-brand-border flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0 || submitMutation.isPending}
              className="px-6 py-2 text-brand-gray font-medium hover:text-brand-black disabled:opacity-50 transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent || submitMutation.isPending}
              className="flex items-center px-8 py-2.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {isLastQuestion ? 'Finalizar Examen' : 'Siguiente'}
                  {!isLastQuestion && <ArrowRight className="w-5 h-5 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
