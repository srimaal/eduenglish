import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-[#92400e] text-white px-4 py-2.5 text-xs font-medium shadow-xl border border-amber-400/30"
    >
      <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
      <div>
        <p className="font-semibold">Offline Mode (නොබැඳි මාදිලිය)</p>
        <p className="text-amber-200/90 text-[11px]">You are offline. Saved lessons and audio are running from device storage.</p>
      </div>
    </div>
  );
};
