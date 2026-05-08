import apiClient from './client';
import type { Post } from '../types';

export const getNewsFeed = async (): Promise<{ newsFeed: Post[] }> => {
  const { data } = await apiClient.get('/api/posts');
  return data;
};

export const getEventPosts = async (eventId: number | string): Promise<Post[]> => {
  const { data } = await apiClient.get(`/api/events/${eventId}/posts`);
  return data;
};

export const createPost = async (postData: { event_id: number; content: string; image_url?: string }): Promise<void> => {
  await apiClient.post('/api/posts', postData);
};

export const updatePost = async (postId: number | string, new_content: string): Promise<void> => {
  await apiClient.put(`/api/posts/${postId}`, { new_content });
};

export const likePost = async (postId: number | string): Promise<void> => {
  await apiClient.post(`/api/posts/${postId}/like`);
};

export const unlikePost = async (postId: number | string): Promise<void> => {
  await apiClient.delete(`/api/posts/${postId}/like`);
};

export const addComment = async (postId: number | string, comment: string): Promise<void> => {
  await apiClient.post(`/api/posts/${postId}/comments`, { comment });
};

export const getComments = async (postId: number | string): Promise<{ comments: any[] }> => {
  const { data } = await apiClient.get(`/api/posts/${postId}/comments`);
  return data;
};
