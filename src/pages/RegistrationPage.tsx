import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Users, CheckCircle, Clock, AlertCircle, QrCode, FileText, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { saveAs } from 'file-saver';
import { Badge } from '../components';
import { useStore } from '../store';
import { getWaitlistsByActivityId } from '../data/registrations';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { user, activities, registrations, checkin, approveLeaveRequest } = useStore();
  const [selectedActivityId, setSelectedActivityId] = useState<number>(activities[0]?.id || 0);
  const [activeTab, setActiveTab] = useState<'registrations' | 'statistics' | 'waitlist'>('registrations');

  if (!user || (user.role !== 'club_admin' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">权限不足</h2>
          <p className="text-gray-600">您没有权限访问此页面</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const selectedActivity = activities.find(a => a.id === selectedActivityId);
  const activityRegistrations = registrations.filter(r => r.activityId === selectedActivityId);
  const waitlists = getWaitlistsByActivityId(selectedActivityId);

  const checkedInCount = activityRegistrations.filter(r => r.status === 'checked_in').length;
  const notCheckedInCount = activityRegistrations.filter(r => r.status === 'registered').length;
  const leaveApprovedCount = activityRegistrations.filter(r => r.status === 'leave_approved').length;

  const statisticsData = [
    { date: '06-01', registrations: 12, checkins: 10 },
    { date: '06-05', registrations: 18, checkins: 16 },
    { date: '06-10', registrations: 25, checkins: 23 },
    { date: '06-15', registrations: 32, checkins: 28 },
    { date: '06-20', registrations: 38, checkins: 35 },
    { date: '06-25', registrations: 42, checkins: 40 },
  ];

  const handleExport = () => {
    const csvContent = [
      ['姓名', '学号', '报名时间', '签到状态', '签到时间'].join(','),
      ...activityRegistrations.map(r => [
        r.userName,
        r.userId.toString().padStart(10, '0'),
        format(parseISO(r.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        r.status === 'checked_in' ? '已签到' : '未签到',
        r.checkinTime ? format(parseISO(r.checkinTime), 'yyyy-MM-dd HH:mm:ss') : '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${selectedActivity?.title}_报名名单_${format(new Date(), 'yyyyMMdd')}.csv`);
    alert('导出成功!');
  };

  const handleCheckin = (userId: number) => {
    const result = checkin(selectedActivityId, userId);
    if (result.success) {
      alert('签到成功!');
    } else {
      alert(result.message);
    }
    navigate(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">报名管理</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择活动</label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(Number(e.target.value))}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">报名人数</p>
                  <p className="text-2xl font-bold text-gray-900">{activityRegistrations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">已签到</p>
                  <p className="text-2xl font-bold text-gray-900">{checkedInCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">未签到</p>
                  <p className="text-2xl font-bold text-gray-900">{notCheckedInCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">请假</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveApprovedCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'registrations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              报名名单
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'statistics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              报名趋势
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'waitlist'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              候补队列 ({waitlists.length})
            </button>
          </div>

          {activeTab === 'registrations' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">报名人员列表</h2>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出名单
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        报名时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityRegistrations.map(registration => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={registration.userAvatar}
                              alt={registration.userName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {registration.userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {registration.userId.toString().padStart(10, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(parseISO(registration.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              registration.status === 'checked_in'
                                ? 'success'
                                : registration.status === 'leave_approved'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {registration.status === 'checked_in'
                              ? '已签到'
                              : registration.status === 'leave_approved'
                              ? '已请假'
                              : '未签到'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {registration.status === 'registered' && (
                            <button
                              onClick={() => handleCheckin(registration.userId)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              签到
                            </button>
                          )}
                          {registration.status === 'checked_in' && (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              已完成
                            </span>
                          )}
                          {registration.status === 'leave_approved' && (
                            <span className="text-orange-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              已请假
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {activityRegistrations.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无报名人员</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">报名趋势</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statisticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="registrations" stroke="#2563eb" strokeWidth={2} name="报名人数" />
                    <Line type="monotone" dataKey="checkins" stroke="#10b981" strokeWidth={2} name="签到人数" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <FileText className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">签到率统计</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: '已签到', value: checkedInCount, fill: '#10b981' },
                    { name: '未签到', value: notCheckedInCount, fill: '#f97316' },
                    { name: '已请假', value: leaveApprovedCount, fill: '#8b5cf6' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'waitlist' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">候补队列</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        候补序号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        加入时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {waitlists.map(waitlist => (
                      <tr key={waitlist.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                            {waitlist.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {waitlist.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(parseISO(waitlist.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800">
                            通知候补
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {waitlists.length === 0 && (
                  <div className="p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无候补人员</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
