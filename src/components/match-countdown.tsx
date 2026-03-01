"use client";

import { useState, useEffect, memo } from 'react';

interface MatchCountdownProps {
  startTime: string;
  compact?: boolean;
}

export const MatchCountdown = memo(function MatchCountdown({ startTime, compact }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(startTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <span className="text-xs font-mono text-amber-400/80">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ].filter(u => u.value > 0 || u.label === 'Sec');

  return (
    <div className="flex items-center gap-1.5">
      {units.map(unit => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] text-white/30 mt-0.5 uppercase tracking-wider">{unit.label}</span>
        </div>
      ))}
    </div>
  );
});
