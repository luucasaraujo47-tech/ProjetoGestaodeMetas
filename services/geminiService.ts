
import { GoogleGenAI, Type } from "@google/genai";
import { GoalCategory, AISuggestion } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAIGoalSuggestions = async (category: GoalCategory): Promise<AISuggestion[]> => {
  try {
    const prompt = `Suggest 3 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals for the '${category}' category. The goals should be actionable and inspiring for someone looking to improve their life in this area. Provide a brief description for each goal.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The specific title of the goal.',
              },
              description: {
                type: Type.STRING,
                description: 'A brief, motivating description of the goal.',
              },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    return suggestions as AISuggestion[];
  } catch (error) {
    console.error("Error fetching AI goal suggestions:", error);
    // Return some fallback suggestions on error
    return [
      { title: "Error fetching suggestions", description: "Could not connect to the AI service. Please try again later." },
    ];
  }
};
