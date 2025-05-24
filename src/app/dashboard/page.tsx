'use client';

import React, { useEffect, useState } from 'react';
import { Card, Progress, Typography, Space, Button, List, Tag, Row, Col, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';

const { Title, Text } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com/';

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
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          axios.get(`${API_URL}/api/courses/enrolled`),
          axios.get(`${API_URL}/api/progress`),
        ]);
        setEnrolledCourses((coursesRes.data as { data: Course[] }).data);
        setProgress((progressRes.data as { data: Record<string, UserProgress> }).data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

    const course = enrolledCourses.find(c => c._id === courseId);
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
                {user?.role === 'admin' && (
                  <button
                    className="btn-primary"
                    onClick={() => router.push('/admin/dashboard')}
                  >
                    Switch to Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
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
            <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
          </div>
          <div style={{ padding: '24px' }}>
            <Title level={2}>My Learning Dashboard</Title>

            {enrolledCourses && enrolledCourses.length > 0 ? (
              <Row gutter={[16, 16]}>
                {enrolledCourses.map((course) => {
                  const currentChapter = findCurrentChapter(course, course._id);
                  const courseProgress = progress[course._id];
                  const progressPercentage = calculateProgress(course._id);

                  return (
                    <Col xs={24} sm={12} md={8} key={course._id}>
                      <Card
                        title={course.title}
                        extra={
                          <Button
                            type="primary"
                            onClick={() => router.push(`/courses/${course._id}/learn`)}
                          >
                            Continue Learning
                          </Button>
                        }
                      >
                        <div style={{ marginBottom: '16px' }}>
                          <Text>Progress</Text>
                          <Progress percent={Math.round(progressPercentage)} />
                        </div>

                        {currentChapter && (
                          <div>
                            <Text strong>Current Chapter:</Text>
                            <Text> {currentChapter.title}</Text>
                          </div>
                        )}

                        {courseProgress && (
                          <div style={{ marginTop: '16px' }}>
                            <Text strong>Quiz Score:</Text>
                            <Text> {courseProgress.quizScores.length > 0 ? courseProgress.quizScores[0].score : 'N/A'}</Text>
                          </div>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Card>
                <Title level={4}>No Enrolled Courses</Title>
                <Text>You haven't enrolled in any courses yet.</Text>
                <div style={{ marginTop: '16px' }}>
                  <Button type="primary" onClick={() => router.push('/courses')}>
                    Browse Courses
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;