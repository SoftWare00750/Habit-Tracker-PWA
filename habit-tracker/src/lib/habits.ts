export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: Frequency;
  createdAt: string;
  completions: string[];
  color?: string;
  emoji?: string;
};