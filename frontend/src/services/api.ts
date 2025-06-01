// import axios, { AxiosResponse } from 'axios';
import axios from 'axios';
import {
  User,
  Post,
  Category,
  Tag,
  LoginCredentials,
  AuthResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCategoryRequest,
  CreateTagRequest,
  PaginatedResponse,
  PostWithDetails
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    
    // 백엔드 응답에 user 정보가 없으므로 기본 사용자 정보를 생성
    const authResponse: AuthResponse = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: {
        _id: '1',
        username: credentials.username,
        email: `${credentials.username}@admin.com`,
        is_admin: true,
        created_at: new Date().toISOString(),
      }
    };
    
    return authResponse;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Posts API
export const postsApi = {
  // Public endpoints
  getPublicPosts: async (
    page: number = 1,
    size: number = 10,
    category?: string,
    tags?: string[],
    search?: string
  ): Promise<PaginatedResponse<PostWithDetails>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (category) params.append('category', category);
    if (tags && tags.length > 0) {
      tags.forEach(tag => params.append('tags', tag));
    }
    if (search) params.append('search', search);

    const response = await api.get(`/posts/public?${params}`);
    return response.data;
  },

  getPublicPost: async (id: string): Promise<PostWithDetails> => {
    const response = await api.get(`/posts/public/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllPosts: async (
    page: number = 1,
    size: number = 10
  ): Promise<PaginatedResponse<PostWithDetails>> => {
    const response = await api.get(`/posts?page=${page}&size=${size}`);
    return response.data;
  },

  getPost: async (id: string): Promise<PostWithDetails> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (post: CreatePostRequest): Promise<Post> => {
    const response = await api.post('/posts', post);
    return response.data;
  },

  updatePost: async (id: string, post: UpdatePostRequest): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, post);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};

// Categories API
export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (category: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  updateCategory: async (id: string, category: CreateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Tags API
export const tagsApi = {
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },

  getTag: async (id: string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  createTag: async (tag: CreateTagRequest): Promise<Tag> => {
    const response = await api.post('/tags', tag);
    return response.data;
  },

  updateTag: async (id: string, tag: CreateTagRequest): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, tag);
    return response.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File): Promise<{ filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
