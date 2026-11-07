import React from 'react';
import { Role } from '@/types/auth';
import { Crown, User } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className = '',
}) => {
  const isLeader = role === 'leader';

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;

  if (isLeader) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)] ${sizeClasses} ${className}`}
      >
        <Crown size={iconSize} className="text-amber-400 fill-amber-400/30" />
        Lider
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses} ${className}`}
    >
      <User size={iconSize} className="text-slate-400" />
      Członek
    </span>
  );
};
