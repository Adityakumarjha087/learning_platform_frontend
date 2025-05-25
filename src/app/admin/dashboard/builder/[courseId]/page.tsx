"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button, Input, List, Typography, message, Spin, Empty } from 'antd';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

interface Question {
  _id: string;
  type: 'mcq' | 'fill' | 'text' | 'audio';
  text: string;
  options?: string[];
  correctAnswer: string;
  mediaUrl?: string;
}

interface Chapter {
  _id: string;
  title: string;
  content: string;
  questions: Question[];
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

const CourseBuilderPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [unitTitle, setUnitTitle] = useState<{ [sectionId: string]: string }>({});
  const [unitDescription, setUnitDescription] = useState<{ [sectionId: string]: string }>({});
  const [addingUnit, setAddingUnit] = useState<{ [sectionId: string]: boolean }>({});
  const [chapterTitle, setChapterTitle] = useState<{ [unitId: string]: string }>({});
  const [chapterContent, setChapterContent] = useState<{ [unitId: string]: string }>({});
  const [addingChapter, setAddingChapter] = useState<{ [unitId: string]: boolean }>({});
  const [questionType, setQuestionType] = useState<{ [chapterId: string]: string }>({});
  const [questionText, setQuestionText] = useState<{ [chapterId: string]: string }>({});
  const [questionOptions, setQuestionOptions] = useState<{ [chapterId: string]: string[] }>({});
  const [questionCorrect, setQuestionCorrect] = useState<{ [chapterId: string]: string }>({});
  const [addingQuestion, setAddingQuestion] = useState<{ [chapterId: string]: boolean }>({});

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ data: Course }>(`${API_URL}/api/courses/${courseId}`);
      setCourse(res.data.data);
    } catch (error) {
      message.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) return;
    setAdding(true);
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/sections`, {
        title: sectionTitle,
        description: sectionDescription,
      });
      setSectionTitle('');
      setSectionDescription('');
      fetchCourse();
      message.success('Section added!');
    } catch (error) {
      message.error('Failed to add section');
    } finally {
      setAdding(false);
    }
  };

  const handleAddUnit = async (sectionId: string) => {
    if (!unitTitle[sectionId]?.trim()) return;
    setAddingUnit(prev => ({ ...prev, [sectionId]: true }));
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/sections/${sectionId}/units`, {
        title: unitTitle[sectionId],
        description: unitDescription[sectionId],
      });
      setUnitTitle(prev => ({ ...prev, [sectionId]: '' }));
      setUnitDescription(prev => ({ ...prev, [sectionId]: '' }));
      fetchCourse();
      message.success('Unit added!');
    } catch (error) {
      message.error('Failed to add unit');
    } finally {
      setAddingUnit(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleAddChapter = async (sectionId: string, unitId: string) => {
    if (!chapterTitle[unitId]?.trim()) return;
    setAddingChapter(prev => ({ ...prev, [unitId]: true }));
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/sections/${sectionId}/units/${unitId}/chapters`, {
        title: chapterTitle[unitId],
        content: chapterContent[unitId],
      });
      setChapterTitle(prev => ({ ...prev, [unitId]: '' }));
      setChapterContent(prev => ({ ...prev, [unitId]: '' }));
      fetchCourse();
      message.success('Chapter added!');
    } catch (error) {
      message.error('Failed to add chapter');
    } finally {
      setAddingChapter(prev => ({ ...prev, [unitId]: false }));
    }
  };

  const handleAddQuestion = async (sectionId: string, unitId: string, chapterId: string) => {
    if (!questionText[chapterId]?.trim()) return;
    setAddingQuestion(prev => ({ ...prev, [chapterId]: true }));
    try {
      await axios.post(`${API_URL}/api/courses/${courseId}/sections/${sectionId}/units/${unitId}/chapters/${chapterId}/questions`, {
        type: questionType[chapterId] || 'mcq',
        text: questionText[chapterId],
        options: questionType[chapterId] === 'mcq' ? questionOptions[chapterId] : undefined,
        correctAnswer: questionCorrect[chapterId],
      });
      setQuestionType(prev => ({ ...prev, [chapterId]: 'mcq' }));
      setQuestionText(prev => ({ ...prev, [chapterId]: '' }));
      setQuestionOptions(prev => ({ ...prev, [chapterId]: [] }));
      setQuestionCorrect(prev => ({ ...prev, [chapterId]: '' }));
      fetchCourse();
      message.success('Question added!');
    } catch (error) {
      message.error('Failed to add question');
    } finally {
      setAddingQuestion(prev => ({ ...prev, [chapterId]: false }));
    }
  };

  const handleOptionChange = (chapterId: string, idx: number, value: string) => {
    setQuestionOptions(prev => {
      const opts = prev[chapterId] ? [...prev[chapterId]] : [];
      opts[idx] = value;
      return { ...prev, [chapterId]: opts };
    });
  };

  const addOption = (chapterId: string) => {
    setQuestionOptions(prev => ({ ...prev, [chapterId]: [...(prev[chapterId] || []), ''] }));
  };

  if (loading) return <Spin size="large" />;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Title level={2} className="mb-8 text-center text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">
            Course Builder: {course?.title}
          </Title>
          <div className="mb-8">
            <Title level={4} className="mb-4 text-blue-700 dark:text-blue-300 text-lg sm:text-2xl">Sections</Title>
            <List
              bordered
              dataSource={course?.sections || []}
              locale={{ emptyText: <Empty description="No sections yet. Add your first section!" /> }}
              renderItem={section => (
                <List.Item style={{ display: 'block', background: '#f7f8fa', marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '100%' }}>
                    <strong className="text-lg text-blue-700 dark:text-blue-300">{section.title}</strong>
                    <div className="text-gray-500 mb-2">{section.description}</div>
                    <div className="ml-0 sm:ml-4 mb-2">
                      <Title level={5} className="mb-2 text-purple-700 dark:text-purple-300 text-base sm:text-lg">Units</Title>
                      <List
                        size="small"
                        bordered
                        dataSource={section.units || []}
                        locale={{ emptyText: <Empty description="No units yet. Add your first unit!" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        renderItem={unit => (
                          <List.Item style={{ display: 'block', background: '#f0f4fa', marginBottom: 8, borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '100%' }}>
                              <strong className="text-base text-purple-700 dark:text-purple-300">{unit.title}</strong>
                              <div className="text-gray-500 mb-1">{unit.description}</div>
                              <div className="ml-0 sm:ml-4 mb-2">
                                <Title level={5} className="mb-2 text-pink-700 dark:text-pink-300 text-base sm:text-lg">Chapters</Title>
                                <List
                                  size="small"
                                  bordered
                                  dataSource={unit.chapters || []}
                                  locale={{ emptyText: <Empty description="No chapters yet. Add your first chapter!" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                                  renderItem={chapter => (
                                    <List.Item style={{ display: 'block', background: '#f8f0fa', marginBottom: 6, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                                      <div style={{ width: '100%' }}>
                                        <strong className="text-pink-700 dark:text-pink-300">{chapter.title}</strong>
                                        <div className="text-gray-500 mb-1">{chapter.content}</div>
                                        <div className="ml-0 sm:ml-4 mb-2">
                                          <Title level={5} className="mb-2 text-indigo-700 dark:text-indigo-300 text-base sm:text-lg">Questions</Title>
                                          <List
                                            size="small"
                                            bordered
                                            dataSource={chapter.questions || []}
                                            locale={{ emptyText: <Empty description="No questions yet. Add your first question!" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                                            renderItem={q => (
                                              <List.Item>
                                                <div>
                                                  <strong>{q.text}</strong> <span className="text-xs text-gray-400">[{q.type}]</span>
                                                  {q.type === 'mcq' && q.options && (
                                                    <ul className="ml-4">
                                                      {q.options.map((opt, i) => (
                                                        <li key={i} className={opt === q.correctAnswer ? 'font-bold text-green-600' : ''}>{opt}</li>
                                                      ))}
                                                    </ul>
                                                  )}
                                                  {q.type !== 'mcq' && (
                                                    <div className="text-gray-500">Correct: {q.correctAnswer}</div>
                                                  )}
                                                </div>
                                              </List.Item>
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </List.Item>
                                  )}
                                />
                                <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                                  <Title level={5}>Add New Chapter</Title>
                                  <Input
                                    placeholder="Chapter Title"
                                    value={chapterTitle[unit._id] || ''}
                                    onChange={e => setChapterTitle({ ...chapterTitle, [unit._id]: e.target.value })}
                                    className="mb-2"
                                  />
                                  <Input.TextArea
                                    placeholder="Chapter Content"
                                    value={chapterContent[unit._id] || ''}
                                    onChange={e => setChapterContent({ ...chapterContent, [unit._id]: e.target.value })}
                                    className="mb-2"
                                  />
                                  <Button
                                    type="dashed"
                                    onClick={() => handleAddChapter(section._id, unit._id)}
                                    block
                                    icon={<PlusOutlined />}
                                    loading={addingChapter[unit._id]}
                                  >
                                    Add Chapter
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                      <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <Title level={5}>Add New Unit</Title>
                        <Input
                          placeholder="Unit Title"
                          value={unitTitle[section._id] || ''}
                          onChange={e => setUnitTitle({ ...unitTitle, [section._id]: e.target.value })}
                          className="mb-2"
                        />
                        <Input.TextArea
                          placeholder="Unit Description"
                          value={unitDescription[section._id] || ''}
                          onChange={e => setUnitDescription({ ...unitDescription, [section._id]: e.target.value })}
                          className="mb-2"
                        />
                        <Button
                          type="dashed"
                          onClick={() => handleAddUnit(section._id)}
                          block
                          icon={<PlusOutlined />}
                          loading={addingUnit[section._id]}
                        >
                          Add Unit
                        </Button>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div className="mt-8 p-4 border rounded-lg bg-white dark:bg-gray-800">
              <Title level={4}>Add New Section</Title>
              <Input
                placeholder="Section Title"
                value={sectionTitle}
                onChange={e => setSectionTitle(e.target.value)}
                className="mb-2"
              />
              <Input.TextArea
                placeholder="Section Description"
                value={sectionDescription}
                onChange={e => setSectionDescription(e.target.value)}
                className="mb-2"
              />
              <Button
                type="dashed"
                onClick={handleAddSection}
                block
                icon={<PlusOutlined />}
                loading={adding}
              >
                Add Section
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseBuilderPage; 