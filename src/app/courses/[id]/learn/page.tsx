"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Typography, Space, Button, Form, Radio, Input, message } from 'antd';
import axios from 'axios';
import AudioRecorder from '@/components/AudioRecorder';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Question {
  _id: string;
  type: 'multiple-choice' | 'fill-blank' | 'text' | 'audio';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  media?: {
    type: 'image' | 'audio';
    url: string;
  };
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

const LearningInterface: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [course, setCourse] = useState<Course | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const chapterId = searchParams.get('chapter');
        const { data } = await axios.get<Course>(`/api/courses/${id}`);
        setCourse(data);
        let found = false;
        for (const section of data.sections) {
          for (const unit of section.units) {
            for (const chapter of unit.chapters) {
              if (chapter._id === chapterId) {
                setCurrentChapter(chapter);
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (found) break;
        }
      } catch (error) {
        message.error('Failed to load course content');
      }
    };
    if (id) {
      fetchCourse();
    }
  }, [id, searchParams]);

  const handleAnswerSubmit = async () => {
    try {
      const values = await form.validateFields();
      const chapterId = searchParams.get('chapter');
      let score = 0;
      let totalPoints = 0;
      currentChapter?.questions.forEach((question) => {
        totalPoints += question.points;
        if (values[question._id] === question.correctAnswer) {
          score += question.points;
        }
      });
      await axios.post('/api/progress', {
        courseId: id,
        chapterId,
        score,
        totalPoints,
      });
      message.success('Answers submitted successfully!');
      router.push('/dashboard');
    } catch (error) {
      message.error('Failed to submit answers');
    }
  };

  const handleAudioRecording = async (questionId: string, audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      const uploadResponse = await axios.post<{ url: string }>(
        '/api/upload/audio',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      form.setFieldsValue({
        [questionId]: uploadResponse.data.url,
      });
    } catch (error) {
      message.error('Failed to upload audio recording');
    }
  };

  if (!course || !currentChapter) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-6 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center mb-8 gap-2 sm:gap-4">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            className="text-blue-600 dark:text-blue-300 font-semibold w-full sm:w-auto"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Title level={2} className="sm:ml-4 mb-0 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow text-center sm:text-left">
            {currentChapter.title}
          </Title>
        </div>
        <Card className="rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/80 border-0 mb-8">
          <Text className="text-base sm:text-lg text-gray-700 dark:text-gray-300">{currentChapter.content}</Text>
        </Card>
        <Form form={form} layout="vertical" style={{ marginTop: '24px' }} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg">
          {currentChapter.questions.map((question, index) => (
            <Card key={question._id} className="mb-6 rounded-xl shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border-0">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong className="text-base sm:text-lg text-blue-700 dark:text-blue-300">Question {index + 1}: {question.question}</Text>
                {question.media && (
                  <div>
                    {question.media.type === 'image' ? (
                      <img src={question.media.url} alt="Question media" style={{ maxWidth: '100%' }} className="rounded-lg border" />
                    ) : (
                      <audio controls src={question.media.url} />
                    )}
                  </div>
                )}
                {question.type === 'multiple-choice' && (
                  <Form.Item
                    name={question._id}
                    rules={[{ required: true, message: 'Please select an answer' }]}
                  >
                    <Radio.Group className="flex flex-col gap-2">
                      <Space direction="vertical">
                        {question.options?.map((option, optionIndex) => (
                          <Radio key={optionIndex} value={option} className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 w-full sm:w-auto">
                            {option}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                )}
                {question.type === 'fill-blank' && (
                  <Form.Item
                    name={question._id}
                    rules={[{ required: true, message: 'Please fill in the blank' }]}
                  >
                    <Input placeholder="Enter your answer" className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 w-full" />
                  </Form.Item>
                )}
                {question.type === 'text' && (
                  <Form.Item
                    name={question._id}
                    rules={[{ required: true, message: 'Please enter your answer' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Enter your answer" className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 w-full" />
                  </Form.Item>
                )}
                {question.type === 'audio' && (
                  <Form.Item
                    name={question._id}
                    rules={[{ required: true, message: 'Please record your answer' }]}
                  >
                    <div>
                      <AudioRecorder
                        onRecordingComplete={(audioBlob) => handleAudioRecording(question._id, audioBlob)}
                      />
                      {form.getFieldValue(question._id) && (
                        <div style={{ marginTop: '16px' }}>
                          <Text>Your recording:</Text>
                          <audio controls src={form.getFieldValue(question._id)} />
                        </div>
                      )}
                    </div>
                  </Form.Item>
                )}
              </Space>
            </Card>
          ))}
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 border-0 font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition text-base sm:text-lg"
            onClick={handleAnswerSubmit}
          >
            Submit Answers
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LearningInterface;
