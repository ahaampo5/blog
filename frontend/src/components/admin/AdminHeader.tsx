import React from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { getStoredUser } from '../../utils';

const AdminHeader: React.FC = () => {
  const user = getStoredUser();

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/admin/login';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/admin" className="text-xl font-bold text-gray-900">
            Blog Admin
          </Link>
          
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              안녕하세요, {user?.username}님
            </span>
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              target="_blank"
            >
              블로그 보기
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
