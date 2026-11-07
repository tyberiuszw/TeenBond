'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { calculateZinWorkdays, getZinDailySchedule } from '@/lib/zin/validator';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ZinSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSurvey?: () => void;
}

export const ZinSolutionModal: React.FC<ZinSolutionModalProps> = ({
  isOpen,
  onClose,
  onOpenSurvey,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const proof = calculateZinWorkdays();
  const schedule = getZinDailySchedule();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Trophy size={14} className="text-emerald-400" />
              <span>Gratulacje! Zadanie Rozwiązane Poprawnie (+150 XP)</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Dzień Ukończenia Obelisku: Neptiminus
            </h3>
            <p className="text-xs text-slate-300">
              Oto pełny, 5-etapowy model matematyczny i harmonogram budowy w Atlantydzie.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5-Step Stepper Tabs */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 border-b border-slate-800 text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 1, label: '1. Kubatura' },
            { id: 2, label: '2. Czas Pracy' },
            { id: 3, label: '3. Robotnicy' },
            { id: 4, label: '4. Wydajność' },
            { id: 5, label: '5. Kalendarz' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeStep === s.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-4">
          {activeStep === 1 && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-emerald-400" />
                <span>Krok 1: Wymiary i Kubatura Zinu</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Poszlaki <strong>#3, #4, #5 oraz #7</strong> podają wymiary bryły:
                <br />
                • Długość = 50 stóp, Wysokość = 100 stóp, Szerokość = 10 stóp.
                <br />
                • Objętość bryły: 50 ft × 100 ft × 10 ft = <strong>50 000 stóp sześciennych</strong>.
                <br />• Ponieważ każdy kamienny blok ma objętość 1 stopy sześciennej, obelisk składa się dokładnie z <strong>50 000 bloków</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
                V = 50 × 100 × 10 = 50 000 bloków
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-cyan-400" />
                <span>Krok 2: Czysty Czas Pracy Robotnika</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Poszlaki <strong>#14, #15 i #16</strong> określają czas i przerwy:
                <br />
                • Dzień roboczy liczy 9 schlibów.
                <br />
                • Każdy robotnik ma w ciągu dnia przerwy łącznie wynoszące 16 ponków.
                <br />
                • W 1 schlibie mieści się 8 ponków, zatem przerwa wynosi: 16 ÷ 8 = <strong>2 schliby</strong>.
                <br />• Czysty czas pracy na robotnika na dzień: 9 - 2 = <strong>7 schlibów netto</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs">
                T_netto = 9 schlibs - (16 ponks / 8) = 7 schlibs efektywnej pracy / robotnik / dzień
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-amber-400" />
                <span>Krok 3: Liczebność Aktywnej Załogi</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Poszlaki <strong>#18, #19 i #31</strong> podają skład brygady:
                <br />
                • Przy budowie pracuje tylko 1 brygada (gang).
                <br />
                • W czasie prac na placu budowy przebywa 9 osób.
                <br />
                • 1 członek pełni obowiązki religijne i nie układa kamiennych bloków.
                <br />• Liczba aktywnych murarzy układających bloki: 9 - 1 = <strong>8 robotników</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs">
                Załoga = 9 ludzi - 1 kapłan = 8 aktywnych murarzy
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-purple-400" />
                <span>Krok 4: Dzienna Wydajność Zespołu i Dni Robocze</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Poszlaka <strong>#17</strong> podaje tempo układania:
                <br />
                • 1 robotnik układa 150 bloków na schlib.
                <br />
                • Dziennie 1 robotnik układa: 7 schlibów × 150 bloków = <strong>1 050 bloków</strong>.
                <br />
                • Cała 8-osobowa załoga układa dziennie: 8 × 1 050 = <strong>8 400 bloków / dzień</strong>.
                <br />• Łączny czas potrzebny: 50 000 ÷ 8 400 = <strong>5.952 dnia roboczego</strong>.
                <br />
                Oznacza to, że budowa zostaje ukończona w trakcie <strong>6. DNIA ROBOCZEGO</strong>!
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-400 font-mono text-xs">
                Wydajność dzienna = 8 × (7 × 150) = 8 400 bloków/dzień
                <br />
                Dni robocze = 50 000 / 8 400 = 5.952 (ukończenie w 6. dniu roboczym)
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-emerald-400" />
                <span>Krok 5: Kalendarz Atlantydy i Dzień Neptiminus</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Poszlaki <strong>#8, #9, #10, #11, #12, #13, #20 oraz #30</strong> opisują kalendarz:
                <br />
                • Tydzień ma 5 dni: 1. Aguaday, 2. Neptiminus, 3. Sharkday, 4. Mermaidday, 5. Daydoldrum.
                <br />
                • Praca startuje o świcie w <strong>Aguaday</strong> (Dzień 1).
                <br />• <strong>Daydoldrum</strong> to dzień wolny od pracy (0 bloków!).
              </p>

              {/* Table of daily progress */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-2">Dzień Tygodnia</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Bloki Dziś</th>
                      <th className="p-2">Łącznie Bloków</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {schedule.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.isCompletionDay
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : !row.isWorkday
                            ? 'bg-slate-950/40 text-slate-500 italic'
                            : ''
                        }
                      >
                        <td className="p-2 font-sans">
                          {row.week === 1 ? 'Tydzień 1' : 'Tydzień 2'}: {row.dayOfWeek}
                        </td>
                        <td className="p-2">
                          {row.isCompletionDay
                            ? '🎉 UKOŃCZENIE'
                            : !row.isWorkday
                            ? 'ŚWIĘTO (WOLNE)'
                            : `Dzień Roboczy ${row.workdayNumber}`}
                        </td>
                        <td className="p-2">{row.blocksLaidToday.toLocaleString()}</td>
                        <td className="p-2">{row.cumulativeBlocks.toLocaleString()} / 50 000</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep((s) => s - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Poprzedni krok
              </button>
            )}
            {activeStep < 5 && (
              <button
                onClick={() => setActiveStep((s) => s + 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Następny krok
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenSurvey && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSurvey();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition-all"
              >
                <Sparkles size={14} />
                <span>Ankieta Ewaluacyjna (Etap 3)</span>
              </button>
            )}

            <Link
              href="/relations"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              <span>Przejdź do Drzewka Relacji (Etap 3)</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
