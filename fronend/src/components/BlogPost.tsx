import React from 'react';

interface BlogPostProps {
  title: string;
  content: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ title, content }) => {
  return (
    <div>
      <h1>{title}</h1>
      <div>{content}</div>
    </div>
  );
};

export default BlogPost;