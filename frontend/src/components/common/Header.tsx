import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gray-900">
            My Blog
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              홈
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              카테고리
            </Link>
            <Link 
              to="/tags" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              태그
            </Link>
          </nav>
          
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="검색..."
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <nav className="px-4 py-2 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            홈
          </Link>
          <Link 
            to="/categories" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            카테고리
          </Link>
          <Link 
            to="/tags" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            태그
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
