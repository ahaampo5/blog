import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLogin from '../../../pages/admin/Login';
import * as api from '../../../services/api';
import * as utils from '../../../utils';

// Mock dependencies
vi.mock('../../../services/api');
vi.mock('../../../utils');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

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

describe('AdminLogin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockedUtils.getErrorMessage.mockReturnValue('Invalid credentials');
  });

  it('should render login form elements', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('사용자명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should update input values when typing', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    const usernameInput = screen.getByPlaceholderText('사용자명');
    const passwordInput = screen.getByPlaceholderText('비밀번호');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should call login API when form is submitted', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      access_token: 'test-token',
      user: { id: '1', username: 'testuser' },
    });
    MockedApi.authApi = { login: mockLogin } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    const usernameInput = screen.getByPlaceholderText('사용자명');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    MockedApi.authApi = { login: mockLogin } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    const usernameInput = screen.getByPlaceholderText('사용자명');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should store auth data on successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      access_token: 'test-token',
      user: { id: '1', username: 'testuser' },
    });
    MockedApi.authApi = { login: mockLogin } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    const usernameInput = screen.getByPlaceholderText('사용자명');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(MockedUtils.storeAuth).toHaveBeenCalledWith(
        'test-token',
        { id: '1', username: 'testuser' }
      );
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    MockedApi.authApi = { login: mockLogin } as any;

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminLogin />
      </Wrapper>
    );

    const usernameInput = screen.getByPlaceholderText('사용자명');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('로그인 중...')).toBeInTheDocument();
  });
});
