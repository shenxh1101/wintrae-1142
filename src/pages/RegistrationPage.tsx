import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Users, CheckCircle, Clock, AlertCircle, QrCode, BarChart3, FileText, TrendingUp } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, subDays, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Area, AreaChart } from 'recharts';
import { saveAs } from 'file-saver';
import { Badge } from '../components';
import { useStore } from '../store';
import { mockUsers } from '../data/users';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const {
    user,
    activities,
    registrations,
    checkin,
    approveLeaveRequest,
    rejectLeaveRequest,
    leaveRequests,
    getWaitlistsByActivity,
  } = useStore();
  const [selectedActivityId, setSelectedActivityId] = useState<number>(activities[0]?.id || 0);
  const [activeTab, setActiveTab] = useState<'registrations' | 'statistics' | 'waitlist' | 'leave'>('registrations');

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
  const waitlists = getWaitlistsByActivity(selectedActivityId);
  const activityLeaveRequests = leaveRequests.filter(lr => lr.activityId === selectedActivityId);
  
  const checkedInCount = activityRegistrations.filter(r => r.status === 'checked_in').length;
  const notCheckedInCount = activityRegistrations.filter(r => r.status === 'registered').length;
  const leaveApprovedCount = activityRegistrations.filter(r => r.status === 'leave_approved').length;
  
  const totalRegistrationCount = activityRegistrations.length;

  const timeSeriesData = useMemo(() => {
    if (!selectedActivity) return [];
    
    const dates = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });
    
    const sortedRegistrations = [...activityRegistrations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const sortedWaitlists = [...waitlists].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return dates.map((date) => {
      const regInPeriod = sortedRegistrations.filter(r => {
        const regDate = parseISO(r.createdAt);
        return regDate <= date;
      });
      
      const waitlistInPeriod = sortedWaitlists.filter(w => {
        const waitlistDate = parseISO(w.createdAt);
        return waitlistDate <= date;
      });
      
      const regCount = regInPeriod.length;
      const checkinCount = regInPeriod.filter(r => r.status === 'checked_in').length;
      const leaveCount = regInPeriod.filter(r => r.status === 'leave_approved').length;
      const waitlistCount = waitlistInPeriod.length;
      
      return {
        date: format(date, 'MM-dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        报名人数: regCount,
        已签到: checkinCount,
        已请假: leaveCount,
        候补中: waitlistCount,
      };
    });
  }, [selectedActivity, activityRegistrations, waitlists]);

  const handleExport = () => {
    const exportDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    
    const registrationSection = [
      `═══════════════════════════════════════════════════════`,
      `  正式报名名单 (${totalRegistrationCount}人)`,
      `═══════════════════════════════════════════════════════`,
      '序号,姓名,学号,报名时间,签到状态,签到时间',
      ...activityRegistrations.map((r, index) => {
        const userData = mockUsers.find(u => u.id === r.userId);
        return [
          (index + 1).toString(),
          r.userName,
          userData?.studentId || r.userId.toString(),
          format(parseISO(r.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          r.status === 'checked_in' ? '已签到' : r.status === 'leave_approved' ? '已请假' : '未签到',
          r.checkinTime ? format(parseISO(r.checkinTime), 'yyyy-MM-dd HH:mm:ss') : '-',
        ].join(',');
      }),
    ];

    const waitlistSection = [
      '',
      `═══════════════════════════════════════════════════════`,
      `  候补名单 (${waitlists.length}人)`,
      `═══════════════════════════════════════════════════════`,
      '候补序号,姓名,加入时间',
      ...waitlists.map(w => [
        w.position.toString(),
        w.userName,
        format(parseISO(w.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      ].join(',')),
    ];

    const summarySection = [
      '',
      `═══════════════════════════════════════════════════════`,
      `  统计汇总`,
      `═══════════════════════════════════════════════════════`,
      `活动名称: ${selectedActivity?.title || '未知活动'}`,
      `报名人数: ${totalRegistrationCount}人`,
      `已签到: ${checkedInCount}人`,
      `未签到: ${notCheckedInCount}人`,
      `已请假: ${leaveApprovedCount}人`,
      `候补人数: ${waitlists.length}人`,
      `导出时间: ${exportDate}`,
    ];

    const csvContent = [
      ...registrationSection,
      ...waitlistSection,
      ...summarySection,
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${selectedActivity?.title}_报名名单_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    alert('导出成功!\n\n已包含正式报名和候补名单');
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

  const handleApproveLeave = (leaveRequestId: number) => {
    const result = approveLeaveRequest(leaveRequestId);
    if (result.promoted) {
      alert(`请假申请已通过,候补人员"${result.promotedUser}"已自动转正!`);
    } else {
      alert('请假申请已通过');
    }
    navigate(0);
  };

  const chartData = [
    { name: '报名人数', count: totalRegistrationCount, fill: '#3b82f6' },
    { name: '已签到', count: checkedInCount, fill: '#10b981' },
    { name: '未签到', count: notCheckedInCount, fill: '#f97316' },
    { name: '已请假', count: leaveApprovedCount, fill: '#8b5cf6' },
    { name: '候补中', count: waitlists.length, fill: '#ec4899' },
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">报名人数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRegistrationCount}</p>
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
                  <p className="text-sm text-gray-600">已请假</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveApprovedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-pink-50 rounded-xl p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-pink-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">候补中</p>
                  <p className="text-2xl font-bold text-gray-900">{waitlists.length}</p>
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
              报名名单 ({totalRegistrationCount})
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'statistics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              报名统计
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
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'leave'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              请假申请 ({activityLeaveRequests.length})
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
                    {activityRegistrations.map(registration => {
                      const userData = mockUsers.find(u => u.id === registration.userId);
                      return (
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
                            {userData?.studentId || registration.userId.toString()}
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
                      );
                    })}
                  </tbody>
                </table>

                {totalRegistrationCount === 0 && (
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
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">报名趋势图</h2>
                  <span className="ml-3 text-sm text-gray-500">近14天数据</span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorRegistration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCheckin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWaitlist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value, name) => [`${value}人`, name]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="报名人数" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRegistration)" strokeWidth={2} />
                    <Area type="monotone" dataKey="已签到" stroke="#10b981" fillOpacity={1} fill="url(#colorCheckin)" strokeWidth={2} />
                    <Area type="monotone" dataKey="已请假" stroke="#f97316" fillOpacity={1} fill="url(#colorLeave)" strokeWidth={2} />
                    <Area type="monotone" dataKey="候补中" stroke="#ec4899" fillOpacity={1} fill="url(#colorWaitlist)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">当前数据统计</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <FileText className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">数据概览</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">报名率</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedActivity?.quota
                        ? Math.round((totalRegistrationCount / selectedActivity.quota) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">签到率</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalRegistrationCount > 0
                        ? Math.round((checkedInCount / totalRegistrationCount) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">未签到率</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalRegistrationCount > 0
                        ? Math.round((notCheckedInCount / totalRegistrationCount) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">请假率</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {totalRegistrationCount > 0
                        ? Math.round((leaveApprovedCount / totalRegistrationCount) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-pink-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">候补情况</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600">候补人数</p>
                    <p className="text-2xl font-bold text-pink-600">{waitlists.length}人</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">名额状态</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalRegistrationCount}/{selectedActivity?.quota || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waitlist' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">候补队列</h2>
                <p className="text-sm text-gray-500 mt-1">
                  当有人取消报名或请假通过时,候补队列第一位将自动转正并收到通知
                </p>
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
                        状态
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">等待中</Badge>
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

          {activeTab === 'leave' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">请假申请列表</h2>
                <p className="text-sm text-gray-500 mt-1">
                  通过请假申请后,如果候补队列有人,将自动转正
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        请假原因
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        申请时间
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
                    {activityLeaveRequests.map(leave => (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {leave.userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {leave.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(parseISO(leave.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveLeave(leave.id)}
                                className="text-green-600 hover:text-green-800 mr-4"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => {
                                  rejectLeaveRequest(leave.id);
                                  alert('已拒绝请假申请');
                                  navigate(0);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                拒绝
                              </button>
                            </>
                          )}
                          {leave.status !== 'pending' && (
                            <span className="text-gray-400">已处理</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {activityLeaveRequests.length === 0 && (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无请假申请</p>
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
