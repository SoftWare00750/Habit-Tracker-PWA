'use client';

import { useState, useEffect } from 'react';
import { Habit, Frequency } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
  existingHabit?: Habit | null;
  onSave: (name: string, description: string, frequency: Frequency, emoji: string, color: string) => void;
  onCancel: () => void;
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string; icon: string }[] = [
  { value: 'daily',   label: 'Daily',   description: 'Every day',   icon: '☀️' },
  { value: 'weekly',  label: 'Weekly',  description: 'Once a week', icon: '📅' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month',icon: '🗓️' },
  { value: 'yearly',  label: 'Yearly',  description: 'Once a year', icon: '🏆' },
];

const EMOJI_OPTIONS = [
  '💧','🏃','📚','🧘','💪','🥗','😴','✍️','🎯','🧠',
  '🌿','🎵','🌅','🏋️','🧹','💊','🐾','🌱','🎨','🙏',
];

const COLOR_OPTIONS = [
  { value: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { value: 'blue',    bg: 'bg-blue-500',    ring: 'ring-blue-400',    light: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
  { value: 'violet',  bg: 'bg-violet-500',  ring: 'ring-violet-400',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700'  },
  { value: 'rose',    bg: 'bg-rose-500',    ring: 'ring-rose-400',    light: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700'    },
  { value: 'amber',   bg: 'bg-amber-500',   ring: 'ring-amber-400',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
  { value: 'cyan',    bg: 'bg-cyan-500',    ring: 'ring-cyan-400',    light: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700'    },
  { value: 'pink',    bg: 'bg-pink-500',    ring: 'ring-pink-400',    light: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700'    },
  { value: 'teal',    bg: 'bg-teal-500',    ring: 'ring-teal-400',    light: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700'    },
];

export default function HabitForm({ existingHabit, onSave, onCancel }: HabitFormProps) {
  const [name, setName]               = useState(existingHabit?.name ?? '');
  const [description, setDescription] = useState(existingHabit?.description ?? '');
  const [frequency, setFrequency]     = useState<Frequency>(existingHabit?.frequency ?? 'daily');
  const [emoji, setEmoji]             = useState(existingHabit?.emoji ?? '🌱');
  const [color, setColor]             = useState(existingHabit?.color ?? 'emerald');
  const [nameError, setNameError]     = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description);
      setFrequency(existingHabit.frequency);
      setEmoji(existingHabit.emoji ?? '🌱');
      setColor(existingHabit.color ?? 'emerald');
    }
  }, [existingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error!);
      return;
    }
    setNameError('');
    onSave(validation.value, description.trim(), frequency, emoji, color);
  };

  const activeColor = COLOR_OPTIONS.find((c) => c.value === color) ?? COLOR_OPTIONS[0];

  return (
    <div
      data-testid="habit-form"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Colour accent header */}
      <div className={`h-1.5 w-full ${activeColor.bg}`} />

      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-5">
          {existingHabit ? 'Edit habit' : 'New habit'}
        </h3>

        <form onSubmit={handleSubmit} noValidate>

          {/* Emoji + Name row */}
          <div className="flex gap-3 mb-4">
            {/* Emoji picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-xl hover:border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0"
                aria-label="Choose emoji"
              >
                {emoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-5 gap-1 w-44">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-gray-100 transition-colors ${emoji === e ? 'bg-gray-100 ring-2 ring-gray-300' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name input */}
            <div className="flex-1">
              <input
                id="habit-name"
                type="text"
                data-testid="habit-name-input"
                value={name}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
                className={`w-full px-4 py-2.5 rounded-xl border ${nameError ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm`}
                placeholder="Habit name *"
              />
              {nameError && <p className="mt-1.5 text-xs text-red-600">{nameError}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <textarea
              id="habit-description"
              data-testid="habit-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm resize-none"
              placeholder="Why does this habit matter? (optional)"
            />
          </div>

          {/* Frequency selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2" data-testid="habit-frequency-select">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    frequency === opt.value
                      ? `${activeColor.light} ${activeColor.border} border-2`
                      : 'bg-gray-50 border-gray-200 border hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg leading-none">{opt.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold leading-none mb-0.5 ${frequency === opt.value ? activeColor.text : 'text-gray-800'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 leading-none">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Colour picker */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Colour
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform hover:scale-110 ${color === c.value ? `ring-2 ring-offset-2 ${c.ring} scale-110` : ''}`}
                  aria-label={`${c.value} colour`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="habit-save-button"
              className={`flex-1 py-2.5 px-4 ${activeColor.bg} hover:opacity-90 text-white font-semibold rounded-xl transition-opacity text-sm`}
            >
              {existingHabit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}