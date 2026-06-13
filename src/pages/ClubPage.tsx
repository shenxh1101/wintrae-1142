import { useParams, Link } from 'react-router-dom';
import { Users, Heart, Award, Calendar } from 'lucide-react';
import { ActivityCard, Loading } from '../components';
import { useStore } from '../store';
import { mockUsers } from '../data/users';

export default function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const { clubs, activities, followedClubs, toggleFollowClub } = useStore();

  const club = clubs.find(c => c.id === Number(id));
  const clubActivities = activities.filter(a => a.clubId === Number(id));
  const isFollowed = followedClubs.includes(Number(id));

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="加载中..." />
      </div>
    );
  }

  const admin = mockUsers.find(u => u.id === club.adminId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start space-x-6">
            <img
              src={club.logo}
              alt={club.name}
              className="w-32 h-32 rounded-2xl shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <p className="text-blue-100 mb-4">{club.description}</p>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{club.memberCount} 成员</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  <span>{club.followerCount} 关注</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{clubActivities.length} 活动</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleFollowClub(club.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isFollowed
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isFollowed ? '已关注' : '关注社团'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">社团活动</h2>
              {clubActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clubActivities.map(activity => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无活动</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">社团信息</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="text-gray-900">{new Date(club.createdAt).getFullYear()}年</p>
                </div>

                {admin && (
                  <div>
                    <p className="text-sm text-gray-500">管理员</p>
                    <div className="flex items-center mt-2">
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-gray-900 font-medium">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.studentId}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  社团成就
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{club.memberCount}</p>
                    <p className="text-sm text-gray-600">成员数</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{clubActivities.length}</p>
                    <p className="text-sm text-gray-600">举办活动</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">关于我们</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {club.name}是一个充满活力和创造力的学生组织,
                  致力于为同学们提供丰富多彩的校园生活。我们欢迎所有志同道合的朋友加入!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
