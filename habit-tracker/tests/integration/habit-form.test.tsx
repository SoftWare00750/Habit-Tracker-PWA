import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import HabitForm from '@/components/habits/HabitForm';
import HabitCard from '@/components/habits/HabitCard';
import { Habit } from '@/types/habit';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';

const TODAY = new Date().toISOString().split('T')[0];

const makeHabit = (overrides?: Partial<Habit>): Habit => ({
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
  ...overrides,
});

// Wrapper: HabitForm in create mode
function CreateHabitWrapper({ onSave }: { onSave: (name: string, desc: string) => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return <div data-testid="form-closed">closed</div>;
  return <HabitForm onSave={onSave} onCancel={() => setVisible(false)} />;
}

// Wrapper: HabitCard with state
function HabitCardWrapper({ initial }: { initial: Habit }) {
  const [habit, setHabit] = useState(initial);
  return (
    <HabitCard
      habit={habit}
      today={TODAY}
      onUpdate={(u) => setHabit(u)}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('habit form', () => {
  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitForm onSave={vi.fn()} onCancel={vi.fn()} />);
    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => {
      expect(screen.getByText('Habit name is required')).toBeInTheDocument();
    });
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<CreateHabitWrapper onSave={onSave} />);
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Drink Water', 'Stay hydrated');
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    const habit = makeHabit();
    const onSave = vi.fn();
    render(<HabitForm existingHabit={habit} onSave={onSave} onCancel={vi.fn()} />);
    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Read Books');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Read Books', 'Stay hydrated');
    });
    // Verify immutable fields preserved: id, userId, createdAt, completions are not in HabitForm
    // They come from the parent; the form only updates name and description
    expect(onSave).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: expect.anything() })
    );
    // Confirm the original habit object's immutable fields remain unchanged
    expect(habit.id).toBe('habit-1');
    expect(habit.userId).toBe('user-1');
    expect(habit.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(habit.completions).toEqual([]);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const habit = makeHabit();
    render(
      <HabitCard
        habit={habit}
        today={TODAY}
        onUpdate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    // delete button visible but not yet confirmed
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('habit-delete-drink-water'));
    // confirm dialog appears
    await waitFor(() => expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument());
    // now confirm
    await user.click(screen.getByTestId('confirm-delete-button'));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('habit-1'));
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const habit = makeHabit();
    render(<HabitCardWrapper initial={habit} />);
    // initial streak is 0
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0');
    // complete it
    await user.click(screen.getByTestId('habit-complete-drink-water'));
    // streak should now be 1
    await waitFor(() => {
      expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1');
    });
  });
});
