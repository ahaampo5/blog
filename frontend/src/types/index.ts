// Types for our blog system
export interface User {
  _id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  _id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  category_id?: string;
  tags: string[];
  featured_image?: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithDetails extends Post {
  category?: Category;
  tag_details?: Tag[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  summary?: string;
  category_id?: string;
  tags: string[];
  featured_image?: string;
  is_published: boolean;
}

export interface UpdatePostRequest extends CreatePostRequest {
  _id: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
