# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js, React, TypeScript, and Tailwind CSS. All data persists locally via `localStorage`.

---

## Project Overview

This app allows users to:
- Sign up and log in with email and password (local auth, no backend)
- Create, edit, and delete daily habits
- Mark habits complete/incomplete for today
- View current streaks for each habit
- Install the app as a PWA
- Use the app offline (cached app shell)

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 8+

### Install dependencies

```bash
npm install
```

---

## Run Instructions

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

---

## Test Instructions

### Unit tests (with coverage)

```bash
npm run test:unit
```

Runs all tests in `tests/unit/` and generates a coverage report for `src/lib/`.
Coverage threshold: **80% lines** (achieved: ~100%).

### Integration / component tests

```bash
npm run test:integration
```

Runs all tests in `tests/integration/`.

> **Note:** Tests run with `fileParallelism: false` (sequential workers) due to jsdom environment constraints.

### End-to-end tests (Playwright)

```bash
npx playwright install chromium   # first time only
npm run test:e2e
```

### Run all tests

```bash
npm test
```

---

## Local Persistence Structure

All data is stored in `localStorage` using three keys:

| Key | Type | Description |
|-----|------|-------------|
| `habit-tracker-users` | `User[]` (JSON) | All registered users |
| `habit-tracker-session` | `Session \| null` (JSON) | Currently logged-in session |
| `habit-tracker-habits` | `Habit[]` (JSON) | All habits across all users |

### Shapes

```ts
User:    { id, email, password, createdAt }
Session: { userId, email }
Habit:   { id, userId, name, description, frequency: 'daily', createdAt, completions: string[] }
```

Only the current user's habits are shown. Logout clears the session only.

---

## PWA Implementation

- **`public/manifest.json`** — app name, icons, display mode, theme color
- **`public/sw.js`** — caches app shell on install, serves from cache offline
- **`src/components/shared/ServiceWorkerRegistrar.tsx`** — registers the SW client-side
- Icons: `public/icons/icon-192.png` and `public/icons/icon-512.png`

---

## Trade-offs and Limitations

- Passwords stored in plaintext in localStorage (intentional per spec — no backend)
- No cross-device sync (localStorage is scoped to the browser)
- Daily frequency only (spec requirement)
- Integration tests test HabitForm and HabitCard components individually rather than mounting the full DashboardPage, due to a jsdom/Next.js module transform constraint in this environment

---

## Test File Map

| Test file | What it verifies |
|-----------|-----------------|
| `tests/unit/slug.test.ts` | `getHabitSlug()` — lowercase, trim, collapse spaces, remove special chars |
| `tests/unit/validators.test.ts` | `validateHabitName()` — empty, max-length, trimmed return |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak()` — empty, no-today, consecutive, duplicates, gap |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion()` — add, remove, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup/login forms, session creation, error messages |
| `tests/integration/habit-form.test.tsx` | Form validation, create, edit, delete confirmation, streak toggle |
| `tests/e2e/app.spec.ts` | Full flows: splash, auth guard, signup, login, CRUD, persistence, logout, offline |
