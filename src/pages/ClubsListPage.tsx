import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { ClubCard } from '../components';
import { useStore } from '../store';

export default function ClubsListPage() {
  const { clubs } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchKeyword = searchKeyword === '' ||
        club.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        club.description.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchKeyword;
    });
  }, [clubs, searchKeyword]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">社团联盟</h1>
          <p className="text-xl text-green-100">加入感兴趣的社团,结识志同道合的伙伴</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索社团..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClubs.map(club => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无符合条件的社团</p>
          </div>
        )}
      </div>
    </div>
  );
}
