import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi, categoriesApi } from '../../services/api';

const CategoryPosts: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getCategory(id!),
    enabled: !!id,
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['categoryPosts', id],
    queryFn: () => postsApi.getPublicPosts(1, 20, id),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {category?.name || '카테고리'} 포스트
      </h1>
      {category?.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}
      <div className="space-y-6">
        {posts?.items.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPosts;
