import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const queryClient = useQueryClient();

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['skillProgress'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-achievements'] });
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

  const handleSelect = (choiceId: number) => {
    setAnswers({
      ...answers,
      [currentQ.id]: choiceId
    });
  };

  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-brand-light py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-soft p-8 border border-brand-border">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue bg-opacity-10 p-2.5 rounded-xl">
              <Brain className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-black">Prueba Diagnóstica Inicial</h1>
              <p className="text-xs text-brand-gray">Determina tu punto de partida en el mapa de conocimiento</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-brand-blue bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            Pregunta {currentStep + 1} de {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-brand-blue h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="mb-8">
          <div className="inline-block bg-purple-50 text-brand-purple text-xs font-semibold px-2.5 py-1 rounded-md mb-3 border border-purple-100">
            {currentQ.skill_name || 'Habilidad'}
          </div>
          <h2 className="text-lg font-semibold text-brand-black leading-relaxed">
            {currentQ.text}
          </h2>
        </div>

        {/* Choices Area */}
        <div className="space-y-3 mb-8">
          {currentQ.choices.map((choice) => {
            const isSelected = answers[currentQ.id] === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelect(choice.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'border-brand-blue bg-blue-50 text-brand-blue font-medium' 
                    : 'border-brand-border hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{choice.text}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-brand-border">
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent || submitMutation.isPending}
            className="flex items-center px-6 py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all space-x-2"
          >
            <span>{isLastQuestion ? 'Finalizar Examen' : 'Siguiente'}</span>
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
