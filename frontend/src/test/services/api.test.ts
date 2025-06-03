import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, postsApi, categoriesApi, tagsApi } from '../../services/api';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock the create method to return a proper axios instance mock
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
};

mockedAxios.create = vi.fn(() => mockAxiosInstance as any);

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('authApi', () => {
    it('should login with correct credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            is_admin: true,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const credentials = { username: 'testuser', password: 'password123' };
      const result = await authApi.login(credentials);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout and clear localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));

      authApi.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should get current user', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        is_admin: true,
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authApi.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('postsApi', () => {
    it('should get public posts with pagination', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: '1',
              title: 'Test Post',
              content: 'Test content',
              slug: 'test-post',
              published: true,
              created_at: '2024-01-01T00:00:00Z',
              category: { id: '1', name: 'Test Category' },
              tags: [],
            },
          ],
          total: 1,
          page: 1,
          size: 10,
          pages: 1,
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await postsApi.getPublicPosts(1, 10);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/posts/public?page=1&size=10'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should get public posts with filters', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          size: 10,
          pages: 0,
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      await postsApi.getPublicPosts(1, 10, 'tech', ['javascript'], 'test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/posts/public?page=1&size=10&category=tech&tags=javascript&search=test'
      );
    });

    it('should get public post by id', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        category: { id: '1', name: 'Test Category' },
        tags: [],
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockPost });

      const result = await postsApi.getPublicPost('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/public/1');
      expect(result).toEqual(mockPost);
    });

    it('should create new post', async () => {
      const mockPost = {
        id: '1',
        title: 'New Post',
        content: 'New content',
        slug: 'new-post',
        published: false,
        category_id: '1',
        tag_ids: ['1'],
      };

      const createRequest = {
        title: 'New Post',
        content: 'New content',
        is_published: false,
        category_id: '1',
        tag_ids: ['1'],
        tags: ['1']
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockPost });

      const result = await postsApi.createPost(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/posts/', createRequest);
      expect(result).toEqual(mockPost);
    });

    it('should update existing post', async () => {
      const mockPost = {
        id: '1',
        title: 'Updated Post',
        content: 'Updated content',
        slug: 'updated-post',
        published: true,
        category_id: '1',
        tag_ids: ['1'],
      };

      const updateRequest = {
        id: '1',
        title: 'Updated Post',
        content: 'Updated content',
        is_published: true,
        category_id: '1',
        tag_ids: ['1'],
        tags: ['1']
      };

      mockAxiosInstance.put.mockResolvedValueOnce({ data: mockPost });

      const result = await postsApi.updatePost('1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/posts/1', updateRequest);
      expect(result).toEqual(mockPost);
    });

    it('should delete post', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await postsApi.deletePost('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/posts/1');
    });
  });

  describe('categoriesApi', () => {
    it('should get all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Tech posts' },
        { id: '2', name: 'Travel', slug: 'travel', description: 'Travel posts' },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockCategories });

      const result = await categoriesApi.getCategories();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/categories/');
      expect(result).toEqual(mockCategories);
    });

    it('should get category by id', async () => {
      const mockCategory = {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockCategory });

      const result = await categoriesApi.getCategory('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/categories/1');
      expect(result).toEqual(mockCategory);
    });

    it('should create new category', async () => {
      const mockCategory = {
        id: '1',
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
      };

      const createRequest = {
        name: 'New Category',
        description: 'A new category',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockCategory });

      const result = await categoriesApi.createCategory(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/categories/', createRequest);
      expect(result).toEqual(mockCategory);
    });

    it('should update category', async () => {
      const mockCategory = {
        id: '1',
        name: 'Updated Category',
        slug: 'updated-category',
        description: 'Updated description',
      };

      const updateRequest = {
        name: 'Updated Category',
        description: 'Updated description',
      };

      mockAxiosInstance.put.mockResolvedValueOnce({ data: mockCategory });

      const result = await categoriesApi.updateCategory('1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/categories/1', updateRequest);
      expect(result).toEqual(mockCategory);
    });

    it('should delete category', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await categoriesApi.deleteCategory('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/categories/1');
    });
  });

  describe('tagsApi', () => {
    it('should get all tags', async () => {
      const mockTags = [
        { id: '1', name: 'JavaScript', slug: 'javascript' },
        { id: '2', name: 'React', slug: 'react' },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockTags });

      const result = await tagsApi.getTags();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tags/');
      expect(result).toEqual(mockTags);
    });

    it('should get tag by id', async () => {
      const mockTag = {
        id: '1',
        name: 'JavaScript',
        slug: 'javascript',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockTag });

      const result = await tagsApi.getTag('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tags/1');
      expect(result).toEqual(mockTag);
    });

    it('should create new tag', async () => {
      const mockTag = {
        id: '1',
        name: 'New Tag',
        slug: 'new-tag',
      };

      const createRequest = {
        name: 'New Tag',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockTag });

      const result = await tagsApi.createTag(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tags/', createRequest);
      expect(result).toEqual(mockTag);
    });

    it('should update tag', async () => {
      const mockTag = {
        id: '1',
        name: 'Updated Tag',
        slug: 'updated-tag',
      };

      const updateRequest = {
        name: 'Updated Tag',
      };

      mockAxiosInstance.put.mockResolvedValueOnce({ data: mockTag });

      const result = await tagsApi.updateTag('1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/tags/1', updateRequest);
      expect(result).toEqual(mockTag);
    });

    it('should delete tag', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await tagsApi.deleteTag('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/tags/1');
    });
  });
});
