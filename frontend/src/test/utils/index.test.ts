import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getStoredToken,
  getStoredUser,
  storeAuth,
  clearAuth,
  isAuthenticated,
  isAdmin,
  formatDate,
  formatDateTime,
  truncateText,
  generateExcerpt,
  generateSlug,
  getFileExtension,
  isImageFile,
  isVideoFile,
  formatFileSize,
  getErrorMessage,
  validateEmail,
  validatePassword,
  highlightSearchTerm,
} from '../../utils';
import { User } from '../../types';

describe('Utility Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Auth Utilities', () => {
    describe('getStoredToken', () => {
      it('should return token when it exists', () => {
        localStorage.setItem('access_token', 'test-token');
        expect(getStoredToken()).toBe('test-token');
      });

      it('should return null when token does not exist', () => {
        expect(getStoredToken()).toBeNull();
      });
    });

    describe('getStoredUser', () => {
      it('should return user object when it exists', () => {
        const user = { id: '1', username: 'testuser', email: 'test@example.com', is_admin: false };
        localStorage.setItem('user', JSON.stringify(user));
        
        expect(getStoredUser()).toEqual(user);
      });

      it('should return null when user does not exist', () => {
        expect(getStoredUser()).toBeNull();
      });

      it('should handle invalid JSON in localStorage', () => {
        localStorage.setItem('user', 'invalid-json');
        expect(getStoredUser()).toBeNull();
      });
    });

    describe('storeAuth', () => {
      it('should store token and user in localStorage', () => {
        const token = 'test-token';
        // const user = { id: '1', username: 'testuser', email: 'test@example.com', is_admin: false };
        const user: User = {
          _id: '1',
          username: 'testuser',
          email: 'test@example.com',
          is_admin: false,
          created_at: new Date().toISOString()
        }
        
        storeAuth(token, user);
        
        expect(localStorage.getItem('access_token')).toBe(token);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
      });
    });

    describe('clearAuth', () => {
      it('should remove token and user from localStorage', () => {
        localStorage.setItem('access_token', 'test-token');
        localStorage.setItem('user', 'test-user');
        
        clearAuth();
        
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    describe('isAuthenticated', () => {
      it('should return true when token exists', () => {
        localStorage.setItem('access_token', 'test-token');
        expect(isAuthenticated()).toBe(true);
      });

      it('should return false when token does not exist', () => {
        expect(isAuthenticated()).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should return true when user is admin', () => {
        const user = { id: '1', username: 'admin', email: 'admin@example.com', is_admin: true };
        localStorage.setItem('user', JSON.stringify(user));
        
        expect(isAdmin()).toBe(true);
      });

      it('should return false when user is not admin', () => {
        const user = { id: '1', username: 'user', email: 'user@example.com', is_admin: false };
        localStorage.setItem('user', JSON.stringify(user));
        
        expect(isAdmin()).toBe(false);
      });

      it('should return false when user does not exist', () => {
        expect(isAdmin()).toBe(false);
      });
    });
  });

  describe('Date Utilities', () => {
    describe('formatDate', () => {
      it('should format date string correctly', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const formatted = formatDate(dateString);
        
        // Check that it contains year, month, and day
        expect(formatted).toMatch(/2024/);
        expect(formatted).toMatch(/1월/);
        expect(formatted).toMatch(/15/);
      });
    });

    describe('formatDateTime', () => {
      it('should format datetime string correctly', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const formatted = formatDateTime(dateString);
        
        // Check that it contains date and time information
        expect(formatted).toMatch(/2024/);
        expect(formatted).toMatch(/1월/);
        expect(formatted).toMatch(/15/);
        expect(formatted).toMatch(/:/);
      });
    });
  });

  describe('Text Utilities', () => {
    describe('truncateText', () => {
      it('should truncate text longer than maxLength', () => {
        const text = 'This is a very long text that should be truncated';
        const result = truncateText(text, 20);
        
        expect(result).toBe('This is a very long ...');
        expect(result.length).toBe(23); // 20 + '...'
      });

      it('should not truncate text shorter than maxLength', () => {
        const text = 'Short text';
        const result = truncateText(text, 20);
        
        expect(result).toBe(text);
      });

      it('should handle empty string', () => {
        const result = truncateText('', 10);
        expect(result).toBe('');
      });
    });

    describe('generateExcerpt', () => {
      it('should remove markdown syntax and generate excerpt', () => {
        const content = '# Title\\n\\n**Bold text** and *italic text*\\n\\nRegular content with `code`';
        const result = generateExcerpt(content, 50);
        
        expect(result).not.toContain('#');
        expect(result).not.toContain('**');
        expect(result).not.toContain('*');
        expect(result).not.toContain('`');
        expect(result).toContain('Title');
        expect(result).toContain('Bold text');
      });

      it('should truncate to specified length', () => {
        const longContent = 'This is a very long content that should be truncated to a specific length for excerpt generation';
        const result = generateExcerpt(longContent, 30);
        
        expect(result.length).toBeLessThanOrEqual(33); // 30 + '...'
        expect(result).toContain('...');
      });

      it('should handle content with links and images', () => {
        const content = '[Link text](http://example.com) and ![Alt text](image.jpg)';
        const result = generateExcerpt(content, 100);
        
        expect(result).toContain('Link text');
        expect(result).not.toContain('[');
        expect(result).not.toContain(']');
        expect(result).not.toContain('(');
        expect(result).not.toContain(')');
        expect(result).not.toContain('!');
      });
    });
  });

  describe('URL Utilities', () => {
    describe('generateSlug', () => {
      it('should generate URL-friendly slug', () => {
        const title = 'Hello World! This is a Test';
        const result = generateSlug(title);
        
        expect(result).toBe('hello-world-this-is-a-test');
      });

      it('should handle Korean characters', () => {
        const title = '안녕하세요 테스트입니다';
        const result = generateSlug(title);
        
        expect(result).toBe('안녕하세요-테스트입니다');
      });

      it('should handle special characters', () => {
        const title = 'Test@#$%^&*()Title';
        const result = generateSlug(title);
        
        expect(result).toBe('test-title');
      });

      it('should handle multiple consecutive spaces/dashes', () => {
        const title = 'Test    Multiple   Spaces';
        const result = generateSlug(title);
        
        expect(result).toBe('test-multiple-spaces');
      });
    });
  });

  describe('File Utilities', () => {
    describe('getFileExtension', () => {
      it('should extract file extension correctly', () => {
        expect(getFileExtension('image.jpg')).toBe('jpg');
        expect(getFileExtension('document.pdf')).toBe('pdf');
        expect(getFileExtension('file.name.with.dots.txt')).toBe('txt');
      });

      it('should handle files without extension', () => {
        expect(getFileExtension('filename')).toBe('');
      });

      it('should handle empty filename', () => {
        expect(getFileExtension('')).toBe('');
      });
    });

    describe('isImageFile', () => {
      it('should identify image files correctly', () => {
        expect(isImageFile('photo.jpg')).toBe(true);
        expect(isImageFile('image.png')).toBe(true);
        expect(isImageFile('icon.svg')).toBe(true);
        expect(isImageFile('document.pdf')).toBe(false);
        expect(isImageFile('video.mp4')).toBe(false);
      });

      it('should be case insensitive', () => {
        expect(isImageFile('photo.JPG')).toBe(true);
        expect(isImageFile('image.PNG')).toBe(true);
      });
    });

    describe('isVideoFile', () => {
      it('should identify video files correctly', () => {
        expect(isVideoFile('movie.mp4')).toBe(true);
        expect(isVideoFile('clip.webm')).toBe(true);
        expect(isVideoFile('video.avi')).toBe(true);
        expect(isVideoFile('photo.jpg')).toBe(false);
        expect(isVideoFile('document.pdf')).toBe(false);
      });
    });

    describe('formatFileSize', () => {
      it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1048576)).toBe('1 MB');
        expect(formatFileSize(1073741824)).toBe('1 GB');
      });

      it('should handle decimal places', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(2621440)).toBe('2.5 MB');
      });
    });
  });

  describe('Error Handling Utilities', () => {
    describe('getErrorMessage', () => {
      it('should extract error message from API response detail', () => {
        const error = {
          response: {
            data: {
              detail: 'Validation error'
            }
          }
        };
        
        expect(getErrorMessage(error)).toBe('Validation error');
      });

      it('should extract error message from API response message', () => {
        const error = {
          response: {
            data: {
              message: 'Server error'
            }
          }
        };
        
        expect(getErrorMessage(error)).toBe('Server error');
      });

      it('should extract error message from error.message', () => {
        const error = {
          message: 'Network error'
        };
        
        expect(getErrorMessage(error)).toBe('Network error');
      });

      it('should return default message for unknown errors', () => {
        const error = {};
        expect(getErrorMessage(error)).toBe('알 수 없는 오류가 발생했습니다.');
      });
    });
  });

  describe('Validation Utilities', () => {
    describe('validateEmail', () => {
      it('should validate correct email addresses', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.kr')).toBe(true);
        expect(validateEmail('test+tag@gmail.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('test.domain.com')).toBe(false);
      });
    });

    describe('validatePassword', () => {
      it('should validate passwords with 8 or more characters', () => {
        expect(validatePassword('password123')).toBe(true);
        expect(validatePassword('12345678')).toBe(true);
      });

      it('should reject passwords with less than 8 characters', () => {
        expect(validatePassword('pass')).toBe(false);
        expect(validatePassword('1234567')).toBe(false);
        expect(validatePassword('')).toBe(false);
      });
    });
  });

  describe('Search Utilities', () => {
    describe('highlightSearchTerm', () => {
      it('should highlight search term in text', () => {
        const text = 'This is a test text';
        const result = highlightSearchTerm(text, 'test');
        
        expect(result).toBe('This is a <mark>test</mark> text');
      });

      it('should be case insensitive', () => {
        const text = 'This is a Test text';
        const result = highlightSearchTerm(text, 'test');
        
        expect(result).toBe('This is a <mark>Test</mark> text');
      });

      it('should highlight multiple occurrences', () => {
        const text = 'Test this test text';
        const result = highlightSearchTerm(text, 'test');
        
        expect(result).toBe('<mark>Test</mark> this <mark>test</mark> text');
      });

      it('should return original text when search term is empty', () => {
        const text = 'This is a test text';
        const result = highlightSearchTerm(text, '');
        
        expect(result).toBe(text);
      });
    });
  });
});
