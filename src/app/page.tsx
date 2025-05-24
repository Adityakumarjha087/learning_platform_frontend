'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from "next/image";
import styles from "./page.module.css";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
              Transform Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Discover a world of knowledge with our interactive courses and personalized learning experience.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
              <Link href="/login" className="glass-card px-6 py-2 text-primary-600 hover:bg-primary-50 transition-colors">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Experience learning like never before
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="feature-card"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of learners who are already transforming their lives.
            </p>
            <Link href="/register" className="btn-primary">
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: 'Interactive Learning',
    description: 'Engage with dynamic content and real-time feedback to enhance your learning experience.',
    icon: '🎯',
  },
  {
    title: 'Personalized Path',
    description: 'Follow a customized learning path that adapts to your goals and progress.',
    icon: '🎨',
  },
  {
    title: 'Expert Instructors',
    description: 'Learn from industry experts and experienced professionals in their fields.',
    icon: '👨‍🏫',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed progress reports and analytics.',
    icon: '📊',
  },
  {
    title: 'Community Support',
    description: 'Connect with fellow learners and get help when you need it.',
    icon: '👥',
  },
  {
    title: 'Flexible Schedule',
    description: 'Learn at your own pace with 24/7 access to course materials.',
    icon: '⏰',
  },
];
