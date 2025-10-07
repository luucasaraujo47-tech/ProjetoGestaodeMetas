import React, { useState, useEffect } from 'react';
import { Goal, GoalCategory, AISuggestion } from '../types';
import { GeminiGoalSuggester } from './GeminiGoalSuggester';

interface GoalFormProps {
  goal?: Goal | null;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

type ProgressType = 'percentage' | 'steps';

export const GoalForm: React.FC<GoalFormProps> = ({ goal, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.PESSOAL);
  const [dueDate, setDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // State for incremental progress
  const [progressType, setProgressType] = useState<ProgressType>('percentage');
  const [totalSteps, setTotalSteps] = useState<number | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<number | undefined>(undefined);
  const [stepUnit, setStepUnit] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category);
      setDueDate(goal.dueDate.split('T')[0]);
      setIsCompleted(goal.isCompleted);
      setProgress(goal.progress);

      if (goal.totalSteps) {
        setProgressType('steps');
        setTotalSteps(goal.totalSteps);
        setCurrentStep(goal.currentStep);
        setStepUnit(goal.stepUnit);
      } else {
        setProgressType('percentage');
        setTotalSteps(undefined);
        setStepUnit(undefined);
      }

    } else {
      // Reset form to default for new goal
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      setDueDate(oneWeekFromNow.toISOString().split('T')[0]);
      setProgress(0);
      setIsCompleted(false);
      setTitle('');
      setDescription('');
      setCategory(GoalCategory.PESSOAL);
      setProgressType('percentage');
      setTotalSteps(undefined);
      setCurrentStep(0);
      setStepUnit(undefined);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert("Título e Data Final são obrigatórios.");
      return;
    }

    const goalData: Omit<Goal, 'id' | 'createdAt'> = { 
        title, 
        description, 
        category, 
        dueDate, 
        isCompleted, 
        progress
    };

    if (progressType === 'steps' && totalSteps && totalSteps > 0) {
        goalData.totalSteps = totalSteps;
        goalData.currentStep = currentStep || 0;
        goalData.stepUnit = stepUnit;
        goalData.progress = Math.round(((currentStep || 0) / totalSteps) * 100);
        goalData.isCompleted = (currentStep || 0) >= totalSteps;
    } else {
        goalData.totalSteps = undefined;
        goalData.currentStep = undefined;
        goalData.stepUnit = undefined;
    }

    onSave(goalData);
  };
  
  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value, 10);
    setProgress(newProgress);
    if (newProgress === 100) {
      setIsCompleted(true);
    } else if (isCompleted) {
      setIsCompleted(false);
    }
  };
  
  const handleCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCompleted(checked);
    if (checked) {
      setProgress(100);
       if (progressType === 'steps' && totalSteps) {
          setCurrentStep(totalSteps);
      }
    } else {
       if (progress === 100) {
        setProgress(99);
      }
       if (progressType === 'steps' && totalSteps && (currentStep || 0) >= totalSteps) {
          setCurrentStep(totalSteps -1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-2xl p-8 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">{goal ? 'Editar Meta' : 'Criar Nova Meta'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Título</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">Categoria</label>
                <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                >
                {Object.values(GoalCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">Data Final</label>
                <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white [color-scheme:dark]"
                required
                />
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Progresso</label>
              <div className="flex gap-4">
                  <label className="flex items-center">
                      <input type="radio" value="percentage" checked={progressType === 'percentage'} onChange={() => setProgressType('percentage')} className="form-radio h-4 w-4 text-primary focus:ring-primary bg-gray-800 border-gray-600"/>
                      <span className="ml-2 text-sm text-gray-300">Porcentagem</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" value="steps" checked={progressType === 'steps'} onChange={() => setProgressType('steps')} className="form-radio h-4 w-4 text-primary focus:ring-primary bg-gray-800 border-gray-600"/>
                      <span className="ml-2 text-sm text-gray-300">Passos</span>
                  </label>
              </div>
           </div>

          {progressType === 'percentage' ? (
             <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-300">Progresso</label>
                <div className="flex items-center gap-4 mt-1">
                    <input
                        id="progress"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="font-semibold text-gray-300 w-12 text-right">{progress}%</span>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <div>
                    <label htmlFor="totalSteps" className="block text-sm font-medium text-gray-300">Total de Passos</label>
                    <input
                        id="totalSteps"
                        type="number"
                        min="1"
                        value={totalSteps || ''}
                        onChange={(e) => setTotalSteps(parseInt(e.target.value, 10) || undefined)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                        placeholder="Ex: 10"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="stepUnit" className="block text-sm font-medium text-gray-300">Unidade (Opcional)</label>
                    <input
                        id="stepUnit"
                        type="text"
                        value={stepUnit || ''}
                        onChange={(e) => setStepUnit(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                        placeholder="Ex: Livros, R$, Kg"
                    />
                </div>
            </div>
          )}
          
          <div className="flex items-center">
              <input
                  id="isCompleted"
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleCompletedChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-500 rounded bg-gray-800"
              />
              <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-200">Marcar como concluída</label>
          </div>

          {!goal && <GeminiGoalSuggester category={category} onSuggestionSelect={handleSuggestionSelect} />}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              {goal ? 'Salvar Alterações' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};