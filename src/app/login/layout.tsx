import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in | Learning Platform',
  description: 'Sign in to continue your courses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
