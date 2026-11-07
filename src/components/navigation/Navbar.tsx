'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { ChameleonAvatar } from '../brand/ChameleonAvatar';
import { RoleBadge } from '../ui/RoleBadge';
import { useDemoStore } from '@/lib/demo-store';
import { useSessionStore } from '@/lib/session-store';
import {
  Compass,
  Users,
  Network,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { isDemoMode, getActiveUser, organization, disableDemoMode } = useDemoStore();
  const { session, logout } = useSessionStore();

  const activeUser = isDemoMode ? getActiveUser() : session;
  const activeRole = activeUser?.role || 'member';

  const navLinks = [
    {
      label: 'Ścieżka Budowania Relacji',
      shortLabel: 'Ścieżka',
      href: '/path',
      icon: Compass,
      description: 'Etapy 1-6 i postęp wyzwań',
    },
    {
      label: 'Zespół',
      shortLabel: 'Zespół',
      href: '/team',
      icon: Users,
      description: 'Profile, motywatory i punkty',
    },
    {
      label: 'Panel Lidera & Relacje',
      shortLabel: 'Relacje',
      href: '/relations',
      icon: Network,
      description: 'Drzewko relacji i synergia',
      isLeaderOnly: true,
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Org Badge */}
          <div className="flex items-center gap-4">
            <Logo variant="horizontal" size="md" />

            {organization && (
              <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Organizacja:</span>
                <span className="text-xs font-semibold text-slate-200 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                  {organization.name}
                </span>
              </div>
            )}
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>{link.label}</span>
                  {link.isLeaderOnly && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Lider
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Active Player Profile / Actions */}
          <div className="flex items-center gap-3">
            {activeUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-md"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-end gap-1.5">
                      <span>{activeUser.name}</span>
                      <RoleBadge role={activeRole} size="sm" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {isDemoMode ? 'Perspektywa Demo' : activeUser.email}
                    </div>
                  </div>

                  <ChameleonAvatar
                    color={activeUser.chameleonColor}
                    name={activeUser.name}
                    size="md"
                    showOnlineStatus
                    isOnline
                  />
                  <ChevronDown size={14} className="text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-800">
                      <ChameleonAvatar
                        color={activeUser.chameleonColor}
                        name={activeUser.name}
                        size="md"
                        showOnlineStatus
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-100 truncate">{activeUser.name}</p>
                        <p className="text-xs text-slate-400 truncate">{activeUser.email}</p>
                        <div className="mt-1">
                          <RoleBadge role={activeRole} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/team"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Users size={14} className="text-emerald-400" />
                        <span>Karta gracza i zespół</span>
                      </Link>

                      <Link
                        href="/relations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Network size={14} className="text-purple-400" />
                        <span>Drzewko relacji (Lider)</span>
                      </Link>

                      <div className="pt-2 mt-2 border-t border-slate-800">
                        {isDemoMode ? (
                          <button
                            onClick={() => {
                              disableDemoMode();
                              setUserDropdownOpen(false);
                              router.push('/login');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <LogOut size={14} />
                            <span>Zakończ Tryb Demo</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                              router.push('/login');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <LogOut size={14} />
                            <span>Wyloguj się</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  Logowanie
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                >
                  Dołącz
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  <div>
                    <div className="leading-tight">{link.label}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{link.description}</div>
                  </div>
                </div>
                {link.isLeaderOnly && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                    Lider
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
