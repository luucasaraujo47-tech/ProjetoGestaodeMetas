
export enum GoalCategory {
    SAUDE = "Saúde",
    CARREIRA = "Carreira",
    PESSOAL = "Pessoal",
    FINANCEIRO = "Financeiro",
    OUTROS = "Outros",
}

export enum HabitFrequency {
    DIARIO = "Diário",
    SEMANAL = "Semanal",
    MENSAL = "Mensal",
}

export interface Goal {
    id: number;
    title: string;
    description?: string;
    category: GoalCategory;
    dueDate: string; // ISO string date
    isCompleted: boolean;
    progress: number; // Percentage from 0 to 100
    createdAt: string; // ISO string datetime
    // New fields for incremental progress
    totalSteps?: number;
    currentStep?: number;
    stepUnit?: string;
}

export interface Habit {
    id: number;
    name: string;
    frequency: HabitFrequency;
    preferredTime?: string;
    reminderEnabled: boolean;
    createdAt: string; // ISO string datetime
    completedDates: string[]; // Store dates when habit was completed
}

export type GoalCreate = Omit<Goal, 'id' | 'createdAt' | 'isCompleted' | 'progress'>;
export type GoalUpdate = Partial<Omit<Goal, 'id' | 'createdAt'>>;

export type HabitCreate = Omit<Habit, 'id' | 'createdAt' | 'completedDates'>;
export type HabitUpdate = Partial<Omit<Habit, 'id' | 'createdAt' | 'completedDates'>>;

export type ViewType = 'dashboard' | 'goals' | 'habits';

export interface AISuggestion {
    title: string;
    description: string;
}