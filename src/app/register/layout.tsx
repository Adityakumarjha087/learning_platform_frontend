import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create account | Learning Platform',
  description: 'Create a learner or admin account.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
