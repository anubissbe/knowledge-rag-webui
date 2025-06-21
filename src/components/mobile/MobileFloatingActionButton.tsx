import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileFloatingActionButtonProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export default function MobileFloatingActionButton({ 
  to, 
  icon = <Plus className="w-6 h-6" />, 
  label,
  className = ''
}: MobileFloatingActionButtonProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null;
  }

  return (
    <Link
      to={to}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 bg-blue-600 hover:bg-blue-700 
        text-white rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        active:scale-95 touch-manipulation
        ${className}
      `}
      aria-label={label}
    >
      {icon}
    </Link>
  );
}