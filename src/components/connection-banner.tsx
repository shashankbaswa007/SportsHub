"use client";

import { useConnectionStatus } from '@/hooks/use-connection-status';
import { WifiOff, Wifi } from 'lucide-react';

export function ConnectionBanner() {
  const { isOnline, wasOffline } = useConnectionStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-600/90 text-white'
          : 'bg-red-600/90 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Back online — data is syncing</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>You&apos;re offline — some features may not work</span>
        </>
      )}
    </div>
  );
}
