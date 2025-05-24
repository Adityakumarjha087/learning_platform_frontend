'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

interface Course {
  id: string;
  title: string;
  description: string;
  enrolledStudents?: number;
  isEnrolled?: boolean;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

  const handleEnroll = async (courseId: string) => {
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/enroll`);
      setSelectedCourse(courses.find(c => c.id === courseId) || null);
      setShowEnrollmentSuccess(true);
      fetchCourses();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowEnrollmentSuccess(false);
        setSelectedCourse(null);
      }, 3000);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['learner']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Courses</h1>

        {/* Enrollment Success Modal */}
        <AnimatePresence>
          {showEnrollmentSuccess && selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Enrollment Successful!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have successfully enrolled in {selectedCourse.title}
                </p>
                <button
                  onClick={() => setShowEnrollmentSuccess(false)}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {course.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {course.enrolledStudents ?? 0} students enrolled
                </span>
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={course.isEnrolled}
                  className={`btn-primary ${
                    course.isEnrolled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {course.isEnrolled ? 'Enrolled' : 'Enroll Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}