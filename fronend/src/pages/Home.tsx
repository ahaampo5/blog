import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import BlogList from '../components/BlogList';
import { DetailCategory } from '../types';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const [selectedDetail, setSelectedDetail] = useState<DetailCategory | null>(null);
  const history = useHistory();

  const handleDetailClick = (detail: DetailCategory) => {
    setSelectedDetail(detail);
  };

  const handleTitleClick = (title: string) => {
    history.push(`/post/${encodeURIComponent(title)}`);
  };

  const titles = selectedDetail ? selectedDetail.blogPosts.map((post) => post.title) : [];

  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar onDetailClick={handleDetailClick} />
        <BlogList titles={titles} onTitleClick={handleTitleClick} />
      </div>
    </div>
  );
};

export default Home;