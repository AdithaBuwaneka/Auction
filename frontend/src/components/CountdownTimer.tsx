'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({ endTime, onExpire, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const difference = end - now;

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
          if (onExpire) onExpire();
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } catch (error) {
        console.error('Error calculating time:', error);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const getTimerColor = () => {
    if (timeLeft.total === 0) return 'text-gray-500';
    if (timeLeft.total < 5 * 60 * 1000) return 'text-red-600'; // Less than 5 minutes
    if (timeLeft.total < 30 * 60 * 1000) return 'text-orange-600'; // Less than 30 minutes
    return 'text-green-600';
  };

  const isEndingSoon = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000;

  if (timeLeft.total === 0) {
    return (
      <div className={`flex items-center ${className}`}>
        <Clock size={20} className="mr-2 text-gray-500" />
        <span className="text-lg font-bold text-gray-500">Auction Ended</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Clock size={20} className={`mr-2 ${isEndingSoon ? 'animate-pulse' : ''} ${getTimerColor()}`} />
      <div className={`flex gap-2 ${getTimerColor()} font-mono text-lg font-bold ${isEndingSoon ? 'animate-pulse' : ''}`}>
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className="bg-gray-100 px-2 py-1 rounded">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 font-normal mt-1">Days</div>
          </div>
        )}
        <div className="text-center">
          <div className="bg-gray-100 px-2 py-1 rounded">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 font-normal mt-1">Hours</div>
        </div>
        <span className="self-center">:</span>
        <div className="text-center">
          <div className="bg-gray-100 px-2 py-1 rounded">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 font-normal mt-1">Min</div>
        </div>
        <span className="self-center">:</span>
        <div className="text-center">
          <div className="bg-gray-100 px-2 py-1 rounded">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 font-normal mt-1">Sec</div>
        </div>
      </div>
    </div>
  );
}
