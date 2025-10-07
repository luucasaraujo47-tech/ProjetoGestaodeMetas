import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Goal, Habit, ViewType, GoalCategory, HabitFrequency } from './types';
import { GoalForm } from './components/GoalForm';
import { HabitForm } from './components/HabitForm';
import { EditIcon, TrashIcon, CheckCircleIcon, PlusIcon } from './components/Icons';

// Mock Data
const initialGoals: Goal[] = [
    { id: 1, title: 'Learn React with TypeScript', description: 'Complete a comprehensive course and build 3 projects.', category: GoalCategory.CARREIRA, dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), isCompleted: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Run a 5k marathon', description: 'Train 3 times a week.', category: GoalCategory.SAUDE, dueDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(), isCompleted: false, createdAt: new Date().toISOString() },
    { id: 3, title: 'Read 12 books this year', description: 'Finish one book per month.', category: GoalCategory.PESSOAL, dueDate: new Date(new Date().getFullYear(), 11, 31).toISOString(), isCompleted: true, createdAt: new Date().toISOString() },
];

const initialHabits: Habit[] = [
    { id: 1, name: 'Drink 8 glasses of water', frequency: HabitFrequency.DIARIO, preferredTime: '09:00', reminderEnabled: true, createdAt: new Date().toISOString(), completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 2, name: 'Meditate for 10 minutes', frequency: HabitFrequency.DIARIO, preferredTime: '07:00', reminderEnabled: true, createdAt: new Date().toISOString(), completedDates: [] },
    { id: 3, name: 'Weekly review', frequency: HabitFrequency.SEMANAL, reminderEnabled: false, createdAt: new Date().toISOString(), completedDates: [] },
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
                createdAt: new Date().toISOString()
            };
            setGoals([...goals, newGoal]);
        }
        setIsGoalFormOpen(false);
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id: number) => {
        if(window.confirm('Are you sure you want to delete this goal?')) {
            setGoals(goals.filter(g => g.id !== id));
        }
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
        if(window.confirm('Are you sure you want to delete this habit?')) {
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
                return <GoalList goals={goals} onEdit={handleOpenGoalForm} onDelete={handleDeleteGoal} onAdd={() => handleOpenGoalForm()} />;
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
        { id: 'goals', label: 'Goals', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> },
        { id: 'habits', label: 'Habits', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ];
    return (
        <aside className="w-20 lg:w-64 bg-base-100 shadow-lg flex flex-col">
            <div className="text-primary font-bold text-2xl h-20 flex items-center justify-center lg:justify-start lg:pl-6">
                <span className="lg:hidden">GM</span>
                <span className="hidden lg:block">Goal Manager</span>
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
    return (
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your progress overview.</p>
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
        return {
            total,
            completed,
            pending,
            data: [
                { name: 'Completed', value: completed, color: '#10b981' },
                { name: 'Pending', value: pending, color: '#f59e0b' }
            ]
        };
    }, [goals]);

    const habitStats = useMemo(() => {
        const data = habits.map(h => ({
            name: h.name,
            completions: h.completedDates.length
        }));
        return data;
    }, [habits]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard title="Total Goals" value={goalStats.total} />
                 <StatCard title="Completed Goals" value={goalStats.completed} />
                 <StatCard title="Pending Goals" value={goalStats.pending} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Today's Habits</h2>
                <div className="bg-base-100 p-4 rounded-lg shadow-sm space-y-3">
                    {todaysHabits.length > 0 ? todaysHabits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral">
                           <span>{habit.name}</span>
                           <button onClick={() => onToggleHabit(habit.id, today)}>
                                <CheckCircleIcon className={`w-8 h-8 transition-colors ${habit.completedDates.includes(today) ? 'text-secondary' : 'text-gray-300 hover:text-gray-400'}`} />
                           </button>
                        </div>
                    )) : <p className="text-gray-500">No daily habits set up yet.</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Goal Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={goalStats.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {goalStats.data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Habit Completions">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={habitStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completions" fill="#1d4ed8" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: number | string }> = ({ title, value }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
);

const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
        {children}
    </div>
);


const GoalList: React.FC<{ goals: Goal[], onEdit: (goal: Goal) => void, onDelete: (id: number) => void, onAdd: () => void }> = ({ goals, onEdit, onDelete, onAdd }) => {
    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors">
                    <PlusIcon />
                    New Goal
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {goals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
        </div>
    );
};

const GoalCard: React.FC<{ goal: Goal, onEdit: (goal: Goal) => void, onDelete: (id: number) => void }> = ({ goal, onEdit, onDelete }) => {
    const daysLeft = Math.ceil((new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return (
        <div className={`bg-base-100 p-5 rounded-lg shadow-sm border-l-4 ${goal.isCompleted ? 'border-secondary' : 'border-accent'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-semibold bg-blue-100 text-primary px-2 py-1 rounded-full">{goal.category}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">{goal.title}</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(goal)} className="text-gray-400 hover:text-primary"><EditIcon /></button>
                    <button onClick={() => onDelete(goal.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                </div>
            </div>
            <p className="text-gray-600 text-sm my-3">{goal.description}</p>
            <div className="text-sm text-gray-500">
                {goal.isCompleted ? (
                    <span className="flex items-center gap-1 text-secondary font-semibold"><CheckCircleIcon className="w-5 h-5"/> Completed</span>
                ) : (
                    <span>Due in <span className="font-semibold">{daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}</span></span>
                )}
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
                    New Habit
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
                    <CheckCircleIcon className={`w-10 h-10 transition-colors ${isCompletedToday ? 'text-secondary' : 'text-gray-300 hover:text-gray-400'}`} />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{habit.name}</h3>
                    <p className="text-sm text-gray-500">{habit.frequency} {habit.preferredTime && `at ${habit.preferredTime}`}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEdit(habit)} className="text-gray-400 hover:text-primary"><EditIcon /></button>
                <button onClick={() => onDelete(habit.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
            </div>
        </div>
    );
};


export default App;