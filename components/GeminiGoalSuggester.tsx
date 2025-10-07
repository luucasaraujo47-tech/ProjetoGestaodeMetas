
import React, { useState, useCallback } from 'react';
import { AISuggestion, GoalCategory } from '../types';
import { getAIGoalSuggestions } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface GeminiGoalSuggesterProps {
  category: GoalCategory;
  onSuggestionSelect: (suggestion: AISuggestion) => void;
}

export const GeminiGoalSuggester: React.FC<GeminiGoalSuggesterProps> = ({ category, onSuggestionSelect }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIGoalSuggestions(category);
      setSuggestions(result);
    } catch (err) {
      setError('Failed to fetch suggestions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  return (
    <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">Need Inspiration?</h4>
        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-amber-500 rounded-md shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-4 h-4" />
          {isLoading ? 'Thinking...' : 'Suggest Goals'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              className="p-3 bg-white rounded-md shadow-sm hover:bg-gray-100 cursor-pointer border border-gray-200 transition-all"
            >
              <p className="font-semibold text-primary">{suggestion.title}</p>
              <p className="text-sm text-gray-600">{suggestion.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
