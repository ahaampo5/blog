import React, { useState } from 'react';
import type { DetailCategory, Category, MiddleCategory } from '../../types';
import { categoriesData } from '../../types';

interface SidebarProps {
  onDetailClick: (detail: DetailCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDetailClick }) => {
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);
  const [selectedMiddleIndex, setSelectedMiddleIndex] = useState<number | null>(null);

  return (
    <div className="sidebar">
      <ul>
        {categoriesData.map((cat: Category, idx: number) => (
          <li key={cat.title} onClick={() => { setSelectedTitleIndex(idx); setSelectedMiddleIndex(null); }} style={{ cursor: 'pointer' }}>
            {cat.title}
          </li>
        ))}
      </ul>
      {selectedTitleIndex !== null && (
        <ul>
          {categoriesData[selectedTitleIndex].middleCategories.map((mid: MiddleCategory, midIdx: number) => (
            <li key={mid.title} onClick={() => setSelectedMiddleIndex(midIdx)} style={{ cursor: 'pointer' }}>
              {mid.title}
            </li>
          ))}
        </ul>
      )}
      {selectedTitleIndex !== null && selectedMiddleIndex !== null && (
        <ul>
          {categoriesData[selectedTitleIndex].middleCategories[selectedMiddleIndex].detailCategories.map((det) => (
            <li key={det.title} onClick={() => onDetailClick(det)} style={{ cursor: 'pointer' }}>
              {det.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;