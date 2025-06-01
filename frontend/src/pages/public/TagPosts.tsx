import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi, tagsApi } from '../../services/api';

const TagPosts: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: tag } = useQuery({
    queryKey: ['tag', id],
    queryFn: () => tagsApi.getTag(id!),
    enabled: !!id,
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['tagPosts', id],
    queryFn: () => postsApi.getPublicPosts(1, 20, undefined, id ? [id] : []),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        #{tag?.name || '태그'} 포스트
      </h1>
      <div className="space-y-6">
        {posts?.items.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPosts;
