import { GoogleGenAI, Type } from "@google/genai";
import { GoalCategory, HabitFrequency, AISuggestion } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAIGoalSuggestions = async (category: GoalCategory): Promise<AISuggestion[]> => {
  try {
    const prompt = `Sugira 3 metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais) para a categoria '${category}'. As metas devem ser práticas e inspiradoras para alguém que busca melhorar sua vida nesta área. Forneça uma breve descrição para cada meta.`;

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
                description: 'O título específico da meta.',
              },
              description: {
                type: Type.STRING,
                description: 'Uma breve e motivadora descrição da meta.',
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
      { title: "Erro ao buscar sugestões", description: "Não foi possível conectar ao serviço de IA. Por favor, tente novamente mais tarde." },
    ];
  }
};

export const getAIHabitSuggestions = async (frequency: HabitFrequency): Promise<AISuggestion[]> => {
  try {
    const prompt = `Sugira 3 hábitos positivos para uma frequência '${frequency}'. Os hábitos devem ser simples, práticos e contribuir para o bem-estar pessoal ou produtividade. Para cada hábito, forneça um título conciso (o próprio hábito) e uma descrição curta e motivadora de seus benefícios.`;

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
                description: 'O nome do hábito.',
              },
              description: {
                type: Type.STRING,
                description: 'Uma breve descrição dos benefícios do hábito.',
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
    console.error("Error fetching AI habit suggestions:", error);
    return [
      { title: "Erro ao buscar sugestões", description: "Não foi possível conectar ao serviço de IA. Por favor, tente novamente mais tarde." },
    ];
  }
};