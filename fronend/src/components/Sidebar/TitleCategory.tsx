import React, { useState } from 'react';
import MiddleCategory from './MiddleCategory';

const TitleCategory = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <h2 onClick={handleToggle} style={{ cursor: 'pointer' }}>
        Title Category
      </h2>
      {isOpen && <MiddleCategory category="Title Category" details={[]} onBlogTitleClick={() => {}} />}
    </div>
  );
};

export default TitleCategory;