import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={clsx(sizeClasses[size], 'animate-spin text-blue-600')} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}
