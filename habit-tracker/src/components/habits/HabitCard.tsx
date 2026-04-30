'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak, isCompletedForPeriod, getFrequencyLabel, getStreakUnit } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onUpdate: (updated: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const COLOR_MAP: Record<string, { card: string; cardDone: string; check: string; checkDone: string; badge: string; freq: string }> = {
  emerald: { card: 'bg-white border-gray-100',        cardDone: 'bg-emerald-50 border-emerald-200', check: 'border-gray-300 hover:border-emerald-400',  checkDone: 'bg-emerald-500 border-emerald-500', badge: 'bg-amber-100 text-amber-700', freq: 'bg-emerald-100 text-emerald-700' },
  blue:    { card: 'bg-white border-gray-100',        cardDone: 'bg-blue-50 border-blue-200',       check: 'border-gray-300 hover:border-blue-400',     checkDone: 'bg-blue-500 border-blue-500',       badge: 'bg-amber-100 text-amber-700', freq: 'bg-blue-100 text-blue-700'    },
  violet:  { card: 'bg-white border-gray-100',        cardDone: 'bg-violet-50 border-violet-200',   check: 'border-gray-300 hover:border-violet-400',   checkDone: 'bg-violet-500 border-violet-500',   badge: 'bg-amber-100 text-amber-700', freq: 'bg-violet-100 text-violet-700'},
  rose:    { card: 'bg-white border-gray-100',        cardDone: 'bg-rose-50 border-rose-200',       check: 'border-gray-300 hover:border-rose-400',     checkDone: 'bg-rose-500 border-rose-500',       badge: 'bg-amber-100 text-amber-700', freq: 'bg-rose-100 text-rose-700'    },
  amber:   { card: 'bg-white border-gray-100',        cardDone: 'bg-amber-50 border-amber-200',     check: 'border-gray-300 hover:border-amber-400',    checkDone: 'bg-amber-500 border-amber-500',     badge: 'bg-amber-100 text-amber-700', freq: 'bg-amber-100 text-amber-700'  },
  cyan:    { card: 'bg-white border-gray-100',        cardDone: 'bg-cyan-50 border-cyan-200',       check: 'border-gray-300 hover:border-cyan-400',     checkDone: 'bg-cyan-500 border-cyan-500',       badge: 'bg-amber-100 text-amber-700', freq: 'bg-cyan-100 text-cyan-700'    },
  pink:    { card: 'bg-white border-gray-100',        cardDone: 'bg-pink-50 border-pink-200',       check: 'border-gray-300 hover:border-pink-400',     checkDone: 'bg-pink-500 border-pink-500',       badge: 'bg-amber-100 text-amber-700', freq: 'bg-pink-100 text-pink-700'    },
  teal:    { card: 'bg-white border-gray-100',        cardDone: 'bg-teal-50 border-teal-200',       check: 'border-gray-300 hover:border-teal-400',     checkDone: 'bg-teal-500 border-teal-500',       badge: 'bg-amber-100 text-amber-700', freq: 'bg-teal-100 text-teal-700'    },
};

export default function HabitCard({ habit, today, onUpdate, onEdit, onDelete }: HabitCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const slug        = getHabitSlug(habit.name);
  const frequency   = habit.frequency ?? 'daily';
  const streak      = calculateCurrentStreak(habit.completions, today, frequency);
  const isCompleted = isCompletedForPeriod(habit.completions, today, frequency);
  const colors      = COLOR_MAP[habit.color ?? 'emerald'] ?? COLOR_MAP.emerald;
  const streakUnit  = getStreakUnit(frequency);
  const freqLabel   = getFrequencyLabel(frequency);
  const habitEmoji  = habit.emoji ?? '🌱';

  const handleToggle = () => {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  };

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-2xl border p-4 transition-all ${isCompleted ? colors.cardDone : `${colors.card} shadow-sm`}`}
    >
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-label={isCompleted ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted ? colors.checkDone + ' text-white' : colors.check
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
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none flex-shrink-0">{habitEmoji}</span>
              <div className="min-w-0">
                <h3
                  className={`font-semibold text-sm truncate ${
                    isCompleted ? 'line-through opacity-60 text-gray-600' : 'text-gray-900'
                  }`}
                >
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{habit.description}</p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${colors.freq}`}>
                {freqLabel}
              </span>
              <span
                data-testid={`habit-streak-${slug}`}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                  streak > 0 ? colors.badge : 'bg-gray-100 text-gray-500'
                }`}
              >
                🔥 {streak}{streakUnit}
              </span>
            </div>
          </div>

          {/* Actions */}
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

      {/* Delete confirmation */}
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
              onClick={() => { onDelete(habit.id); setShowConfirm(false); }}
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