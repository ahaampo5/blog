import React from 'react';

interface DetailCategoryProps {
  title: string;
  blogTitles: string[];
  onBlogTitleClick: (title: string) => void;
}

const DetailCategory: React.FC<DetailCategoryProps> = ({ title, blogTitles, onBlogTitleClick }) => {
  return (
    <div className="detail-category">
      <h3>{title}</h3>
      <ul>
        {blogTitles.map((blogTitle) => (
          <li key={blogTitle} onClick={() => onBlogTitleClick(blogTitle)}>
            {blogTitle}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DetailCategory;