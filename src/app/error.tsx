'use client';

import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div role="alert" className="glass-card w-full max-w-md p-8 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page failed to load. You can try again or go back to the home page.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-500">Reference: {error.digest}</p>
        )}
        <div className="flex justify-center gap-4 pt-2">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link
            href="/"
            className="glass-card px-6 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
