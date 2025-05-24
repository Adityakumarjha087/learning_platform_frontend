'use client';

import React, { useEffect, useState } from 'react';
import { Card, Progress, Typography, Space, Button, List, Tag, Row, Col, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

interface QuizScore {
  chapterId: string;
  score: number;
  totalPoints: number;
  lastAttempt: string;
}

interface Chapter {
  _id: string;
  title: string;
  content: string;
  questions: any[];
}

interface Unit {
  _id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Section {
  _id: string;
  title: string;
  description: string;
  units: Unit[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
  price: number;
  enrolledStudents?: number;
}

interface UserProgress {
  currentSection: string;
  currentUnit: string;
  currentChapter: string;
  completedChapters: string[];
  quizScores: QuizScore[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Fetch all courses
      const allCoursesRes = await axios.get(`${API_URL}/api/courses`);
      setAllCourses(allCoursesRes.data.data);

      // Fetch enrolled courses for the current user
      const enrolledRes = await axios.get(`${API_URL}/api/courses/enrolled`);
      setEnrolledCourseIds(enrolledRes.data.data.map((c: Course) => c._id));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/enroll`);
      message.success('Enrolled successfully!');
      // Refetch enrolled courses to update UI
      const enrolledRes = await axios.get(`${API_URL}/api/courses/enrolled`);
      setEnrolledCourseIds(enrolledRes.data.data.map((c: Course) => c._id));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error enrolling in course');
      console.error('Error enrolling:', error);
    }
  };

  const getChapterProgress = (courseId: string, chapterId: string) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return 0;

    const quizScore = courseProgress.quizScores.find(
      (score) => score.chapterId === chapterId
    );

    if (quizScore) {
      return (quizScore.score / quizScore.totalPoints) * 100;
    }

    return courseProgress.completedChapters.includes(chapterId) ? 100 : 0;
  };

  const getQuizScore = (courseId: string, chapterId: string) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return null;

    return courseProgress.quizScores.find(
      (score) => score.chapterId === chapterId
    );
  };

  const findCurrentChapter = (course: Course, courseId: string) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return null;

    for (const section of course.sections) {
      for (const unit of section.units) {
        for (const chapter of unit.chapters) {
          if (!courseProgress.completedChapters.includes(chapter._id)) {
            return chapter;
          }
        }
      }
    }
    return null;
  };

  const calculateProgress = (courseId: string) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return 0;

    const course = allCourses.find(c => c._id === courseId);
    if (!course) return 0;

    let totalChapters = 0;
    let completedChapters = 0;

    course.sections.forEach(section => {
      section.units.forEach(unit => {
        unit.chapters.forEach(chapter => {
          totalChapters++;
          if (courseProgress.completedChapters.includes(chapter._id)) {
            completedChapters++;
          }
        });
      });
    });

    return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'learner']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-4 md:py-0">
              <div className="flex items-center mb-4 md:mb-0">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Learning Platform
                </h1>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Welcome, {user?.name}
                </span>
                {user?.role === 'admin' && (
                  <button
                    className="w-full md:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
                    onClick={() => router.push('/admin/dashboard')}
                  >
                    Switch to Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:from-pink-600 hover:to-purple-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-10 text-center drop-shadow">All Courses</h1>
          <Row gutter={[16, 24]} justify="center">
            {allCourses.map((course) => (
              <Col xs={24} sm={24} md={12} lg={8} key={course._id} className="mb-6">
                <Card
                  className="rounded-2xl shadow-xl hover:shadow-2xl transition-all border-0 bg-white/90 dark:bg-gray-900/80 h-full flex flex-col justify-between"
                  title={<span className="font-semibold text-lg text-blue-700 dark:text-blue-300 truncate block">{course.title}</span>}
                  extra={
                    enrolledCourseIds.includes(course._id) ? (
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 font-semibold rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition"
                        onClick={() => router.push(`/courses/${course._id}/learn`)}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 border-0 font-semibold rounded-lg shadow hover:from-pink-600 hover:to-purple-600 transition"
                        onClick={() => handleEnroll(course._id)}
                      >
                        Join
                      </Button>
                    )
                  }
                  style={{ minHeight: 220 }}
                  bodyStyle={{ padding: 20 }}
                >
                  <p className="text-gray-700 dark:text-gray-300 mb-4 min-h-[60px] text-base sm:text-sm md:text-base">{course.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Price: <span className="font-bold text-pink-600 dark:text-pink-400">₹{course.price}</span>
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;