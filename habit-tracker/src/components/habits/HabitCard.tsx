'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onUpdate: (updated: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, today, onUpdate, onEdit, onDelete }: HabitCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  const handleToggle = () => {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  };

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-2xl border p-4 transition-all ${
        isCompleted
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-label={isCompleted ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
        >
          {isCompleted && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={`font-semibold text-sm ${
                  isCompleted ? 'text-emerald-800 line-through opacity-70' : 'text-gray-900'
                }`}
              >
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{habit.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Streak */}
              <span
                data-testid={`habit-streak-${slug}`}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                  streak > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                🔥 {streak}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              data-testid={`habit-edit-${slug}`}
              onClick={() => onEdit(habit)}
              className="text-xs text-gray-500 hover:text-emerald-600 font-medium transition-colors"
              aria-label={`Edit ${habit.name}`}
            >
              Edit
            </button>
            <span className="text-gray-300">·</span>
            <button
              data-testid={`habit-delete-${slug}`}
              onClick={() => setShowConfirm(true)}
              className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
              aria-label={`Delete ${habit.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-700 mb-3">
            Delete <strong>{habit.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 text-xs font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="confirm-delete-button"
              onClick={() => {
                onDelete(habit.id);
                setShowConfirm(false);
              }}
              className="flex-1 py-2 text-xs font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
