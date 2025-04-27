// import React from 'react';

// const Header: React.FC = () => {
//   return (
//     <header>
//       <h1>My Blog</h1>
//       <nav>
//         <ul>
//           <li><a href="/">Home</a></li>
//           <li><a href="/about">About</a></li>
//           <li><a href="/contact">Contact</a></li>
//         </ul>
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React from 'react';
import './Header.css';
// 검색 아이콘은 SVG 혹은 아이콘 라이브러리(FontAwesome, Material-UI 등)를 사용하세요.
// import { ReactComponent as SearchIcon } from '../assets/magnifying-glass-solid.svg';

export default function Header() {
  return (
    <header className="header">

      {/* 중앙: 로고 + 네비게이션 */}
      <div className="header__center">
        <h1 className="header__logo">People</h1>
        <nav className="header__nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li>CRIME</li>
            <li>HUMAN INTEREST</li>
            <li>LIFESTYLE</li>
            <li>ROYALS</li>
            <li>STYLEWATCH</li>
            <li>SHOPPING</li>
          </ul>
        </nav>
      </div>

    </header>
  );
}
