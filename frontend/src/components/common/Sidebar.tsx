import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoriesApi, tagsApi } from '../../services/api';

const Sidebar: React.FC = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getTags,
  });

  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">카테고리</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/category/${category.id}`}
                className="text-gray-600 hover:text-blue-600 transition-colors block py-1"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">태그</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.id}`}
              className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">최근 포스트</h3>
        <div className="space-y-3">
          {/* This will be populated with recent posts */}
          <p className="text-gray-600 text-sm">최근 포스트가 없습니다.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
