import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">My Blog</h3>
            <p className="text-gray-400">
              개발과 기술에 대한 이야기를 공유하는 블로그입니다.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  홈
                </a>
              </li>
              {/* <li>
                <a href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  카테고리
                </a>
              </li>
              <li>
                <a href="/tags" className="text-gray-400 hover:text-white transition-colors">
                  태그
                </a>
              </li> */}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <p className="text-gray-400">
              Email: ahaampo5@gmail.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 My Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
