import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My dashboard | Learning Platform',
  description: 'Your enrolled courses and progress.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
