import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 text-center space-y-4">
        <p className="text-sm font-medium text-primary-600">404</p>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link
            href="/courses"
            className="glass-card px-6 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
