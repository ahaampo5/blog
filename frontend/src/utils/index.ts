import { User } from '../types';

// Auth utilities
export const getStoredToken = (): string | null => {
  const token = localStorage.getItem('access_token');
  return token === undefined ? null : token;
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr === null || userStr === undefined) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch (e) {
    // Malformed JSON in localStorage, treat as not found
    return null;
  }
};

export const storeAuth = (token: string, user: User): void => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.is_admin ?? false;
};

// Date utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateExcerpt = (content: string, maxLength: number = 200): string => {
  // Remove markdown syntax and get plain text
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images (must come before links)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  return truncateText(plainText, maxLength);
};

// URL utilities
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// File utilities
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0 || lastDot === filename.length - 1) {
    return ''; // No extension, or dot is at the beginning/end
  }
  return filename.substring(lastDot + 1).toLowerCase();
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
  return videoExtensions.includes(getFileExtension(filename));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
