import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Award, Calendar, Users, Bell, Clock, ChevronRight, FileText, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ActivityCard, ClubCard, Badge } from '../components';
import { useStore } from '../store';
import { getPointRecordsByUserId } from '../data/registrations';

type TabType = 'activities' | 'clubs' | 'points' | 'notifications' | 'leaves';

interface ActivityRecord {
  id: number;
  activityId: number;
  title: string;
  coverImage: string;
  location: string;
  startTime: string;
  status: 'registered' | 'checked_in' | 'leave_approved' | 'waitlist' | 'leave_pending';
  statusText: string;
  statusColor: string;
  registeredAt: string;
  position?: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    activities,
    clubs,
    registrations,
    collectedActivities,
    followedClubs,
    notifications,
    markNotificationRead,
    leaveRequests,
    waitlists,
    getUserWaitlistEntry,
  } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后查看您的个人中心</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  const userActivitiesList: ActivityRecord[] = registrations
    .filter(r => r.userId === user.id)
    .map(r => {
      const activity = activities.find(a => a.id === r.activityId);
      return {
        id: r.id,
        activityId: r.activityId,
        title: activity?.title || '未知活动',
        coverImage: activity?.coverImage || '',
        location: activity?.location || '',
        startTime: activity?.startTime || '',
        status: r.status,
        statusText: r.status === 'registered' ? '已报名' :
                   r.status === 'checked_in' ? '已签到' :
                   r.status === 'leave_approved' ? '已请假' : '未知',
        statusColor: r.status === 'registered' ? 'blue' :
                    r.status === 'checked_in' ? 'green' :
                    r.status === 'leave_approved' ? 'orange' : 'gray',
        registeredAt: r.createdAt,
      };
    });

  const userWaitlistEntries = waitlists
    .filter(w => w.userId === user.id)
    .map(w => {
      const activity = activities.find(a => a.id === w.activityId);
      return {
        id: w.id,
        activityId: w.activityId,
        title: activity?.title || '未知活动',
        coverImage: activity?.coverImage || '',
        location: activity?.location || '',
        startTime: activity?.startTime || '',
        status: 'waitlist' as const,
        statusText: `候补中 (第${w.position}位)`,
        statusColor: 'purple',
        registeredAt: w.createdAt,
        position: w.position,
      };
    });

  const userLeavePending = leaveRequests
    .filter(lr => lr.userId === user.id && lr.status === 'pending')
    .map(lr => {
      const activity = activities.find(a => a.id === lr.activityId);
      return {
        id: lr.id,
        activityId: lr.activityId,
        title: activity?.title || '未知活动',
        coverImage: activity?.coverImage || '',
        location: activity?.location || '',
        startTime: activity?.startTime || '',
        status: 'leave_pending' as const,
        statusText: '请假审核中',
        statusColor: 'yellow',
        registeredAt: lr.createdAt,
      };
    });

  const allActivityRecords = [...userActivitiesList, ...userWaitlistEntries, ...userLeavePending]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const filteredActivities = allActivityRecords.filter(record => {
    if (activityFilter === 'all') return true;
    const startDate = new Date(record.startTime);
    const now = new Date();
    if (activityFilter === 'upcoming') {
      return startDate >= now;
    } else {
      return startDate < now;
    }
  });

  const userCollectedActivities = activities.filter(a => collectedActivities.includes(a.id));
  const userFollowedClubs = clubs.filter(c => followedClubs.includes(c.id));
  const pointRecords = getPointRecordsByUserId(user.id);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const userLeaveRequests = leaveRequests.filter(lr => lr.userId === user.id);

  const tabs = [
    { id: 'activities', label: '我的活动', icon: Calendar, count: allActivityRecords.length },
    { id: 'clubs', label: '我的社团', icon: Users, count: userFollowedClubs.length },
    { id: 'points', label: '积分记录', icon: Award, count: null },
    { id: 'leaves', label: '请假记录', icon: FileText, count: userLeaveRequests.length },
    { id: 'notifications', label: '通知', icon: Bell, count: unreadNotifications },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-blue-100 mb-4">学号: {user.studentId}</p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.points}</p>
                  <p className="text-sm text-blue-100">积分</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userActivitiesList.length}</p>
                  <p className="text-sm text-blue-100">参与活动</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userFollowedClubs.length}</p>
                  <p className="text-sm text-blue-100">关注社团</p>
                </div>
              </div>
            </div>

            <Badge variant="success" className="text-sm px-3 py-1">
              {user.role === 'admin' ? '系统管理员' : user.role === 'club_admin' ? '社团管理员' : '普通用户'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">菜单</h2>
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <tab.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count !== null && tab.count > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">我的活动</h2>
                  <div className="flex space-x-2">
                    {(['all', 'upcoming', 'completed'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activityFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {filter === 'all' ? '全部' : filter === 'upcoming' ? '进行中' : '已结束'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map(record => (
                      <div
                        key={`${record.status}-${record.id}`}
                        onClick={() => navigate(`/activity/${record.activityId}`)}
                        className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                      >
                        <div className="flex">
                          <img
                            src={record.coverImage}
                            alt={record.title}
                            className="w-48 h-32 object-cover"
                          />
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                                  {record.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {format(parseISO(record.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                                </p>
                                <p className="text-sm text-gray-500">{record.location}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    record.statusColor === 'blue' ? 'category' :
                                    record.statusColor === 'green' ? 'success' :
                                    record.statusColor === 'purple' ? 'status' :
                                    record.statusColor === 'orange' ? 'warning' : 'default'
                                  }
                                >
                                  {record.statusText}
                                </Badge>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                报名时间: {format(parseISO(record.registeredAt), 'MM-dd HH:mm', { locale: zhCN })}
                              </div>
                              <span className="text-blue-600 text-xs hover:underline">点击查看详情 →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无{activityFilter === 'all' ? '' : activityFilter === 'upcoming' ? '进行中' : '已结束'}的活动</p>
                      <Link
                        to="/"
                        className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        浏览活动
                      </Link>
                    </div>
                  )}
                </div>

                {userCollectedActivities.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">收藏的活动</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userCollectedActivities.slice(0, 4).map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'clubs' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">关注的社团</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userFollowedClubs.length > 0 ? (
                    userFollowedClubs.map(club => (
                      <ClubCard key={club.id} club={club} />
                    ))
                  ) : (
                    <div className="col-span-3 bg-white rounded-xl shadow-md p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无关注的社团</p>
                      <Link
                        to="/"
                        className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        浏览社团
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-2">当前积分</p>
                      <p className="text-5xl font-bold">{user.points}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 mb-2">积分排名</p>
                      <p className="text-3xl font-bold">#{Math.floor(Math.random() * 50) + 1}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">积分记录</h3>
                  <div className="space-y-4">
                    {pointRecords.map(record => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              record.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {record.type === 'earn' ? (
                              <Award className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.description}</p>
                            <p className="text-sm text-gray-500">
                              {format(parseISO(record.createdAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            record.type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {record.type === 'earn' ? '+' : '-'}{record.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">请假记录</h2>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {userLeaveRequests.length > 0 ? (
                    userLeaveRequests.map(leave => {
                      const activity = activities.find(a => a.id === leave.activityId);
                      return (
                        <div key={leave.id} className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-orange-600 mr-2" />
                              <h3 className="font-semibold text-gray-900">
                                {activity?.title || '未知活动'}
                              </h3>
                            </div>
                            <Badge
                              variant={
                                leave.status === 'approved'
                                  ? 'success'
                                  : leave.status === 'rejected'
                                  ? 'warning'
                                  : 'info'
                              }
                            >
                              {leave.status === 'pending'
                                ? '待审核'
                                : leave.status === 'approved'
                                ? '已通过'
                                : '已拒绝'}
                            </Badge>
                          </div>
                          <div className="ml-7 space-y-2">
                            <p className="text-gray-700">
                              <span className="font-medium">请假原因:</span> {leave.reason}
                            </p>
                            <p className="text-sm text-gray-500">
                              申请时间: {format(parseISO(leave.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无请假记录</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">通知</h2>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {format(parseISO(notification.createdAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无通知</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
