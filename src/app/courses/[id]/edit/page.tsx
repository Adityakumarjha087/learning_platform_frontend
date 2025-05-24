"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-platform-backend-sa8z.onrender.com';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get<{ data: { title: string; description: string; thumbnail: string } }>(
          `${API_URL}/api/courses/${id}`
        );
        setFormData({
          title: res.data.data.title,
          description: res.data.data.description,
          thumbnail: res.data.data.thumbnail,
        });
      } catch {
        setError('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put(
        `${API_URL}/api/courses/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Title"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Description"
        required
      />
      <input
        name="thumbnail"
        value={formData.thumbnail}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Thumbnail URL"
        required
      />
      <button type="submit" className="btn btn-primary w-full">Update Course</button>
    </form>
  );
}