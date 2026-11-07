'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScenarioSelector } from '@/components/decisions/ScenarioSelector';
import { DecisionGameSolo } from '@/components/decisions/DecisionGameSolo';
import { DecisionGameTeam } from '@/components/decisions/DecisionGameTeam';
import { DecisionSummaryScreen } from '@/components/decisions/DecisionSummaryScreen';
import { getScenario } from '@/lib/decisions/scenarios';
import { getDefaultTeamRanking, getMockSoloSubmissions } from '@/lib/decisions/mockSubmissions';
import { useDemoStore } from '@/lib/demo-store';
import {
  ArrowLeft,
  Compass,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

function Stage2Content() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view');
  const scenarioParam = searchParams.get('scenario');
  const initialScenario: 'lost_at_sea' | 'moon' =
    scenarioParam === 'moon' ? 'moon' : 'lost_at_sea';

  const { activeUserId, members } = useDemoStore();

  // Active scenario: 'lost_at_sea' | 'moon'
  const [selectedScenarioId, setSelectedScenarioId] = useState<'lost_at_sea' | 'moon'>(initialScenario);

  // Step state: 'selection' | 'solo' | 'team' | 'summary'
  const [currentStep, setCurrentStep] = useState<'selection' | 'solo' | 'team' | 'summary'>(
    initialView === 'summary' ? 'summary' : 'selection'
  );

  // User solo ranking
  const [userSoloRanking, setUserSoloRanking] = useState<string[]>(() => {
    return getScenario(initialScenario).items.map((i) => i.id);
  });

  // Team rankings
  const [teamRanking, setTeamRanking] = useState<string[]>(() => {
    return getDefaultTeamRanking(initialScenario);
  });

  // Solo submissions dictionary for team members (for controversy & leaderboard)
  const [allSoloSubmissions, setAllSoloSubmissions] = useState<Record<string, string[]>>({});

  const scenario = getScenario(selectedScenarioId);

  // Handle Scenario Confirmation
  const handleConfirmScenario = () => {
    const initialItems = scenario.items.map((i) => i.id);
    setUserSoloRanking(initialItems);
    setTeamRanking(getDefaultTeamRanking(selectedScenarioId));
    setCurrentStep('solo');
  };

  // Handle Solo Phase Completion
  const handleCompleteSolo = (
    ranking: string[],
    allSubmissions?: Record<string, string[]>
  ) => {
    setUserSoloRanking(ranking);
    setAllSoloSubmissions((prev) => {
      const merged: Record<string, string[]> = {
        ...prev,
        ...allSubmissions,
        [activeUserId]: ranking,
      };

      // Guarantee every member in the organization has a valid 15-item ranking
      const mockSubs = getMockSoloSubmissions(selectedScenarioId, activeUserId, ranking);
      members.forEach((m) => {
        if (!merged[m.id] || merged[m.id].length !== 15) {
          merged[m.id] = mockSubs[m.id] || [...ranking];
        }
      });

      return merged;
    });
  };

  // Handle Transition to Team Phase
  const handleProceedToTeam = () => {
    setCurrentStep('team');
  };

  // Handle Team Phase Completion (100% consensus reached)
  const handleProceedToSummary = (finalTeamRanking: string[]) => {
    setTeamRanking(finalTeamRanking);
    setCurrentStep('summary');
  };

  // Play again / Reset
  const handlePlayAgain = () => {
    setCurrentStep('selection');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/path"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors p-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft size={16} />
          <span>Powrót do Ścieżki Rozwoju</span>
        </Link>

        {/* Stepper Progress Pill */}
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentStep('selection')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              currentStep === 'selection'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Wybór Scenariusza
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setCurrentStep('solo')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              currentStep === 'solo'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Faza Solo
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setCurrentStep('team')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              currentStep === 'team'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Faza Zespołowa
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setCurrentStep('summary')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              currentStep === 'summary'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Raport i Synergia
          </button>
        </div>
      </div>

      {/* Main Step Render */}
      {currentStep === 'selection' && (
        <ScenarioSelector
          selectedScenario={selectedScenarioId}
          onSelectScenario={(id) => setSelectedScenarioId(id)}
          onConfirm={handleConfirmScenario}
        />
      )}

      {currentStep === 'solo' && (
        <DecisionGameSolo
          scenarioId={selectedScenarioId}
          onCompleteSolo={handleCompleteSolo}
          onProceedToPhase2={handleProceedToTeam}
        />
      )}

      {currentStep === 'team' && (
        <DecisionGameTeam
          scenarioId={selectedScenarioId}
          userSoloRanking={userSoloRanking}
          allSoloSubmissions={allSoloSubmissions}
          initialTeamRanking={teamRanking}
          onProceedToSummary={handleProceedToSummary}
        />
      )}

      {currentStep === 'summary' && (
        <DecisionSummaryScreen
          scenarioId={selectedScenarioId}
          teamRanking={teamRanking}
          userSoloRanking={userSoloRanking}
          allSoloSubmissions={allSoloSubmissions}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default function Stage2Page() {
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-center text-slate-400 text-sm">Ładowanie scenariusza...</div>}>
      <Stage2Content />
    </Suspense>
  );
}
