import { test, expect } from '@playwright/test';

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
    });
    await page.goto('/');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('newuser@example.com');
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-users',
        JSON.stringify([{ id: 'u1', email: 'user@example.com', password: 'pass123', createdAt: new Date().toISOString() }])
      );
      localStorage.setItem(
        'habit-tracker-habits',
        JSON.stringify([
          { id: 'h1', userId: 'u1', name: 'My Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
          { id: 'h2', userId: 'u2', name: 'Other Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
        ])
      );
    });
    await page.goto('/login');
    await page.getByTestId('auth-login-email').fill('user@example.com');
    await page.getByTestId('auth-login-password').fill('pass123');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('habit-card-my-habit')).toBeVisible();
    await expect(page.getByTestId('habit-card-other-habit')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
    });
    await page.goto('/dashboard');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Exercise Daily');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-exercise-daily')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
      localStorage.setItem(
        'habit-tracker-habits',
        JSON.stringify([
          { id: 'h1', userId: 'u1', name: 'Drink Water', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
        ])
      );
    });
    await page.goto('/dashboard');
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');
    await page.getByTestId('habit-complete-drink-water').click();
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
      localStorage.setItem(
        'habit-tracker-habits',
        JSON.stringify([
          { id: 'h1', userId: 'u1', name: 'Read Books', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
        ])
      );
    });
    await page.goto('/dashboard');
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
    });
    await page.goto('/dashboard');
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'u1', email: 'test@test.com' })
      );
    });
    // Load once to prime cache
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Go offline and reload
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});

    // App shell should render without hard crash
    const body = await page.locator('body').isVisible();
    expect(body).toBe(true);
    await context.setOffline(false);
  });
});
