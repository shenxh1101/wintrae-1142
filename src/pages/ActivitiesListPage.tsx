import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ActivityCard } from '../components';
import { useStore } from '../store';
import { categories } from '../data/activities';

export default function ActivitiesListPage() {
  const { activities } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchCategory = selectedCategory === '全部' || activity.category === selectedCategory;
      const matchKeyword = searchKeyword === '' ||
        activity.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        activity.clubName.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchKeyword;
    });
  }, [activities, selectedCategory, searchKeyword]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">活动中心</h1>
          <p className="text-xl text-blue-100">发现精彩校园活动,丰富你的大学生活</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            共找到 <span className="font-bold text-blue-600">{filteredActivities.length}</span> 个活动
          </p>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">暂无符合条件的活动</p>
          </div>
        )}
      </div>
    </div>
  );
}
