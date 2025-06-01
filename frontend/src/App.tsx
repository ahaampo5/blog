// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public pages
import Home from './pages/public/Home';
import PostDetail from './pages/public/PostDetail';
import CategoryPosts from './pages/public/CategoryPosts';
import TagPosts from './pages/public/TagPosts';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPosts from './pages/admin/Posts';
import AdminPostEditor from './pages/admin/PostEditor';
import AdminCategories from './pages/admin/Categories';
import AdminTags from './pages/admin/Tags';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';



// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="category/:id" element={<CategoryPosts />} />
              <Route path="tag/:id" element={<TagPosts />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/new" element={<AdminPostEditor />} />
              <Route path="posts/edit/:id" element={<AdminPostEditor />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="tags" element={<AdminTags />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
