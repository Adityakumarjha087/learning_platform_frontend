'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, Button, Typography, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

interface Course {
  _id: string;
  title: string;
  description: string;
  enrolledStudents: number;
  enrolledUsers: {
    _id: string;
    name: string;
    email: string;
  }[];
  price: number;
}

// Lazy load the course card component
const CourseCard = dynamic(() => import('@/components/CourseCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl"></div>
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
  });
  const [addCourseError, setAddCourseError] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<{ data: Course[] }>(`${API_URL}/api/courses/instructor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourseError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/courses`,
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowAddCourse(false);
      setNewCourse({ title: '', description: '', price: 0 });
      fetchCourses();
      message.success('Course added successfully');
    } catch (error: any) {
      setAddCourseError(error.response?.data?.message || 'Error adding course');
      console.error('Error adding course:', error);
    }
  }, [newCourse, fetchCourses]);

  const toggleEnrolledUsers = useCallback((courseId: string) => {
    setExpandedCourse(prev => prev === courseId ? null : courseId);
  }, []);

  const memoizedCourses = useMemo(() => courses, [courses]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-4 md:py-0">
              <div className="flex items-center mb-4 md:mb-0">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
                >
                  Switch to User Dashboard
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:from-pink-600 hover:to-purple-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 drop-shadow">Admin Dashboard</h1>
            <button
              onClick={() => setShowAddCourse(true)}
              className="w-full md:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
            >
              Add New Course
            </button>
          </div>
          {/* Add Course Modal */}
          {showAddCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[2000]">
              <div className="bg-white dark:bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative focus:outline-none focus:ring-2 focus:ring-primary-500">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Course</h2>
                <form onSubmit={handleAddCourse} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price (₹)</label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>
                  {addCourseError && (
                    <div className="text-red-400 bg-red-900/30 border border-red-700 rounded p-2 text-center">
                      {addCourseError}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
                    >
                      Add Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Courses List */}
          <div className="glass-card p-6 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">Courses</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {memoizedCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    expandedCourse={expandedCourse}
                    onToggleEnrolledUsers={toggleEnrolledUsers}
                    onManage={() => router.push(`/admin/dashboard/builder/${course._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}