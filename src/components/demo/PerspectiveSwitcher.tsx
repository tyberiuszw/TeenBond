'use client';

import React from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '../brand/ChameleonAvatar';
import { RoleBadge } from '../ui/RoleBadge';
import { RefreshCw, Users } from 'lucide-react';

interface PerspectiveSwitcherProps {
  className?: string;
}

export const PerspectiveSwitcher: React.FC<PerspectiveSwitcherProps> = ({
  className = '',
}) => {
  const { members, activeUserId, switchActiveUser, resetToInitial } = useDemoStore();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mr-1">
        <Users size={14} className="text-emerald-400" />
        <span className="hidden sm:inline">Perspektywa:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
        {members.map((member) => {
          const isActive = member.id === activeUserId;

          return (
            <button
              key={member.id}
              onClick={() => switchActiveUser(member.id)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-md border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              style={{
                borderColor: isActive ? member.chameleonColor : 'transparent',
                boxShadow: isActive ? `0 0 12px ${member.chameleonColor}40` : undefined,
              }}
              title={`${member.name} (${member.personaTitle}) - ${member.role === 'leader' ? 'Lider' : 'Członek'}`}
            >
              <ChameleonAvatar
                color={member.chameleonColor}
                name={member.name}
                size="sm"
              />
              <span className="font-medium text-slate-100">{member.name}</span>
              <RoleBadge role={member.role} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Reset button */}
      <button
        onClick={() => resetToInitial()}
        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        title="Resetuj dane demonstracyjne Zespołu Alfa"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
};
