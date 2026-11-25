import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create course | Learning Platform',
  description: 'Create a new course.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
