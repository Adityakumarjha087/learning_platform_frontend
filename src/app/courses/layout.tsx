import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses | Learning Platform',
  description: 'Browse and join available courses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
