import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BlogPost from '../components/BlogPost';
import { categoriesData } from '../types';

const Post: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const decodedTitle = decodeURIComponent(title || '');
  const post = useMemo(() => {
    for (const cat of categoriesData) {
      for (const mid of cat.middleCategories) {
        for (const det of mid.detailCategories) {
          const found = det.blogPosts.find((b) => b.title === decodedTitle);
          if (found) return found;
        }
      }
    }
    return null;
  }, [decodedTitle]);

  return (
    <div>
      {post ? (
        <BlogPost title={post.title} content={post.content} />
      ) : (
        <h2>Post not found</h2>
      )}
    </div>
  );
};

export default Post;