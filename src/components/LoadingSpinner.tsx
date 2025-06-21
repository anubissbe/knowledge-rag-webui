import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`}
          aria-hidden="true"
        />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}