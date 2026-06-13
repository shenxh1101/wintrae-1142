import { Link } from 'react-router-dom';
import { Users, Heart } from 'lucide-react';
import { Club } from '../types';
import { useStore } from '../store';
import { Badge } from './Badge';

interface ClubCardProps {
  club: Club;
}

export default function ClubCard({ club }: ClubCardProps) {
  const { toggleFollowClub, followedClubs } = useStore();
  const isFollowed = followedClubs.includes(club.id);

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollowClub(club.id);
  };

  return (
    <Link to={`/club/${club.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <img
              src={club.logo}
              alt={club.name}
              className="w-16 h-16 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <button
              onClick={handleFollow}
              className={`p-2 rounded-full transition-colors ${
                isFollowed
                  ? 'bg-red-50 text-red-500 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFollowed ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {club.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {club.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{club.memberCount} 成员</span>
              </div>
            </div>

            {isFollowed && <Badge variant="success">已关注</Badge>}
          </div>
        </div>
      </div>
    </Link>
  );
}
