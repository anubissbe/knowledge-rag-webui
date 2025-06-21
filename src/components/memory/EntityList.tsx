import { Link } from 'react-router-dom';
import { User, MapPin, Building, Hash, Calendar, Tag } from 'lucide-react';
import type { Entity } from '../../types';

interface EntityListProps {
  entities: Entity[];
}

const entityIcons = {
  person: User,
  place: MapPin,
  organization: Building,
  concept: Hash,
  event: Calendar,
  other: Tag
};

const entityColors = {
  person: 'blue',
  place: 'green',
  organization: 'purple',
  concept: 'orange',
  event: 'red',
  other: 'gray'
};

export default function EntityList({ entities }: EntityListProps) {
  return (
    <div className="space-y-2">
      {entities.map((entity) => {
        const Icon = entityIcons[entity.type];
        const color = entityColors[entity.type];
        
        return (
          <Link
            key={entity.id}
            to={`/entities/${entity.id}`}
            className={`
              flex items-start p-3 rounded-lg transition-colors
              hover:bg-${color}-50 dark:hover:bg-${color}-900/20
              group cursor-pointer
            `}
          >
            <div className={`
              p-2 rounded-lg mr-3 flex-shrink-0
              bg-${color}-100 dark:bg-${color}-900/30
              text-${color}-600 dark:text-${color}-400
            `}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {entity.name}
              </h4>
              
              {entity.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {entity.description}
                </p>
              )}
              
              {entity.aliases.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Also: {entity.aliases.join(', ')}
                </p>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {entity.memoryIds.length} related memories
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}