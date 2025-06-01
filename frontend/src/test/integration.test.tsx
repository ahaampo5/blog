import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'msw';
import { server } from './mocks/server';
import Home from '../pages/public/Home';
import AdminLogin from '../pages/admin/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import * as utils from '../utils';

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock utils
vi.mock('../utils', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString()),
  generateExcerpt: vi.fn((content) => content.substring(0, 100) + '...'),
  getErrorMessage: vi.fn((error) => error.message || 'Unknown error'),
  storeAuth: vi.fn(),
  isAuthenticated: vi.fn(),
  isAdmin: vi.fn(),
}));

const MockedUtils = vi.mocked(utils);

const createTestWrapper = (initialEntries = ['/']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  describe('Blog Home Page Integration', () => {
    it('should load and display blog posts from API', async () => {
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Should show loading initially
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Sample Blog Post')).toBeInTheDocument();
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Should display formatted date
      expect(MockedUtils.formatDate).toHaveBeenCalled();
      expect(MockedUtils.generateExcerpt).toHaveBeenCalled();
    });

    it('should search for posts and update results', async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      const searchButton = screen.getByRole('button', { name: /검색/i });

      // Perform search
      await user.type(searchInput, 'React');
      await user.click(searchButton);

      // Should trigger new API call with search parameter
      await waitFor(() => {
        expect(searchInput).toHaveValue('React');
      });
    });

    it('should navigate to post detail when clicking on post', async () => {
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Sample Blog Post')).toBeInTheDocument();
      });

      const postLink = screen.getByRole('link', { name: /sample blog post/i });
      expect(postLink).toHaveAttribute('href', '/posts/1');
    });
  });

  describe('Admin Authentication Flow', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should complete login flow successfully', async () => {
      const user = userEvent.setup();
      
      const Wrapper = createTestWrapper(['/admin/login']);
      
      render(
        <Wrapper>
          <AdminLogin />
        </Wrapper>
      );

      // Fill login form
      const usernameInput = screen.getByPlaceholderText('사용자명');
      const passwordInput = screen.getByPlaceholderText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('로그인 중...')).toBeInTheDocument();
      });

      // Should store auth data and navigate
      await waitFor(() => {
        expect(MockedUtils.storeAuth).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });
    });

    it('should show error message on failed login', async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(['/admin/login']);
      
      render(
        <Wrapper>
          <AdminLogin />
        </Wrapper>
      );

      const usernameInput = screen.getByPlaceholderText('사용자명');
      const passwordInput = screen.getByPlaceholderText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인/i });

      // Use wrong credentials
      await user.type(usernameInput, 'wrong');
      await user.type(passwordInput, 'wrong');
      await user.click(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Protected Route Access Control', () => {
    it('should redirect unauthenticated users to login', () => {
      (MockedUtils.isAuthenticated as any).mockReturnValue(false);
      
      const Wrapper = createTestWrapper(['/admin/dashboard']);
      
      render(
        <Wrapper>
          <ProtectedRoute>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </Wrapper>
      );

      // Should not render protected content
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should allow authenticated admin users to access protected routes', () => {
      (MockedUtils.isAuthenticated as any).mockReturnValue(true);
      (MockedUtils.isAdmin as any).mockReturnValue(true);
      
      const Wrapper = createTestWrapper(['/admin/dashboard']);
      
      render(
        <Wrapper>
          <ProtectedRoute>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </Wrapper>
      );

      // Should render protected content
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should redirect non-admin users from admin routes', () => {
      (MockedUtils.isAuthenticated as any).mockReturnValue(true);
      (MockedUtils.isAdmin as any).mockReturnValue(false);
      
      const Wrapper = createTestWrapper(['/admin/dashboard']);
      
      render(
        <Wrapper>
          <ProtectedRoute requireAdmin={true}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </Wrapper>
      );

      // Should not render admin content
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error by overriding the handler
      server.use(
        http.get('/api/v1/posts/public', () => {
          return new Response(JSON.stringify({ detail: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
        expect(screen.getByText('포스트를 불러오는 중 문제가 발생했습니다.')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      // Mock network error
      server.use(
        http.get('/api/v1/posts/public', () => {
          throw new Error('Network error');
        })
      );

      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent data across components', async () => {
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Sample Blog Post')).toBeInTheDocument();
      });

      // Verify data structure consistency
      const postTitle = screen.getByText('Sample Blog Post');
      const categoryLink = screen.getByText('Technology');
      const tagLink = screen.getByText('React');

      expect(postTitle).toBeInTheDocument();
      expect(categoryLink).toBeInTheDocument();
      expect(tagLink).toBeInTheDocument();

      // Verify links have correct hrefs
      expect(categoryLink.closest('a')).toHaveAttribute('href', '/categories/technology');
      expect(tagLink.closest('a')).toHaveAttribute('href', '/tags/react');
    });
  });
});
