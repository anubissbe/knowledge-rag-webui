import { Link } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';

interface TagListProps {
  tags: string[];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TagList({ 
  tags, 
  showIcon = false, 
  size = 'md',
  className = '' 
}: TagListProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/search?tag=${encodeURIComponent(tag)}`}
          className={`
            inline-flex items-center rounded-full font-medium
            bg-blue-50 dark:bg-blue-900/20 
            text-blue-700 dark:text-blue-300
            hover:bg-blue-100 dark:hover:bg-blue-900/30
            transition-colors
            ${sizeClasses[size]}
          `}
          aria-label={`View memories tagged with ${tag}`}
        >
          {showIcon && <TagIcon className="w-3 h-3 mr-1" />}
          {tag}
        </Link>
      ))}
    </div>
  );
}