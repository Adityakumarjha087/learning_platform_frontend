'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

interface Course {
  id: string;
  title: string;
  description: string;
  enrolledStudents: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
  });
  const [addCourseError, setAddCourseError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get<{ data: Course[] }>(`${API_URL}/api/courses`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
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
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (error: any) {
      setAddCourseError(error.response?.data?.message || 'Error adding course');
      console.error('Error adding course:', error);
    }
  };

  const handleRemoveStudent = async (courseId: string, studentId: string) => {
    try {
      await axios.delete(`${API_URL}/api/courses/${courseId}/students/${studentId}`);
      fetchCourses();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <nav className="glass-card sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Learning Platform
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={() => { router.push('/dashboard'); }}
                  className="btn-primary"
                >
                  Switch to User Dashboard
                </button>
                <button
                  onClick={() => { window.location.href = '/login'; }}
                  className="btn-primary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={() => setShowAddCourse(true)}
              className="btn-primary"
            >
              Add New Course
            </button>
          </div>

          {/* Add Course Modal */}
          {showAddCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[2000]">
              <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative focus:outline-none focus:ring-2 focus:ring-primary-500">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white">Add New Course</h2>
                <form onSubmit={handleAddCourse} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white p-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      rows={4}
                      required
                    />
                  </div>
                  {addCourseError && (
                    <div className="text-red-400 bg-red-900/30 border border-red-700 rounded p-2 text-center">
                      {addCourseError}
                    </div>
                  )}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Courses List */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="card hover:shadow-xl bg-gray-800 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {course.enrolledStudents} students enrolled
                    </span>
                    <button
                      onClick={() => handleRemoveStudent(course.id, 'student-id')}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}