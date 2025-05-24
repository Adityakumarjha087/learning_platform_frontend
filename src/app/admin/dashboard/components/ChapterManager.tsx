import React, { useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Chapter {
  _id: string;
  title: string;
  content: string;
}

interface ChapterManagerProps {
  unitId: string;
  chapters: Chapter[];
  onAddChapter: (chapter: Omit<Chapter, '_id'>) => Promise<void>;
  onEditChapter: (chapterId: string, chapter: Partial<Chapter>) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
}

const ChapterManager: React.FC<ChapterManagerProps> = ({
  unitId,
  chapters,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [form] = Form.useForm();

  const handleAddChapter = async (values: any) => {
    await onAddChapter(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditChapter = async (values: any) => {
    if (editingChapter) {
      await onEditChapter(editingChapter._id, values);
      setEditingChapter(null);
      setIsModalVisible(false);
      form.resetFields();
    }
  };

  const showModal = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      form.setFieldsValue(chapter);
    } else {
      setEditingChapter(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Chapter
        </Button>
      </Space>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {chapters.map((chapter) => (
          <Card
            key={chapter._id}
            title={chapter.title}
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => showModal(chapter)}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteChapter(chapter._id)}
                />
              </Space>
            }
          >
            <p>{chapter.content}</p>
          </Card>
        ))}
      </div>

      <Modal
        title={editingChapter ? 'Edit Chapter' : 'Add Chapter'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingChapter(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingChapter ? handleEditChapter : handleAddChapter}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter chapter title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter chapter content' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingChapter ? 'Update' : 'Add'} Chapter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChapterManager; 