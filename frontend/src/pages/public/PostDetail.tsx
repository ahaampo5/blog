import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { postsApi } from '../../services/api';
import { formatDate } from '../../utils';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPublicPost(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">포스트를 찾을 수 없습니다</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.featured_image && (
        <div className="h-64 bg-gray-200 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-8">
        {/* Meta info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          <span>{formatDate(post.created_at)}</span>
          {post.category && (
            <Link
              to={`/category/${post.category_id}`}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
            >
              {post.category.name}
            </Link>
          )}
          <span>{post.views} 조회</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tag_details && post.tag_details.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">태그</h3>
            <div className="flex flex-wrap gap-2">
              {post.tag_details.map((tag) => (
                <Link
                  key={tag._id}
                  to={`/tag/${tag._id}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostDetail;
