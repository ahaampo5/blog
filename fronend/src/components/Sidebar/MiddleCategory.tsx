import React, { useState } from 'react';
import DetailCategoryComponent from './DetailCategory';
import type { DetailCategory as DetailCategoryType } from '../../types';

interface MiddleCategoryProps {
  category: string;
  details: DetailCategoryType[];
  onBlogTitleClick: (title: string) => void;
}

const MiddleCategory: React.FC<MiddleCategoryProps> = ({ category, details, onBlogTitleClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen(prev => !prev);

  return (
    <div>
      <h3 onClick={handleToggle} style={{ cursor: 'pointer' }}>
        {category}
      </h3>
      {isOpen && (
        <div>
          {details.map(detail => (
            <DetailCategoryComponent
              key={detail.title}
              title={detail.title}
              blogTitles={detail.blogPosts.map(post => post.title)}
              onBlogTitleClick={onBlogTitleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MiddleCategory;