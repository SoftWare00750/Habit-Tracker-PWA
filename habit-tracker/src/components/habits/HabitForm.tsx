'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
  existingHabit?: Habit | null;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function HabitForm({ existingHabit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(existingHabit?.name ?? '');
  const [description, setDescription] = useState(existingHabit?.description ?? '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description);
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
    onSave(validation.value, description.trim());
  };

  return (
    <div
      data-testid="habit-form"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        {existingHabit ? 'Edit habit' : 'New habit'}
      </h3>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="habit-name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="habit-name"
            type="text"
            data-testid="habit-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              nameError ? 'border-red-300 bg-red-50' : 'border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm`}
            placeholder="e.g. Drink Water"
          />
          {nameError && (
            <p className="mt-1.5 text-xs text-red-600">{nameError}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="habit-description"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="habit-description"
            data-testid="habit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm resize-none"
            placeholder="Why this habit matters…"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="habit-frequency"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            defaultValue="daily"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm bg-white"
          >
            <option value="daily">Daily</option>
          </select>
        </div>

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
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {existingHabit ? 'Save changes' : 'Create habit'}
          </button>
        </div>
      </form>
    </div>
  );
}
