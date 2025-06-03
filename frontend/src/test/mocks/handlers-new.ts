import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8000/api/v1'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }: any) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'admin' && password === 'password123') {
      return HttpResponse.json({
        access_token: 'mocked-jwt-token',
        token_type: 'bearer',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@test.com',
          is_admin: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      });
    }

    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: '1',
      username: 'admin',
      email: 'admin@test.com',
      is_admin: true,
      created_at: '2024-01-01T00:00:00Z'
    });
  }),

  // Posts endpoints
  http.get(`${API_BASE_URL}/posts/public`, ({ request }: any) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    if (search && !search.includes('React')) {
      return HttpResponse.json({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      });
    }

    return HttpResponse.json({
      items: [
        {
          id: '1',
          title: 'Sample Blog Post',
          content: 'This is a sample blog post content with detailed information about React development.',
          slug: 'sample-blog-post',
          is_published: true,
          views: 150,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category: { 
            id: '1', 
            name: 'Technology', 
            slug: 'technology' 
          },
          tag_details: [
            { id: '1', name: 'React', slug: 'react' },
            { id: '2', name: 'JavaScript', slug: 'javascript' }
          ],
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    });
  }),

  http.get(`${API_BASE_URL}/posts/public/:id`, ({ params }: any) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Sample Blog Post',
      content: 'This is a sample blog post content with detailed information.',
      slug: 'sample-blog-post',
      is_published: true,
      views: 150,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      category: { 
        id: '1', 
        name: 'Technology', 
        slug: 'technology' 
      },
      tag_details: [
        { id: '1', name: 'React', slug: 'react' },
        { id: '2', name: 'JavaScript', slug: 'javascript' }
      ],
    });
  }),

  http.get(`${API_BASE_URL}/posts`, () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          title: 'Admin Post 1',
          content: 'Admin content 1',
          slug: 'admin-post-1',
          is_published: true,
          views: 100,
          created_at: '2024-01-01T00:00:00Z',
          category_id: '1',
          tag_ids: ['1'],
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    });
  }),

  http.post(`${API_BASE_URL}/posts`, async ({ request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '2',
      ...body,
      slug: 'new-post',
      views: 0,
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${API_BASE_URL}/posts/:id`, async ({ params, request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.delete(`${API_BASE_URL}/posts/:id`, () => {
    return HttpResponse.json({});
  }),

  // Categories endpoints
  http.get(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related posts',
      },
      {
        id: '2',
        name: 'Travel',
        slug: 'travel',
        description: 'Travel related posts',
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/categories/:id`, ({ params }: any) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Technology',
      slug: 'technology',
      description: 'Technology related posts',
    });
  }),

  http.post(`${API_BASE_URL}/categories`, async ({ request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }),

  http.put(`${API_BASE_URL}/categories/:id`, async ({ params, request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }),

  http.delete(`${API_BASE_URL}/categories/:id`, () => {
    return HttpResponse.json({});
  }),

  // Tags endpoints
  http.get(`${API_BASE_URL}/tags`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'React',
        slug: 'react',
      },
      {
        id: '2',
        name: 'JavaScript',
        slug: 'javascript',
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/tags/:id`, ({ params }: any) => {
    return HttpResponse.json({
      id: params.id,
      name: 'React',
      slug: 'react',
    });
  }),

  http.post(`${API_BASE_URL}/tags`, async ({ request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }),

  http.put(`${API_BASE_URL}/tags/:id`, async ({ params, request }: any) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }),

  http.delete(`${API_BASE_URL}/tags/:id`, () => {
    return HttpResponse.json({});
  }),

  // Upload endpoints
  http.post(`${API_BASE_URL}/upload`, () => {
    return HttpResponse.json({
      filename: 'test-image.jpg',
      url: '/uploads/test-image.jpg',
    });
  }),
];
