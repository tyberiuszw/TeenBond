'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Star,
  Award,
} from 'lucide-react';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { SURVEY_QUESTIONS, PeerEvaluationAnswer } from '@/types/evaluation';
import { validatePeerEvaluation } from '@/lib/relations/relationshipWeights';

interface EvaluationSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageNumber?: number;
  onSuccess?: () => void;
}

export function EvaluationSurveyModal({
  isOpen,
  onClose,
  stageNumber = 2,
  onSuccess,
}: EvaluationSurveyModalProps) {
  const router = useRouter();
  const {
    members,
    activeUserId,
    getActiveUser,
    submitEvaluationAnswer,
    autoCompleteDemoSurveys,
    surveyProgress,
  } = useDemoStore();

  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';
  const otherMembers = members.filter((m) => m.id !== activeUserId);

  // Wizard step: 0: Q1, 1: Q2, 2: Q3, 3: Q4, 4: Leader/Team evaluation, 5: Celebration/Waiting
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Answers state
  const [q1Collab, setQ1Collab] = useState<string | null>(null);
  const [q2Listening, setQ2Listening] = useState<string | null>(null);
  const [q3Goal, setQ3Goal] = useState<string | null>(null);
  const [q4Chaos, setQ4Chaos] = useState<string | null>(null);

  // Member rating leader (scale 1-5)
  const [leaderSpace, setLeaderSpace] = useState<number | null>(4);
  const [leaderAtmosphere, setLeaderAtmosphere] = useState<number | null>(5);

  // Leader rating members (scale 1-5 each)
  const [memberRatings, setMemberRatings] = useState<
    Record<string, { engagement: number; openness: number }>
  >(() => {
    const initial: Record<string, { engagement: number; openness: number }> = {};
    otherMembers.forEach((m) => {
      initial[m.id] = { engagement: 5, openness: 5 };
    });
    return initial;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active question for steps 0..3
  const currentQuestion = currentStep < 4 ? SURVEY_QUESTIONS[currentStep] : null;

  const getSelectedIdForStep = (step: number) => {
    switch (step) {
      case 0: return q1Collab;
      case 1: return q2Listening;
      case 2: return q3Goal;
      case 3: return q4Chaos;
      default: return null;
    }
  };

  const setSelectedIdForStep = (step: number, id: string) => {
    setValidationError(null);
    switch (step) {
      case 0: setQ1Collab(id); break;
      case 1: setQ2Listening(id); break;
      case 2: setQ3Goal(id); break;
      case 3: setQ4Chaos(id); break;
    }
  };

  const handleNext = () => {
    setValidationError(null);

    // Validation for steps 0..3
    if (currentStep < 4) {
      const selected = getSelectedIdForStep(currentStep);
      if (!selected) {
        setValidationError('Proszę wybrać jednego ze współgraczy, aby przejść dalej.');
        return;
      }
      if (selected === activeUserId) {
        setValidationError('Wybór samego siebie jest zablokowany.');
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Validation for step 4 (Leader / Member evaluation)
    if (currentStep === 4) {
      if (!isLeader) {
        if (!leaderSpace || !leaderAtmosphere) {
          setValidationError('Proszę ocenić oba wymiary pracy Lidera.');
          return;
        }
      }

      // Submit user evaluation
      const peerAnswer: PeerEvaluationAnswer = {
        evaluatorId: activeUserId,
        bestCollabUserId: q1Collab!,
        activeListenerUserId: q2Listening!,
        goalOrganizerUserId: q3Goal!,
        chaosUserId: q4Chaos!,
      };

      const val = validatePeerEvaluation(peerAnswer);
      if (!val.valid) {
        setValidationError(val.error || 'Błąd walidacji ankiety.');
        return;
      }

      submitEvaluationAnswer({
        stageNumber,
        evaluatorId: activeUserId,
        peerEvaluation: peerAnswer,
        leaderRating: !isLeader
          ? { speechSpace: leaderSpace!, atmosphere: leaderAtmosphere! }
          : undefined,
        memberRatings: isLeader ? memberRatings : undefined,
      });

      setCurrentStep(5);
    }
  };

  const handleSimulateRestOfTeam = () => {
    autoCompleteDemoSurveys(stageNumber);
    if (onSuccess) onSuccess();
  };

  const handleGoToRelations = () => {
    onClose();
    router.push('/relations');
  };

  const completedCount = surveyProgress?.[stageNumber]?.length || 1;
  const totalCount = members.length;
  const isAllCompleted = completedCount >= totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Etap {stageNumber}: Ewaluacja Poetapowa
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  Zero wpisywania tekstu
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Ankieta Wzajemna i Wpływ na Drzewko Relacji
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Dots (only during steps 0..4) */}
        {currentStep < 5 && (
          <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Krok {currentStep + 1} z 5:{' '}
              <strong className="text-white">
                {currentStep < 4 ? currentQuestion?.title : isLeader ? 'Ocena Zespołu' : 'Ocena Lidera'}
              </strong>
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((stepIdx) => (
                <div
                  key={stepIdx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    stepIdx === currentStep
                      ? 'bg-purple-400 scale-125 shadow-[0_0_8px_#C084FC]'
                      : stepIdx < currentStep
                      ? 'bg-emerald-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-shake">
              {validationError}
            </div>
          )}

          {/* Steps 0..3: Peer Nominations (Q1..Q4) */}
          {currentStep < 4 && currentQuestion && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Question Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pytanie {currentStep + 1} z 4
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${currentQuestion.badgeColor}`}
                  >
                    Waga: {currentQuestion.badgeText}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {currentQuestion.question}
                </h3>
                <p className="text-xs text-slate-400">{currentQuestion.description}</p>
              </div>

              {/* Clickable Member Tiles (100% Tile-Click, Zero text fields) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Wybierz dokładnie jednego uczestnika:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map((member) => {
                    const isSelf = member.id === activeUserId;
                    const isSelected = getSelectedIdForStep(currentStep) === member.id;

                    if (isSelf) {
                      return (
                        <div
                          key={member.id}
                          className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 opacity-50 flex items-center justify-between cursor-not-allowed select-none"
                        >
                          <div className="flex items-center gap-3">
                            <ChameleonAvatar
                              color={member.chameleonColor}
                              name={member.name}
                              size="sm"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-400">{member.name}</p>
                              <span className="text-[10px] text-slate-500">
                                (To Ty — wybór zablokowany)
                              </span>
                            </div>
                          </div>
                          <Lock size={15} className="text-slate-600" />
                        </div>
                      );
                    }

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedIdForStep(currentStep, member.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] scale-[1.02]'
                            : 'bg-slate-950 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ChameleonAvatar
                            color={member.chameleonColor}
                            name={member.name}
                            size="md"
                          />
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white">
                              {member.name}
                            </p>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {member.role === 'leader' ? 'Lider Zespołu' : 'Członek Zespołu'}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-purple-500 border-purple-400 text-slate-950'
                              : 'border-slate-700 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Leader or Team Rating */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {!isLeader ? (
                /* Member evaluating Leader (scale 1-5) */
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Ocena Postępowania Lidera (Skala 1–5)
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      Twoje odpowiedzi są całkowicie poufne i służą do facylitacji stylu przywództwa.
                    </p>
                  </div>

                  {/* Criterion L1 */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">
                      1. Przestrzeń do wypowiedzi:
                    </span>
                    <p className="text-xs text-slate-400">
                      „Lider dawał wszystkim przestrzeń do swobodnej wypowiedzi i uważnie słuchał naszych pomysłów.”
                    </p>
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setLeaderSpace(score)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            leaderSpace === score
                              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {score} {score === 5 ? '★' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Criterion L2 */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">
                      2. Atmosfera i motywacja w zespole:
                    </span>
                    <p className="text-xs text-slate-400">
                      „Lider pomagał utrzymać dobrą, bezpieczną i motywującą atmosferę w zespole.”
                    </p>
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setLeaderAtmosphere(score)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            leaderAtmosphere === score
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {score} {score === 5 ? '★' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Leader evaluating Team Members (scale 1-5) */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Ocena Zaangażowania i Otwartości Graczy (Panel Lidera)
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      Oceń każdego członka zespołu w dwóch wymiarach (skala 1–5). Wyniki te wzbogacą
                      prywatne tooltipy diagnostyczne w Drzewku Relacji.
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                    {otherMembers.map((m) => {
                      const current = memberRatings[m.id] || { engagement: 5, openness: 5 };

                      return (
                        <div
                          key={m.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <ChameleonAvatar color={m.chameleonColor} name={m.name} size="sm" />
                            <h4 className="text-xs font-bold text-white">{m.name}</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Engagement */}
                            <div className="space-y-1.5">
                              <span className="text-slate-400 font-medium block">
                                Zaangażowanie: <strong>{current.engagement}/5</strong>
                              </span>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() =>
                                      setMemberRatings((prev) => ({
                                        ...prev,
                                        [m.id]: { ...current, engagement: val },
                                      }))
                                    }
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      current.engagement === val
                                        ? 'bg-purple-500 border-purple-400 text-slate-950'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Openness */}
                            <div className="space-y-1.5">
                              <span className="text-slate-400 font-medium block">
                                Otwartość: <strong>{current.openness}/5</strong>
                              </span>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() =>
                                      setMemberRatings((prev) => ({
                                        ...prev,
                                        [m.id]: { ...current, openness: val },
                                      }))
                                    }
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      current.openness === val
                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Team Progress & Instant Simulation (Tryb Demo) */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Twoja ankieta została zapisana!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Gdy wszyscy członkowie zespołu zakończą wypełnianie ankiet, matematyczny graf
                  Drzewka Relacji zostanie automatycznie zaktualizowany.
                </p>
              </div>

              {/* Progress Bar & Members status */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 max-w-md mx-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Postęp Zespołu:</span>
                  <span className="font-bold text-emerald-400">
                    {completedCount} / {totalCount} graczy ({Math.round((completedCount / totalCount) * 100)}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  {members.map((m) => {
                    const isSubmitted =
                      surveyProgress?.[stageNumber]?.includes(m.id) || m.id === activeUserId;
                    return (
                      <div key={m.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <ChameleonAvatar color={m.chameleonColor} name={m.name} size="sm" />
                          <span className="text-slate-300 font-medium">{m.name}</span>
                        </div>
                        {isSubmitted ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 size={13} /> Oddano
                          </span>
                        ) : (
                          <span className="text-amber-400/80 font-medium text-[11px] animate-pulse">
                            ⏳ Wypełnia...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instant Simulation Button in Demo Mode */}
              {!isAllCompleted && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 max-w-md mx-auto text-center space-y-2">
                  <button
                    onClick={handleSimulateRestOfTeam}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs shadow-lg transition-all transform hover:scale-[1.01]"
                  >
                    <Zap size={16} />
                    <span>⚡ Zasymuluj głosy pozostałych graczy (Tryb Demo)</span>
                  </button>
                  <p className="text-[10px] text-purple-300">
                    Błyskawicznie uzupełnia ankiety Alfa i wyzwala natychmiastowe przeliczenie Drzewka!
                  </p>
                </div>
              )}

              {/* Action button to view Relationship Tree */}
              <button
                onClick={handleGoToRelations}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-400 hover:to-purple-400 text-slate-950 font-black text-sm shadow-xl transition-all"
              >
                <span>Przejdź do Drzewka Relacji</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (steps 0..4) */}
        {currentStep < 5 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentStep === 0
                  ? 'opacity-40 text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowLeft size={16} />
              <span>Wstecz</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all transform hover:scale-105"
            >
              <span>{currentStep === 4 ? 'Zatwierdź i Wyślij Ankietę' : 'Dalej'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
