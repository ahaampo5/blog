import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../../components/common/Header';

// Mock React Router
const MockRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Header Component', () => {
  it('should render logo with correct link', () => {
    render(
      <MockRouter>
        <Header />
      </MockRouter>
    );

    const logoLink = screen.getByRole('link', { name: /my blog/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should render navigation links', () => {
    render(
      <MockRouter>
        <Header />
      </MockRouter>
    );

    const homeLinks = screen.getAllByRole('link', { name: /홈/i });
    const categoryLinks = screen.getAllByRole('link', { name: /카테고리/i });
    const tagLinks = screen.getAllByRole('link', { name: /태그/i });
    
    expect(homeLinks).toHaveLength(2); // Desktop and mobile
    expect(categoryLinks).toHaveLength(2);
    expect(tagLinks).toHaveLength(2);
  });

  it('should have correct href attributes for navigation links', () => {
    render(
      <MockRouter>
        <Header />
      </MockRouter>
    );

    const homeLinks = screen.getAllByRole('link', { name: /홈/i });
    const categoryLinks = screen.getAllByRole('link', { name: /카테고리/i });
    const tagLinks = screen.getAllByRole('link', { name: /태그/i });
    
    homeLinks.forEach(link => expect(link).toHaveAttribute('href', '/'));
    categoryLinks.forEach(link => expect(link).toHaveAttribute('href', '/categories'));
    tagLinks.forEach(link => expect(link).toHaveAttribute('href', '/tags'));
  });

  it('should apply correct CSS classes', () => {
    render(
      <MockRouter>
        <Header />
      </MockRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');
  });
});
