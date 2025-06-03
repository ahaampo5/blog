import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          is_active: true
        }
      });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),

  http.get(`${API_BASE_URL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader?.includes('mock-jwt-token')) {
      return HttpResponse.json({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        is_active: true
      });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),

  // Posts endpoints
  http.get(`${API_BASE_URL}/api/posts`, () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          title: 'Sample Blog Post',
          content: 'Test content',
          slug: 'sample-blog-post',
          category_id: '1',
          category: { id: '1', name: 'Technology', slug: 'technology' },
          tag_details: [{ id: '1', name: 'React', slug: 'react' }],
          published: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          author_id: '1',
          views: 0
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      pages: 1
    });
  }),

  http.get(`${API_BASE_URL}/api/posts/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        category_id: '1',
        category: { id: '1', name: 'Technology', slug: 'technology' },
        tag_details: [{ id: '1', name: 'React', slug: 'react' }],
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author_id: '1',
        views: 0
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/api/posts`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({
      id: '2',
      title: 'New Post',
      content: 'New content',
      slug: 'new-post',
      category_id: '1',
      category: { id: '1', name: 'Technology', slug: 'technology' },
      tags: [],
      is_published: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      author_id: '1'
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/api/posts/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        title: 'Updated Post',
        content: 'Updated content',
        slug: 'updated-post',
        category_id: '1',
        category: { id: '1', name: 'Technology', slug: 'technology' },
        tags: [],
        is_published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author_id: '1'
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_BASE_URL}/api/posts/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return new HttpResponse(null, { status: 204 });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  // Categories endpoints
  http.get(`${API_BASE_URL}/api/categories`, () => {
    return HttpResponse.json([
      { id: '1', name: 'Technology', slug: 'technology', description: 'Tech posts' },
      { id: '2', name: 'Lifestyle', slug: 'lifestyle', description: 'Life posts' }
    ]);
  }),

  http.get(`${API_BASE_URL}/api/categories/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts'
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/api/categories`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({
      id: '3',
      name: 'New Category',
      slug: 'new-category',
      description: 'New category description'
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/api/categories/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'Updated Category',
        slug: 'updated-category',
        description: 'Updated description'
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_BASE_URL}/api/categories/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return new HttpResponse(null, { status: 204 });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  // Tags endpoints
  http.get(`${API_BASE_URL}/api/tags`, () => {
    return HttpResponse.json([
      { id: '1', name: 'React', slug: 'react' },
      { id: '2', name: 'TypeScript', slug: 'typescript' }
    ]);
  }),

  http.get(`${API_BASE_URL}/api/tags/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'React',
        slug: 'react'
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/api/tags`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({
      id: '3',
      name: 'New Tag',
      slug: 'new-tag'
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/api/tags/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'Updated Tag',
        slug: 'updated-tag'
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_BASE_URL}/api/tags/:id`, ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (id === '1') {
      return new HttpResponse(null, { status: 204 });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),
];