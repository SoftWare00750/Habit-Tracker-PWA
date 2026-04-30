import { Frequency } from '../types/habit';

export function calculateCurrentStreak(
  completions: string[],
  today?: string,
  frequency: Frequency = 'daily'
): number {
  const todayStr = today ?? new Date().toISOString().split('T')[0];
  const unique = Array.from(new Set(completions)).sort();

  if (unique.length === 0) return 0;

  if (frequency === 'daily') {
    if (!unique.includes(todayStr)) return 0;
    let streak = 0;
    let current = new Date(todayStr);
    while (true) {
      const dateStr = current.toISOString().split('T')[0];
      if (unique.includes(dateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  if (frequency === 'weekly') {
    const todayDate = new Date(todayStr);
    const currentWeekStart = getWeekStart(todayDate);
    const currentWeekKey = formatDate(currentWeekStart);

    const weekKeys = unique.map((d) => formatDate(getWeekStart(new Date(d))));
    const uniqueWeeks = Array.from(new Set(weekKeys)).sort();

    if (!uniqueWeeks.includes(currentWeekKey)) return 0;

    let streak = 0;
    let checkDate = new Date(currentWeekStart);
    while (true) {
      const key = formatDate(checkDate);
      if (uniqueWeeks.includes(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        break;
      }
    }
    return streak;
  }

  if (frequency === 'monthly') {
    const todayDate = new Date(todayStr);
    const currentMonthKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}`;

    const monthKeys = unique.map((d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    });
    const uniqueMonths = Array.from(new Set(monthKeys)).sort();

    if (!uniqueMonths.includes(currentMonthKey)) return 0;

    let streak = 0;
    let checkDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
      if (uniqueMonths.includes(key)) {
        streak++;
        checkDate.setMonth(checkDate.getMonth() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  if (frequency === 'yearly') {
    const currentYear = new Date(todayStr).getFullYear();
    const years = unique.map((d) => new Date(d).getFullYear());
    const uniqueYears = Array.from(new Set(years)).sort();

    if (!uniqueYears.includes(currentYear)) return 0;

    let streak = 0;
    let checkYear = currentYear;
    while (uniqueYears.includes(checkYear)) {
      streak++;
      checkYear--;
    }
    return streak;
  }

  return 0;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isCompletedForPeriod(
  completions: string[],
  today: string,
  frequency: Frequency
): boolean {
  if (frequency === 'daily') {
    return completions.includes(today);
  }

  if (frequency === 'weekly') {
    const todayDate = new Date(today);
    const weekStart = getWeekStart(todayDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return completions.some((c) => {
      const d = new Date(c);
      return d >= weekStart && d <= weekEnd;
    });
  }

  if (frequency === 'monthly') {
    const todayDate = new Date(today);
    return completions.some((c) => {
      const d = new Date(c);
      return d.getFullYear() === todayDate.getFullYear() &&
             d.getMonth() === todayDate.getMonth();
    });
  }

  if (frequency === 'yearly') {
    const currentYear = new Date(today).getFullYear();
    return completions.some((c) => new Date(c).getFullYear() === currentYear);
  }

  return false;
}

export function getFrequencyLabel(frequency: Frequency): string {
  const labels: Record<Frequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return labels[frequency];
}

export function getStreakUnit(frequency: Frequency): string {
  const units: Record<Frequency, string> = {
    daily: 'd',
    weekly: 'w',
    monthly: 'mo',
    yearly: 'yr',
  };
  return units[frequency];
}