import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Heart, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Activity } from '../types';
import { useStore } from '../store';
import { Badge } from './Badge';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { toggleCollectActivity, collectedActivities } = useStore();
  const isCollected = collectedActivities.includes(activity.id);

  const startDate = parseISO(activity.startTime);
  const daysUntilStart = differenceInDays(startDate, new Date());
  const isUpcoming = daysUntilStart > 0 && daysUntilStart <= 7;

  const handleCollect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCollectActivity(activity.id);
  };

  return (
    <Link to={`/activity/${activity.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <button
            onClick={handleCollect}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isCollected
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="category">{activity.category}</Badge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {activity.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{format(startDate, 'MM月dd日 HH:mm', { locale: zhCN })}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <img
                src={activity.clubLogo}
                alt={activity.clubName}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-700">{activity.clubName}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>
                  {activity.signedCount}/{activity.quota}
                </span>
              </div>

              {isUpcoming && (
                <div className="flex items-center text-sm text-orange-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{daysUntilStart}天后</span>
                </div>
              )}
            </div>
          </div>

          {activity.signedCount >= activity.quota && (
            <div className="mt-3">
              <Badge variant="warning">名额已满</Badge>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
