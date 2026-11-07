import React from 'react';
import { getChameleonDef } from '@/lib/constants';
import { ChameleonIcon } from './ChameleonIcon';

interface ChameleonAvatarProps {
  color?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const ChameleonAvatar: React.FC<ChameleonAvatarProps> = ({
  color = '#10B981',
  name = '',
  size = 'md',
  showOnlineStatus = false,
  isOnline = true,
  className = '',
}) => {
  const chameleon = getChameleonDef(color);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }[size];

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 32,
    xl: 46,
  }[size];

  const initial = name ? name.trim().charAt(0).toUpperCase() : '';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Glowing Circle */}
      <div
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 border-2 overflow-hidden bg-slate-900 shadow-md`}
        style={{
          borderColor: chameleon.hex,
          boxShadow: `0 0 14px ${chameleon.hex}60`,
        }}
        title={`${name} (${chameleon.namePl})`}
      >
        {/* Soft background tint */}
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundColor: chameleon.hex }}
        />

        {/* Chameleon Icon */}
        <ChameleonIcon color={chameleon.hex} size={iconSizes} className="relative z-10" />

        {/* Small letter overlay if available */}
        {initial && size !== 'sm' && (
          <span
            className="absolute bottom-0 right-1 text-[10px] font-black tracking-wider opacity-85 z-20"
            style={{ color: chameleon.hex }}
          >
            {initial}
          </span>
        )}
      </div>

      {/* Online presence dot */}
      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-900 ${
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
          } ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
          title={isOnline ? 'Aktywny w zespole' : 'Niedostępny'}
        />
      )}
    </div>
  );
};
