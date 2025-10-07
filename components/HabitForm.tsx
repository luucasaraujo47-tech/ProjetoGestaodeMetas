import React, { useState, useEffect } from 'react';
import { Habit, HabitFrequency, AISuggestion } from '../types';
import { GeminiHabitSuggester } from './GeminiHabitSuggester';

interface HabitFormProps {
  habit?: Habit | null;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  onClose: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ habit, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>(HabitFrequency.DIARIO);
  const [preferredTime, setPreferredTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequency(habit.frequency);
      setPreferredTime(habit.preferredTime || '');
      setReminderEnabled(habit.reminderEnabled);
    }
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
        alert("O nome do hábito é obrigatório.");
        return;
    }
    onSave({ name, frequency, preferredTime, reminderEnabled });
  };
  
  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setName(suggestion.title);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-2xl p-8 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">{habit ? 'Editar Hábito' : 'Criar Novo Hábito'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome do Hábito</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequência</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
              >
                {Object.values(HabitFrequency).map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-300">Horário Preferencial (Opcional)</label>
              <input
                id="preferredTime"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="reminderEnabled"
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-500 rounded bg-gray-800"
            />
            <label htmlFor="reminderEnabled" className="ml-2 block text-sm text-gray-200">Ativar Lembretes (recurso em breve)</label>
          </div>

          {!habit && <GeminiHabitSuggester frequency={frequency} onSuggestionSelect={handleSuggestionSelect} />}

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
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm"
            >
              {habit ? 'Salvar Alterações' : 'Criar Hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};