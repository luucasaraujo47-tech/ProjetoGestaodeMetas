import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Goal, Habit, ViewType, GoalCategory, HabitFrequency } from './types';
import { GoalForm } from './components/GoalForm';
import { HabitForm } from './components/HabitForm';
import { EditIcon, TrashIcon, CheckCircleIcon, PlusIcon } from './components/Icons';

// Mock Data translated to Portuguese
const initialGoals: Goal[] = [
    { id: 1, title: 'Aprender React com TypeScript', description: 'Concluir um curso abrangente e construir 3 projetos.', category: GoalCategory.CARREIRA, dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), isCompleted: false, progress: 25, createdAt: new Date().toISOString() },
    { id: 2, title: 'Correr uma maratona de 5km', description: 'Treinar 3 vezes por semana.', category: GoalCategory.SAUDE, dueDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(), isCompleted: false, progress: 60, createdAt: new Date().toISOString() },
    { id: 3, title: 'Ler 12 livros este ano', description: 'Terminar um livro por mês.', category: GoalCategory.PESSOAL, dueDate: new Date(new Date().getFullYear(), 11, 31).toISOString(), isCompleted: true, progress: 100, createdAt: new Date().toISOString(), totalSteps: 12, currentStep: 12, stepUnit: 'livros' },
    { id: 4, title: 'Economizar R$5000 para férias', description: 'Guardar R$500 por mês.', category: GoalCategory.FINANCEIRO, dueDate: new Date(new Date().setDate(new Date().getDate() + 70)).toISOString(), isCompleted: false, progress: 40, createdAt: new Date().toISOString(), totalSteps: 10, currentStep: 4, stepUnit: 'x R$500' },
];

const initialHabits: Habit[] = [
    { id: 1, name: 'Beber 8 copos de água', frequency: HabitFrequency.DIARIO, preferredTime: '09:00', reminderEnabled: true, createdAt: new Date().toISOString(), completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 2, name: 'Meditar por 10 minutos', frequency: HabitFrequency.DIARIO, preferredTime: '07:00', reminderEnabled: true, createdAt: new Date().toISOString(), completedDates: [] },
    { id: 3, name: 'Revisão semanal', frequency: HabitFrequency.SEMANAL, reminderEnabled: false, createdAt: new Date().toISOString(), completedDates: [] },
];

const App: React.FC = () => {
    const [view, setView] = useState<ViewType>('dashboard');
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [habits, setHabits] = useState<Habit[]>(initialHabits);

    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const handleOpenGoalForm = (goal: Goal | null = null) => {
        setEditingGoal(goal);
        setIsGoalFormOpen(true);
    };

    const handleOpenHabitForm = (habit: Habit | null = null) => {
        setEditingHabit(habit);
        setIsHabitFormOpen(true);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
        if (editingGoal) {
            setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
        } else {
            const newGoal: Goal = {
                id: Date.now(),
                ...goalData,
                createdAt: new Date().toISOString(),
                currentStep: goalData.totalSteps ? 0 : undefined,
            };
            setGoals([...goals, newGoal]);
        }
        setIsGoalFormOpen(false);
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id: number) => {
        if(window.confirm('Tem certeza de que deseja excluir esta meta?')) {
            setGoals(goals.filter(g => g.id !== id));
        }
    };
    
    const handleUpdateGoalStep = (goalId: number, newStep: number) => {
        setGoals(goals.map(g => {
            if (g.id === goalId && g.totalSteps) {
                const currentStep = Math.max(0, Math.min(g.totalSteps, newStep));
                const progress = Math.round((currentStep / g.totalSteps) * 100);
                const isCompleted = currentStep >= g.totalSteps;
                return { ...g, currentStep, progress, isCompleted };
            }
            return g;
        }));
    };

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
        if (editingHabit) {
            setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, ...habitData } : h));
        } else {
            const newHabit: Habit = {
                id: Date.now(),
                ...habitData,
                createdAt: new Date().toISOString(),
                completedDates: [],
            };
            setHabits([...habits, newHabit]);
        }
        setIsHabitFormOpen(false);
        setEditingHabit(null);
    };

    const handleDeleteHabit = (id: number) => {
        if(window.confirm('Tem certeza de que deseja excluir este hábito?')) {
            setHabits(habits.filter(h => h.id !== id));
        }
    };
    
    const handleToggleHabit = (habitId: number, date: string) => {
        setHabits(habits.map(h => {
            if (h.id === habitId) {
                const completedDates = h.completedDates.includes(date)
                    ? h.completedDates.filter(d => d !== date)
                    : [...h.completedDates, date];
                return { ...h, completedDates };
            }
            return h;
        }));
    };


    const renderContent = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard goals={goals} habits={habits} onToggleHabit={handleToggleHabit} />;
            case 'goals':
                return <GoalList goals={goals} onEdit={handleOpenGoalForm} onDelete={handleDeleteGoal} onAdd={() => handleOpenGoalForm()} onUpdateStep={handleUpdateGoalStep} />;
            case 'habits':
                return <HabitList habits={habits} onEdit={handleOpenHabitForm} onDelete={handleDeleteHabit} onAdd={() => handleOpenHabitForm()} onToggle={handleToggleHabit}/>;
            default:
                return <Dashboard goals={goals} habits={habits} onToggleHabit={handleToggleHabit} />;
        }
    };

    return (
        <div className="flex h-screen bg-neutral text-base-content">
            <Sidebar currentView={view} setView={setView} />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Header view={view} />
                {renderContent()}
            </main>
            {isGoalFormOpen && <GoalForm goal={editingGoal} onSave={handleSaveGoal} onClose={() => setIsGoalFormOpen(false)} />}
            {isHabitFormOpen && <HabitForm habit={editingHabit} onSave={handleSaveHabit} onClose={() => setIsHabitFormOpen(false)} />}
        </div>
    );
};

// --- Components ---

const Sidebar: React.FC<{ currentView: ViewType, setView: (view: ViewType) => void }> = ({ currentView, setView }) => {
    // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const navItems: { id: ViewType; label: string; icon: React.ReactElement }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { id: 'goals', label: 'Metas', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> },
        { id: 'habits', label: 'Hábitos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ];
    return (
        <aside className="w-20 lg:w-64 bg-base-100/30 shadow-lg flex flex-col">
            <div className="text-primary font-bold text-2xl h-20 flex items-center justify-center lg:justify-start lg:pl-6">
                <span className="lg:hidden">GM</span>
                <span className="hidden lg:block">Gerenciador de Metas</span>
            </div>
            <nav className="flex-1 px-2 lg:px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`flex items-center p-3 rounded-lg w-full transition-colors ${currentView === item.id ? 'bg-primary text-white' : 'hover:bg-neutral'}`}
                    >
                        {item.icon}
                        <span className="hidden lg:block ml-4 font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const Header: React.FC<{ view: ViewType }> = ({ view }) => {
    const title = view.charAt(0).toUpperCase() + view.slice(1);
    const translatedTitle = {
        'Dashboard': 'Dashboard',
        'Goals': 'Metas',
        'Habits': 'Hábitos'
    }[title] || title;

    return (
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-100">{translatedTitle}</h1>
            <p className="text-gray-400 mt-1">Bem-vindo(a) de volta! Aqui está o resumo do seu progresso.</p>
        </header>
    );
};

const Dashboard: React.FC<{ goals: Goal[], habits: Habit[], onToggleHabit: (habitId: number, date: string) => void }> = ({ goals, habits, onToggleHabit }) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysHabits = habits.filter(h => h.frequency === HabitFrequency.DIARIO);
    
    const goalStats = useMemo(() => {
        const total = goals.length;
        const completed = goals.filter(g => g.isCompleted).length;
        const pending = total - completed;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const overdue = goals.filter(g => !g.isCompleted && new Date(g.dueDate) < now).length;
        return {
            total,
            completed,
            pending,
            overdue,
            data: [
                { name: 'Concluídas', value: completed, color: '#10b981' },
                { name: 'Pendentes', value: pending, color: '#f59e0b' }
            ]
        };
    }, [goals]);

    const habitStats = useMemo(() => {
        return habits.map(h => ({
            name: h.name,
            Conclusões: h.completedDates.length
        }));
    }, [habits]);

    const categoryData = useMemo(() => {
        const counts = goals.reduce((acc, goal) => {
            acc[goal.category] = (acc[goal.category] || 0) + 1;
            return acc;
        }, {} as Record<GoalCategory, number>);

        const colors: Record<GoalCategory, string> = {
            [GoalCategory.SAUDE]: '#10b981',
            [GoalCategory.CARREIRA]: '#3b82f6',
            [GoalCategory.PESSOAL]: '#f59e0b',
            [GoalCategory.FINANCEIRO]: '#8b5cf6',
            [GoalCategory.OUTROS]: '#6b7280',
        };

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: colors[name as GoalCategory] || '#a8a29e'
        }));
    }, [goals]);

    const tooltipProps = {
        contentStyle: { backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' },
        itemStyle: { color: '#d1d5db' },
        labelStyle: { color: 'white', fontWeight: 'bold' }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total de Metas" value={goalStats.total} />
                 <StatCard title="Metas Concluídas" value={goalStats.completed} />
                 <StatCard title="Metas Pendentes" value={goalStats.pending} />
                 <StatCard title="Atrasadas" value={goalStats.overdue} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-200 mb-4">Hábitos de Hoje</h2>
                <div className="bg-base-100 p-4 rounded-lg shadow-sm space-y-3">
                    {todaysHabits.length > 0 ? todaysHabits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral">
                           <span className="text-gray-200">{habit.name}</span>
                           <button onClick={() => onToggleHabit(habit.id, today)}>
                                <CheckCircleIcon className={`w-8 h-8 transition-colors ${habit.completedDates.includes(today) ? 'text-secondary' : 'text-gray-500 hover:text-gray-400'}`} />
                           </button>
                        </div>
                    )) : <p className="text-gray-400">Nenhum hábito diário configurado ainda.</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Status das Metas">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            {/* FIX: Cast `percent` to number to avoid TypeScript arithmetic error. */}
                            <Pie data={goalStats.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}>
                                {goalStats.data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip {...tooltipProps} />
                            <Legend wrapperStyle={{ color: '#d1d5db' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Metas por Categoria">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            {/* FIX: Cast `percent` to number to avoid TypeScript arithmetic error. */}
                            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${((percent as number) * 100).toFixed(0)}%`}>
                                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip {...tooltipProps} />
                            <Legend wrapperStyle={{ color: '#d1d5db' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Conclusões de Hábitos">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={habitStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563"/>
                            <XAxis dataKey="name" angle={-20} textAnchor="end" height={50} tick={{ fill: '#9ca3af' }}/>
                            <YAxis allowDecimals={false} tick={{ fill: '#9ca3af' }} />
                            <Tooltip {...tooltipProps} cursor={{fill: 'rgba(107, 114, 128, 0.2)'}} />
                            <Legend wrapperStyle={{ color: '#d1d5db' }}/>
                            <Bar dataKey="Conclusões" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: number | string }> = ({ title, value }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-100 mt-2">{value}</p>
    </div>
);

const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gray-200 mb-4">{title}</h3>
        {children}
    </div>
);


const GoalList: React.FC<{ goals: Goal[], onEdit: (goal: Goal) => void, onDelete: (id: number) => void, onAdd: () => void, onUpdateStep: (id: number, newStep: number) => void }> = ({ goals, onEdit, onDelete, onAdd, onUpdateStep }) => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);
    
    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors">
                    <PlusIcon />
                    Nova Meta
                </button>
            </div>
            <div className="space-y-8">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-4">Metas Ativas ({activeGoals.length})</h2>
                    {activeGoals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} onUpdateStep={onUpdateStep} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-base-100 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-200">Nenhuma meta ativa ainda!</h3>
                            <p className="text-gray-400 mt-1">Clique em 'Nova Meta' para começar sua jornada.</p>
                        </div>
                    )}
                </div>

                {completedGoals.length > 0 && (
                    <details className="group" open>
                        <summary className="text-2xl font-bold text-gray-100 mb-4 cursor-pointer list-none flex items-center gap-2 hover:text-primary transition-colors">
                             Metas Concluídas ({completedGoals.length})
                             <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </summary>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                            {completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} onUpdateStep={onUpdateStep} />)}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
};

const categoryAppearance: Record<GoalCategory, { bg: string; text: string }> = {
    [GoalCategory.SAUDE]: { bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
    [GoalCategory.CARREIRA]: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
    [GoalCategory.PESSOAL]: { bg: 'bg-amber-900/50', text: 'text-amber-300' },
    [GoalCategory.FINANCEIRO]: { bg: 'bg-violet-900/50', text: 'text-violet-300' },
    [GoalCategory.OUTROS]: { bg: 'bg-slate-700/50', text: 'text-slate-300' },
};

const GoalCard: React.FC<{ goal: Goal, onEdit: (goal: Goal) => void, onDelete: (id: number) => void, onUpdateStep: (id: number, newStep: number) => void }> = ({ goal, onEdit, onDelete, onUpdateStep }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = !goal.isCompleted && new Date(goal.dueDate) < today;
    const daysLeft = Math.ceil((new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const appearance = categoryAppearance[goal.category];
    
    const isStepBased = goal.totalSteps !== undefined && goal.totalSteps > 0;
    const currentStep = goal.currentStep || 0;
    const totalSteps = goal.totalSteps || 0;

    return (
        <div className={`bg-base-100 p-5 rounded-lg shadow-md border-l-4 flex flex-col ${goal.isCompleted ? 'border-secondary' : isOverdue ? 'border-red-500' : 'border-accent'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <span className={`text-xs font-semibold ${appearance.bg} ${appearance.text} px-2 py-1 rounded-full`}>{goal.category}</span>
                    <h3 className="text-lg font-bold text-gray-100 mt-2">{goal.title}</h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => onEdit(goal)} className="text-gray-500 hover:text-primary p-1"><EditIcon /></button>
                    <button onClick={() => onDelete(goal.id)} className="text-gray-500 hover:text-red-500 p-1"><TrashIcon /></button>
                </div>
            </div>
            <p className="text-gray-400 text-sm my-3 flex-grow">{goal.description}</p>
            <div className="mt-auto">
                {isStepBased ? (
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-medium text-gray-400">Progresso</span>
                             <span className="text-sm font-semibold text-gray-200">{currentStep} de {totalSteps} {goal.stepUnit || ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onUpdateStep(goal.id, currentStep - 1)} 
                                disabled={currentStep <= 0}
                                className="px-2 py-0.5 bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg hover:bg-gray-500">-</button>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div className={`${goal.isCompleted ? 'bg-secondary' : 'bg-primary'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${goal.progress}%` }}></div>
                            </div>
                            <button 
                                onClick={() => onUpdateStep(goal.id, currentStep + 1)}
                                disabled={currentStep >= totalSteps}
                                className="px-2 py-0.5 bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg hover:bg-gray-500">+</button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-400">Progresso</span>
                            <span className={`text-sm font-semibold ${goal.isCompleted ? 'text-secondary' : 'text-primary'}`}>{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                            <div className={`${goal.isCompleted ? 'bg-secondary' : 'bg-primary'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${goal.progress}%` }}></div>
                        </div>
                    </div>
                )}
                <div className="text-sm text-gray-400">
                    {goal.isCompleted ? (
                        <span className="flex items-center gap-1 text-secondary font-semibold"><CheckCircleIcon className="w-5 h-5"/> Concluída</span>
                    ) : (
                        <span>Prazo em <span className={`font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-200'}`}>{daysLeft > 0 ? `${daysLeft} dias` : 'Atrasada'}</span></span>
                    )}
                </div>
            </div>
        </div>
    );
};

const HabitList: React.FC<{ habits: Habit[], onEdit: (habit: Habit) => void, onDelete: (id: number) => void, onAdd: () => void, onToggle: (id: number, date: string) => void }> = ({ habits, onEdit, onDelete, onAdd, onToggle }) => {
    return (
         <div>
            <div className="flex justify-end mb-4">
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 shadow-sm transition-colors">
                    <PlusIcon />
                    Novo Hábito
                </button>
            </div>
            <div className="space-y-4">
                {habits.map(habit => <HabitCard key={habit.id} habit={habit} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle}/>)}
            </div>
        </div>
    );
};

const HabitCard: React.FC<{ habit: Habit, onEdit: (habit: Habit) => void, onDelete: (id: number) => void, onToggle: (id: number, date: string) => void }> = ({ habit, onEdit, onDelete, onToggle }) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);

    return (
        <div className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => onToggle(habit.id, today)}>
                    <CheckCircleIcon className={`w-10 h-10 transition-colors ${isCompletedToday ? 'text-secondary' : 'text-gray-500 hover:text-gray-400'}`} />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-gray-100">{habit.name}</h3>
                    <p className="text-sm text-gray-400">{habit.frequency} {habit.preferredTime && `às ${habit.preferredTime}`}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEdit(habit)} className="text-gray-500 hover:text-primary p-1"><EditIcon /></button>
                <button onClick={() => onDelete(habit.id)} className="text-gray-500 hover:text-red-500 p-1"><TrashIcon /></button>
            </div>
        </div>
    );
};


export default App;