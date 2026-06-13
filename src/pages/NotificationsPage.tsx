import { Link } from 'react-router-dom';
import { Bell, ChevronRight, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, user } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后查看您的通知</p>
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">通知中心</h1>
          <p className="text-xl text-purple-100">
            {notifications.filter(n => !n.isRead).length > 0
              ? `您有 ${notifications.filter(n => !n.isRead).length} 条未读通知`
              : '暂无未读通知'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markNotificationRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-4 mt-2 flex-shrink-0" />
                    )}
                    {notification.isRead && (
                      <div className="w-2 h-2 mr-4 mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {notification.title}
                        </h3>
                        {notification.type === 'leave_result' && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                            请假申请
                          </span>
                        )}
                        {notification.type === 'registration_confirm' && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                            报名成功
                          </span>
                        )}
                        {notification.type === 'activity_reminder' && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                            活动提醒
                          </span>
                        )}
                        {notification.type === 'waitlist_notify' && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                            候补通知
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-400">
                        {format(parseISO(notification.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">暂无通知</p>
              <p className="text-gray-400 mt-2">所有消息都已处理完毕</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
