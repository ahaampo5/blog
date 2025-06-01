import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import * as utils from '../../../utils';

// Mock utils
vi.mock('../../../utils', () => ({
  isAuthenticated: vi.fn(),
  isAdmin: vi.fn(),
}));

const MockedUtils = vi.mocked(utils);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated and admin', () => {
    MockedUtils.isAuthenticated.mockReturnValue(true);
    MockedUtils.isAdmin.mockReturnValue(true);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    MockedUtils.isAuthenticated.mockReturnValue(false);
    MockedUtils.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to home when user is authenticated but not admin', () => {
    MockedUtils.isAuthenticated.mockReturnValue(true);
    MockedUtils.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render children when requireAdmin is false and user is authenticated', () => {
    MockedUtils.isAuthenticated.mockReturnValue(true);
    MockedUtils.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={false}>
          <div>User Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('User Content')).toBeInTheDocument();
  });

  it('should call isAuthenticated utility function', () => {
    MockedUtils.isAuthenticated.mockReturnValue(true);
    MockedUtils.isAdmin.mockReturnValue(true);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(MockedUtils.isAuthenticated).toHaveBeenCalledOnce();
  });

  it('should call isAdmin utility function when requireAdmin is true', () => {
    MockedUtils.isAuthenticated.mockReturnValue(true);
    MockedUtils.isAdmin.mockReturnValue(true);

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(MockedUtils.isAdmin).toHaveBeenCalledOnce();
  });
});
