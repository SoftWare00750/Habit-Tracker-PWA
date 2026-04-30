'use client';

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700"
    >
      <div className="text-center">
        <div className="mb-4 text-6xl">🌱</div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          Habit Tracker
        </h1>
        <p className="text-emerald-100 text-sm font-medium tracking-widest uppercase">
          Build better every day
        </p>
        <div className="mt-8 flex gap-1 justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
