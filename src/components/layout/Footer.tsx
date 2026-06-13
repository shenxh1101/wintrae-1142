import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold">校园社团</span>
            </div>
            <p className="text-gray-400 text-sm">
              为校园社团活动提供便捷的发布、管理和参与平台
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/clubs" className="hover:text-white transition-colors">
                  社团列表
                </a>
              </li>
              <li>
                <a href="/activities" className="hover:text-white transition-colors">
                  活动中心
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>邮箱: info@campus-club.edu</li>
              <li>电话: 400-123-4567</li>
              <li>地址: 大学生活动中心</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center space-x-1">
            <span>© 2026 校园社团管理系统</span>
            <span className="mx-2">•</span>
            <span>用</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>构建</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
