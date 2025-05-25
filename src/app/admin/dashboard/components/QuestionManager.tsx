import React, { useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Select, Upload, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title } = Typography;
const { Option } = Select;

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

interface QuestionManagerProps {
  chapterId: string;
  questions: Question[];
  onAddQuestion: (question: Omit<Question, '_id'>) => Promise<void>;
  onEditQuestion: (questionId: string, question: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
  chapterId,
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();

  const handleAddQuestion = async (values: any) => {
    await onAddQuestion(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditQuestion = async (values: any) => {
    if (editingQuestion) {
      await onEditQuestion(editingQuestion._id, values);
      setEditingQuestion(null);
      setIsModalVisible(false);
      form.resetFields();
    }
  };

  const showModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      form.setFieldsValue(question);
    } else {
      setEditingQuestion(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({
          media: {
            type: info.file.type?.startsWith('image/') ? 'image' : 'audio',
            url: info.file.response?.url || '',
          },
        });
      }
    },
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Question
        </Button>
      </Space>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {questions.map((question) => (
          <Card
            key={question._id}
            title={`Question (${question.type})`}
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => showModal(question)}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteQuestion(question._id)}
                />
              </Space>
            }
          >
            <p>{question.question}</p>
            {question.options && (
              <div>
                <strong>Options:</strong>
                <ul>
                  {question.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            )}
            <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
            <p><strong>Points:</strong> {question.points}</p>
            {question.media && (
              <div>
                {question.media.type === 'image' ? (
                  <img src={question.media.url} alt="Question media" style={{ maxWidth: '100%' }} />
                ) : (
                  <audio controls src={question.media.url} />
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingQuestion(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={editingQuestion ? handleEditQuestion : handleAddQuestion}
          layout="vertical"
        >
          <Form.Item
            name="type"
            label="Question Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="multiple-choice">Multiple Choice</Option>
              <Option value="fill-blank">Fill in the Blank</Option>
              <Option value="text">Text Answer</Option>
              <Option value="audio">Audio Answer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'multiple-choice' && (
                <Form.Item
                  name="options"
                  label="Options"
                  rules={[{ required: true }]}
                >
                  <Select mode="tags" style={{ width: '100%' }} />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="correctAnswer"
            label="Correct Answer"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="media"
            label="Media"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Media</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingQuestion ? 'Update' : 'Add'} Question
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionManager;