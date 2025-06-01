import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor} from '@testing-library/react'; // , fireEvent 
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../../../pages/public/Home';
import * as api from '../../../services/api';
import * as utils from '../../../utils';

// Mock dependencies
vi.mock('../../../services/api');
vi.mock('../../../utils');

const MockedApi = vi.mocked(api);
const MockedUtils = vi.mocked(utils);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const mockPosts = [
  {
    _id: '1',
    title: 'Test Post 1',
    content: 'This is test content for post 1',
    slug: 'test-post-1',
    published: true,
    created_at: '2024-01-01T00:00:00Z',
    category_id: '1',
    category: { _id: '1', name: 'Technology', slug: 'technology' },
    tag_details: [
      { _id: '1', name: 'React', slug: 'react' },
      { _id: '2', name: 'TypeScript', slug: 'typescript' },
    ],
    views: 0,
  },
  {
    _id: '2',
    title: 'Test Post 2',
    content: 'This is test content for post 2',
    slug: 'test-post-2',
    published: true,
    created_at: '2024-01-02T00:00:00Z',
    category_id: '2',
    category: { _id: '2', name: 'Travel', slug: 'travel' },
    tag_details: [
      { _id: '3', name: 'Adventure', slug: 'adventure' },
    ],
    views: 0,
  },
];

const mockApiResponse = {
  items: mockPosts,
  total: 2,
  page: 1,
  size: 10,
  pages: 1,
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockedUtils.formatDate.mockImplementation((date) => new Date(date).toLocaleDateString());
    MockedUtils.generateExcerpt.mockImplementation((content) => content.substring(0, 100) + '...');
  });

  it('should render loading state initially', () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockImplementation(() => new Promise(() => {})),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should render posts when data is loaded', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockRejectedValue(new Error('API Error')),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('포스트를 불러오는 중 문제가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('should render search form', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /검색/i })).toBeInTheDocument();
    });
  });

  it('should call API with search parameters when searching', async () => {
    const user = userEvent.setup();
    const mockGetPublicPosts = vi.fn().mockResolvedValue(mockApiResponse);
    MockedApi.postsApi = {
      getPublicPosts: mockGetPublicPosts,
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const searchButton = screen.getByText('검색');

    // Type search term
    await user.type(searchInput, 'test search');
    
    // Submit the form
    await user.click(searchButton);
    
    // Verify the API call includes the complete search term
    await waitFor(() => {
      expect(mockGetPublicPosts).toHaveBeenCalledWith(1, 10, '', [], 'test search');
    });
  });

  it('should display post information correctly', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      // Check post titles
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();

      // Check categories
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();

      // Check tags
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });
  });

  it('should display correct post links', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      const post1Link = screen.getByRole('link', { name: /test post 1/i });
      const post2Link = screen.getByRole('link', { name: /test post 2/i });

      expect(post1Link).toHaveAttribute('href', '/post/1');
      expect(post2Link).toHaveAttribute('href', '/post/2');
    });
  });

  it('should display category and tag links', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      const categoryLink = screen.getByRole('link', { name: /technology/i });
      const tagLink = screen.getByRole('link', { name: /react/i });

      expect(categoryLink).toHaveAttribute('href', '/category/1');
      expect(tagLink).toHaveAttribute('href', '/tag/1');
    });
  });

  it('should call formatDate and generateExcerpt utilities', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue(mockApiResponse),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(MockedUtils.formatDate).toHaveBeenCalledWith('2024-01-01T00:00:00Z');
      expect(MockedUtils.formatDate).toHaveBeenCalledWith('2024-01-02T00:00:00Z');
      expect(MockedUtils.generateExcerpt).toHaveBeenCalledWith('This is test content for post 1');
      expect(MockedUtils.generateExcerpt).toHaveBeenCalledWith('This is test content for post 2');
    });
  });

  it('should display empty state when no posts are available', async () => {
    MockedApi.postsApi = {
      getPublicPosts: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      }),
    } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <Home />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('포스트가 없습니다')).toBeInTheDocument();
    });
  });
});
