import React, { useState, useCallback, useEffect } from 'react';
import { AISuggestion, HabitFrequency } from '../types';
import { getAIHabitSuggestions } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface GeminiHabitSuggesterProps {
  frequency: HabitFrequency;
  onSuggestionSelect: (suggestion: AISuggestion) => void;
}

export const GeminiHabitSuggester: React.FC<GeminiHabitSuggesterProps> = ({ frequency, onSuggestionSelect }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIX: Corrected syntax from `async ()_ =>` to `async () =>`. This was causing parsing errors.
  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIHabitSuggestions(frequency);
      setSuggestions(result);
    } catch (err) {
      setError('Falha ao buscar sugestões.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [frequency]);

  // Clear suggestions when frequency changes to provide fresh recommendations
  useEffect(() => {
    setSuggestions([]);
  }, [frequency]);

  return (
    <div className="mt-4 p-4 border border-dashed border-gray-600 rounded-lg bg-gray-800/50">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-300">Precisa de Inspiração?</h4>
        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-amber-500 rounded-md shadow-sm disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-4 h-4" />
          {isLoading ? 'Pensando...' : 'Sugerir Hábitos'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              className="p-3 bg-base-100 rounded-md shadow-sm hover:bg-gray-600 cursor-pointer border border-gray-500 transition-all"
            >
              <p className="font-semibold text-secondary">{suggestion.title}</p>
              <p className="text-sm text-gray-400">{suggestion.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};