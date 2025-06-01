import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
// import ReactMarkdown from 'react-markdown';
import { postsApi } from '../../services/api';
import { formatDate, generateExcerpt } from '../../utils';
import type { PostWithDetails } from '../../types';

const Home: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory] = useState<string>(''); // setSelectedCategory
  const [selectedTags] = useState<string[]>([]); // , setSelectedTags

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicPosts', page, search, selectedCategory, selectedTags],
    queryFn: () => postsApi.getPublicPosts(page, 10, selectedCategory, selectedTags, search),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
        <p className="text-gray-600">포스트를 불러오는 중 문제가 발생했습니다.</p>
      </div>
    );
  }

  const posts = data?.items || [];

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              검색
            </button>
          </div>
        </form>
      </div>

      {/* Featured post */}
      {posts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <FeaturedPost post={posts[0]} />
        </div>
      )}

      {/* Posts grid */}
      <div className="grid gap-6">
        {posts.slice(1).map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">포스트가 없습니다</h2>
          <p className="text-gray-600">아직 게시된 포스트가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

// Featured post component
const FeaturedPost: React.FC<{ post: PostWithDetails }> = ({ post }) => {
  return (
    <div className="relative">
      {post.featured_image && (
        <div className="h-64 bg-gray-200 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <span>{formatDate(post.created_at)}</span>
          {post.category && (
            <Link
              to={`/category/${post.category_id}`}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
            >
              {post.category.name}
            </Link>
          )}
          <span>{post.views} 조회</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          <Link to={`/post/${post._id}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h1>
        <div className="text-gray-600 mb-4">
          {generateExcerpt(post.content, 200)}
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tag_details?.map((tag) => (
            <Link
              key={tag._id}
              to={`/tag/${tag._id}`}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Post card component
const PostCard: React.FC<{ post: PostWithDetails }> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {post.featured_image && (
          <div className="w-48 h-32 bg-gray-200 flex-shrink-0">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span>{formatDate(post.created_at)}</span>
            {post.category && (
              <Link
                to={`/category/${post.category_id}`}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
              >
                {post.category.name}
              </Link>
            )}
            <span>{post.views} 조회</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            <Link to={`/post/${post._id}`} className="hover:text-blue-600 transition-colors">
              {post.title}
            </Link>
          </h2>
          <p className="text-gray-600 mb-3">
            {generateExcerpt(post.content, 150)}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tag_details?.slice(0, 3).map((tag) => (
              <Link
                key={tag._id}
                to={`/tag/${tag._id}`}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
            {post.tag_details && post.tag_details.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{post.tag_details.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Home;
