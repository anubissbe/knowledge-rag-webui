import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineDetection();
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      }`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You're offline</span>
        </>
      )}
    </div>
  );
}