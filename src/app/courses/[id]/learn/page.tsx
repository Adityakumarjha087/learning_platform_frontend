"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Typography, Space, Button, Form, Radio, Input, message } from 'antd';
import axios from 'axios';
import AudioRecorder from '@/components/AudioRecorder';

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
        // Find the current chapter
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
      // Calculate score
      let score = 0;
      let totalPoints = 0;
      currentChapter?.questions.forEach((question) => {
        totalPoints += question.points;
        if (values[question._id] === question.correctAnswer) {
          score += question.points;
        }
      });
      // Save progress
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
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      // Upload the audio file
      const uploadResponse = await axios.post<{ url: string }>(
        '/api/upload/audio',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Set the answer in the form
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
    <div style={{ padding: '24px' }}>
      <Title level={2}>{currentChapter.title}</Title>
      <Text>{currentChapter.content}</Text>
      <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
        {currentChapter.questions.map((question, index) => (
          <Card key={question._id} style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Question {index + 1}: {question.question}</Text>
              {question.media && (
                <div>
                  {question.media.type === 'image' ? (
                    <img src={question.media.url} alt="Question media" style={{ maxWidth: '100%' }} />
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
                  <Radio.Group>
                    <Space direction="vertical">
                      {question.options?.map((option, optionIndex) => (
                        <Radio key={optionIndex} value={option}>
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
                  <Input placeholder="Enter your answer" />
                </Form.Item>
              )}
              {question.type === 'text' && (
                <Form.Item
                  name={question._id}
                  rules={[{ required: true, message: 'Please enter your answer' }]}
                >
                  <Input.TextArea rows={4} placeholder="Enter your answer" />
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
        <Button type="primary" onClick={handleAnswerSubmit}>
          Submit Answers
        </Button>
      </Form>
    </div>
  );
};

export default LearningInterface;