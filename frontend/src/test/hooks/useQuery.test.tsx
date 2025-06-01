import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as api from '../../services/api';

// Mock API
vi.mock('../../services/api');
const MockedApi = vi.mocked(api);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Posts Queries', () => {
    it('should fetch public posts successfully', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            title: 'Test Post',
            content: 'Test content',
            slug: 'test-post',
            published: true,
            created_at: '2024-01-01T00:00:00Z',
            category: { id: '1', name: 'Tech', slug: 'tech' },
            tags: [],
          },
        ],
        total: 1,
        page: 1,
        size: 10,
        pages: 1,
      };

      MockedApi.postsApi = {
        getPublicPosts: vi.fn().mockResolvedValue(mockPosts),
      } as any;

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['publicPosts', 1, '', '', ''],
            queryFn: () => MockedApi.postsApi.getPublicPosts(1, 10, '', [], ''),
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPosts);
      expect(MockedApi.postsApi.getPublicPosts).toHaveBeenCalledWith(1, 10, '', [], '');
    });

    it('should handle posts query error', async () => {
      MockedApi.postsApi = {
        getPublicPosts: vi.fn().mockRejectedValue(new Error('Network error')),
      } as any;

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['publicPosts', 1, '', '', ''],
            queryFn: () => MockedApi.postsApi.getPublicPosts(1, 10, '', [], ''),
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should cache posts query results', async () => {
      const mockPosts = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      };

      MockedApi.postsApi = {
        getPublicPosts: vi.fn().mockResolvedValue(mockPosts),
      } as any;

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result: result1 } = renderHook(
        () =>
          useQuery({
            queryKey: ['publicPosts', 1, '', '', ''],
            queryFn: () => MockedApi.postsApi.getPublicPosts(1, 10, '', [], ''),
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Wait for the cache to populate
      await waitFor(() => {
        expect(result1.current.data).toEqual(mockPosts);
      });

      const { result: result2 } = renderHook(
        () =>
          useQuery({
            queryKey: ['publicPosts', 1, '', '', ''],
            queryFn: () => MockedApi.postsApi.getPublicPosts(1, 10, '', [], ''),
          }),
        { wrapper }
      );

      // Should use cached data
      await waitFor(() => {
        expect(result2.current.data).toEqual(mockPosts);
      });
      
      // The function should be called only once due to caching
      expect(MockedApi.postsApi.getPublicPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth Mutations', () => {
    it('should handle login mutation successfully', async () => {
      const mockAuthResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          is_admin: true,
        },
      };

      MockedApi.authApi = {
        login: vi.fn().mockResolvedValue(mockAuthResponse),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.authApi.login,
          }),
        { wrapper: createWrapper() }
      );

      const credentials = { username: 'testuser', password: 'password' };
      result.current.mutate(credentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAuthResponse);
      expect(MockedApi.authApi.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle login mutation error', async () => {
      MockedApi.authApi = {
        login: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.authApi.login,
          }),
        { wrapper: createWrapper() }
      );

      const credentials = { username: 'wrong', password: 'wrong' };
      result.current.mutate(credentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('Posts Mutations', () => {
    it('should create post successfully', async () => {
      const mockPost = {
        id: '1',
        title: 'New Post',
        content: 'New content',
        slug: 'new-post',
        published: false,
        category_id: '1',
        tag_ids: [],
      };

      MockedApi.postsApi = {
        createPost: vi.fn().mockResolvedValue(mockPost),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.postsApi.createPost,
          }),
        { wrapper: createWrapper() }
      );

      const postData = {
        title: 'New Post',
        content: 'New content',
        is_published: false,
        category_id: '1',
        tags: [],
      };

      result.current.mutate(postData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPost);
      expect(MockedApi.postsApi.createPost).toHaveBeenCalledWith(postData);
    });

    it('should update post successfully', async () => {
      const mockPost = {
        id: '1',
        title: 'Updated Post',
        content: 'Updated content',
        slug: 'updated-post',
        published: true,
        category_id: '1',
        tag_ids: [],
      };

      MockedApi.postsApi = {
        updatePost: vi.fn().mockResolvedValue(mockPost),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: ({ id, data }: { id: string; data: any }) =>
              MockedApi.postsApi.updatePost(id, data),
          }),
        { wrapper: createWrapper() }
      );

      const updateData = {
        id: '1',
        data: {
          title: 'Updated Post',
          content: 'Updated content',
          published: true,
          category_id: '1',
          tag_ids: [],
        },
      };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPost);
      expect(MockedApi.postsApi.updatePost).toHaveBeenCalledWith('1', updateData.data);
    });

    it('should delete post successfully', async () => {
      MockedApi.postsApi = {
        deletePost: vi.fn().mockResolvedValue(undefined),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.postsApi.deletePost,
          }),
        { wrapper: createWrapper() }
      );

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(MockedApi.postsApi.deletePost).toHaveBeenCalledWith('1');
    });
  });

  describe('Categories Queries and Mutations', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Tech posts' },
        { id: '2', name: 'Travel', slug: 'travel', description: 'Travel posts' },
      ];

      MockedApi.categoriesApi = {
        getCategories: vi.fn().mockResolvedValue(mockCategories),
      } as any;

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['categories'],
            queryFn: MockedApi.categoriesApi.getCategories,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCategories);
    });

    it('should create category successfully', async () => {
      const mockCategory = {
        id: '3',
        name: 'New Category',
        slug: 'new-category',
        description: 'New description',
      };

      MockedApi.categoriesApi = {
        createCategory: vi.fn().mockResolvedValue(mockCategory),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.categoriesApi.createCategory,
          }),
        { wrapper: createWrapper() }
      );

      const categoryData = {
        name: 'New Category',
        description: 'New description',
      };

      result.current.mutate(categoryData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCategory);
    });
  });

  describe('Tags Queries and Mutations', () => {
    it('should fetch tags successfully', async () => {
      const mockTags = [
        { id: '1', name: 'React', slug: 'react' },
        { id: '2', name: 'JavaScript', slug: 'javascript' },
      ];

      MockedApi.tagsApi = {
        getTags: vi.fn().mockResolvedValue(mockTags),
      } as any;

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['tags'],
            queryFn: MockedApi.tagsApi.getTags,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTags);
    });

    it('should create tag successfully', async () => {
      const mockTag = {
        id: '3',
        name: 'New Tag',
        slug: 'new-tag',
      };

      MockedApi.tagsApi = {
        createTag: vi.fn().mockResolvedValue(mockTag),
      } as any;

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: MockedApi.tagsApi.createTag,
          }),
        { wrapper: createWrapper() }
      );

      const tagData = { name: 'New Tag' };
      result.current.mutate(tagData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTag);
    });
  });
});
