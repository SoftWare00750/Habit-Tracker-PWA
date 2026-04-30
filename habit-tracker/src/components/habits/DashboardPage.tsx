'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession, getHabits, saveHabits } from '@/lib/storage';
import { Habit, Frequency } from '@/types/habit';
import HabitCard from '@/components/habits/HabitCard';
import HabitForm from '@/components/habits/HabitForm';
import { isCompletedForPeriod } from '@/lib/streaks';

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits]             = useState<Habit[]>([]);
  const [session, setSession]           = useState<{ userId: string; email: string } | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
    const allHabits = getHabits();
    setHabits(allHabits.filter((h) => h.userId === s.userId));
  }, [router]);

  const persistHabits = (updated: Habit[]) => {
    const allHabits = getHabits();
    const others = allHabits.filter((h) => h.userId !== session?.userId);
    saveHabits([...others, ...updated]);
    setHabits(updated);
  };

  const handleCreate = (name: string, description: string, frequency: Frequency, emoji: string, color: string) => {
    if (!session) return;
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name,
      description,
      frequency,
      emoji,
      color,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    persistHabits([...habits, newHabit]);
    setShowForm(false);
  };

  const handleEdit = (name: string, description: string, frequency: Frequency, emoji: string, color: string) => {
    if (!editingHabit) return;
    const updated = habits.map((h) =>
      h.id === editingHabit.id ? { ...h, name, description, frequency, emoji, color } : h
    );
    persistHabits(updated);
    setEditingHabit(null);
  };

  const handleDelete = (id: string) => {
    persistHabits(habits.filter((h) => h.id !== id));
  };

  const handleUpdate = (updated: Habit) => {
    persistHabits(habits.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const completedToday = habits.filter((h) =>
    isCompletedForPeriod(h.completions, today, h.frequency ?? 'daily')
  ).length;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold text-gray-900 text-sm">Habit Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[120px]">
              {session?.email}
            </span>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 mb-6 text-white">
          <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider mb-1">
            Today&apos;s progress
          </p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{completedToday}</span>
            <span className="text-emerald-200 text-sm mb-1">/ {habits.length} habits</span>
          </div>
          <p className="text-xs text-emerald-100 mt-1">{today}</p>
        </div>

        {/* Add habit button */}
        {!showForm && !editingHabit && (
          <button
            data-testid="create-habit-button"
            onClick={() => setShowForm(true)}
            className="w-full mb-4 py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 font-medium text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add habit
          </button>
        )}

        {showForm && (
          <div className="mb-4">
            <HabitForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {editingHabit && (
          <div className="mb-4">
            <HabitForm
              existingHabit={editingHabit}
              onSave={handleEdit}
              onCancel={() => setEditingHabit(null)}
            />
          </div>
        )}

        {/* Habits list */}
        {habits.length === 0 && !showForm ? (
          <div data-testid="empty-state" className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No habits yet</h3>
            <p className="text-sm text-gray-400">Add your first habit to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                today={today}
                onUpdate={handleUpdate}
                onEdit={(h) => { setEditingHabit(h); setShowForm(false); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}