import { useState, useMemo } from 'react';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ActivityCard, ClubCard } from '../components';
import { useStore } from '../store';
import { categories } from '../data/activities';

export default function HomePage() {
  const { activities, clubs } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchCategory = selectedCategory === '全部' || activity.category === selectedCategory;
      const matchKeyword = searchKeyword === '' ||
        activity.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        activity.clubName.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchDate = !selectedDate ||
        isSameDay(parseISO(activity.startTime), selectedDate);

      return matchCategory && matchKeyword && matchDate;
    });
  }, [activities, selectedCategory, searchKeyword, selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(a => isSameDay(parseISO(a.startTime), date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600)',
        }}
      >
        <div className="text-center text-white z-10 px-4">
          <h1 className="text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            发现精彩校园活动
          </h1>
          <p className="text-xl mb-8 opacity-90">
            参与社团活动,丰富校园生活
          </p>

          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="搜索活动或社团..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-6 py-4 pl-14 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">活动日历</h2>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    &lt;
                  </button>
                  <h3 className="font-semibold text-gray-900">
                    {format(currentMonth, 'yyyy年 MM月', { locale: zhCN })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    &gt;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}

                  {calendarDays.map(day => {
                    const dayActivities = getActivitiesForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(isSelected ? null : day)}
                        className={`h-10 rounded-lg text-sm transition-all relative ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : isToday
                            ? 'bg-blue-100 text-blue-600 font-bold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {format(day, 'd')}
                        {dayActivities.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {format(selectedDate, 'MM月dd日', { locale: zhCN })}的活动:
                  </p>
                  {getActivitiesForDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getActivitiesForDate(selectedDate).slice(0, 3).map(activity => (
                        <div key={activity.id} className="text-sm text-gray-700 truncate">
                          • {activity.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">暂无活动</p>
                  )}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-8">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  显示{format(selectedDate, 'MM月dd日', { locale: zhCN })}的活动
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    清除筛选
                  </button>
                </p>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">热门活动</h2>
              {filteredActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredActivities.map(activity => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-gray-500">暂无符合条件的活动</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">推荐社团</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.slice(0, 6).map(club => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
