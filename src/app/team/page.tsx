'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { MOTIVATOR_CARDS } from '@/lib/constants';
import { TeamMotivatorsMatrix } from '@/components/motivators/TeamMotivatorsMatrix';
import {
  Users,
  Copy,
  Check,
  Award,
  Sparkles,
  Flame,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  UserPlus,
  X,
} from 'lucide-react';

export default function TeamPage() {
  const {
    organization,
    members,
    motivators,
    activeUserId,
    switchActiveUser,
    getActiveUser,
    pendingJoinRequests,
    resolveJoinRequest,
  } = useDemoStore();
  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';
  const pendingList = (pendingJoinRequests || []).filter((r) => r.status === 'pending');

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (organization.inviteCode) {
      navigator.clipboard.writeText(organization.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Calculate team top motivators
  const topMotivatorsSummary = [
    { code: 'RELATEDNESS', namePl: 'Relacje', count: 3, color: '#10B981' },
    { code: 'MASTERY', namePl: 'Mistrzostwo', count: 3, color: '#F59E0B' },
    { code: 'GOAL', namePl: 'Cel', count: 2, color: '#84CC16' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Team Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Users size={14} className="text-blue-400" />
            <span>Panel Zespołu i Profile Graczy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {organization.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            5 aktywnych uczestników • Średnie zaangażowanie: 96% • Etapy ukończone: 2 / 6
          </p>
        </div>

        {/* Invite Code Badge for Leader */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-end">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Kod zaproszenia (Prywatny)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">
              {organization.inviteCode || 'ALFA-2026'}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Skopiuj kod zaproszenia"
            >
              {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Pending Join Requests (Leader Approval for Public Organizations - F04) */}
      {isLeader && pendingList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Oczekujące Prośby o Dołączenie ({pendingList.length})
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
              Wymagana akceptacja Lidera
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <ChameleonAvatar color={req.chameleonColor} name={req.name} size="md" />
                  <div>
                    <p className="text-sm font-bold text-white">{req.name}</p>
                    <p className="text-xs text-slate-400">{req.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveJoinRequest(req.id, 'active')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all"
                  >
                    <Check size={14} />
                    <span>Akceptuj</span>
                  </button>
                  <button
                    onClick={() => resolveJoinRequest(req.id, 'rejected')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all"
                  >
                    <X size={14} />
                    <span>Odrzuć</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Roster Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            <span>Skład Zespołu (5 Graczy)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Kliknij na kafel, aby przełączyć perspektywę w Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => {
            const isCurrentActive = member.id === activeUserId;
            const memberRanking = motivators[member.id] || [];

            return (
              <div
                key={member.id}
                onClick={() => switchActiveUser(member.id)}
                className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isCurrentActive
                    ? 'bg-slate-900 border-2 shadow-2xl scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
                style={{
                  borderColor: isCurrentActive ? member.chameleonColor : undefined,
                  boxShadow: isCurrentActive ? `0 0 25px ${member.chameleonColor}30` : undefined,
                }}
              >
                {/* Active Indicator Pin */}
                {isCurrentActive && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider text-slate-950"
                    style={{ backgroundColor: member.chameleonColor }}
                  >
                    Aktywna Perspektywa
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top user row */}
                  <div className="flex items-center gap-3.5">
                    <ChameleonAvatar
                      color={member.chameleonColor}
                      name={member.name}
                      size="lg"
                      showOnlineStatus
                      isOnline
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
                        <RoleBadge role={member.role} size="sm" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-400 truncate">
                        {member.personaTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{member.description}"
                  </p>

                  {/* Highlights / Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.isSilentExpert && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Lightbulb size={11} /> Cichy Ekspert (Lost at Sea: 22 pkt)
                      </span>
                    )}
                    {member.isActiveListener && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        <HeartHandshake size={11} /> Spoiwo Zespołu (Słuchanie: 4 głosy)
                      </span>
                    )}
                    {member.role === 'leader' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck size={11} /> Filar Zaufania Grupy
                      </span>
                    )}
                  </div>

                  {/* TOP 3 Motivators preview */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Główne Motywatory (TOP 3):
                    </span>
                    <div className="flex gap-1.5">
                      {memberRanking.slice(0, 3).map((code, idx) => {
                        const card = MOTIVATOR_CARDS.find((c) => c.code === code);
                        return (
                          <span
                            key={code}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 truncate"
                            title={card?.definitionPl}
                          >
                            {idx + 1}. {card?.namePl || code}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer XP */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Award size={14} />
                    {member.xp} XP
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isCurrentActive ? 'Wybrany' : 'Kliknij, by przełączyć'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Team Motivators Matrix (CHAMPFROGS 10x5 Heatmap & Leader Insights) */}
      <div className="pt-4">
        <TeamMotivatorsMatrix />
      </div>
    </div>
  );
}
