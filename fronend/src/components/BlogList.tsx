import React from 'react';

interface BlogListProps {
  titles: string[];
  onTitleClick: (title: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ titles, onTitleClick }) => {
  return (
    <div>
      <h2>Blog Titles</h2>
      <ul>
        {titles.map((title) => (
          <li key={title} onClick={() => onTitleClick(title)}>
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogList;