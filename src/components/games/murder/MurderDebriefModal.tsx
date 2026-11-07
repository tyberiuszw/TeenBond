'use client';

import React from 'react';
import Link from 'next/link';
import { MurderScenarioId } from '@/types/game';
import { Trophy, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react';

interface MurderDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: MurderScenarioId;
  score: number;
  onOpenSurvey?: () => void;
}

export const MurderDebriefModal: React.FC<MurderDebriefModalProps> = ({
  isOpen,
  onClose,
  scenarioId,
  score,
  onOpenSurvey,
}) => {
  if (!isOpen) return null;

  const isMovie = scenarioId === 'movie';

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Trophy size={14} className="text-emerald-400" />
              <span>Zbrodnia Rozwikłana! (+{score} XP)</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {isMovie
                ? 'Sprawca: The Co-Star (Trucizna w drinku Reżysera)'
                : 'Sprawca: Bob Hartley (Zabytkowy Miecz ze ściany)'}
            </h3>
            <p className="text-xs text-slate-300">
              Gratulacje dla całego zespołu za 100% jednomyślność i bezbłędną dedukcję!
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Narrative reconstruction */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {isMovie ? (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                Rekonstrukcja zbrodni na planie filmowym:
              </h4>
              <p>
                <strong>The Co-Star (Współgwiazda)</strong> przez lata żył w cieniu głównej gwiazdy. Pominięcie go przy obsadzie tytułowej roli doprowadziło go do furii. Podczas bankietu podał Reżyserowi drinka z zabójczą <strong>trucizną</strong> (zgodnie z Listem Śmiertelnym Reżysera: <em>„I was poisoned!”</em>).
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white text-xs">Dlaczego inni byli niewinni?</span>
                <p className="text-xs text-slate-400">
                  • <strong>Scenarzysta</strong> hoduje kota (poszlaka #1 wyklucza właścicieli kotów).
                  <br />
                  • <strong>Gaffer</strong> hoduje pająka, a <strong>Operator Kamery</strong> węża (poszlaki #2 i #3).
                  <br />
                  • <strong>Główna Gwiazda</strong> ma żonę (poszlaka #16 wyklucza żonatych) i siedział kiedyś w areszcie (#13).
                  <br />• Wyłącznie Współgwiazda spełnia wszystkie kryteria eliminacyjne (jest jedynakiem, jeździ drogim autem, nie lubi robić zdjęć, nie ma zwierząt)!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                Rekonstrukcja zabójstwa w rezydencji TechStream:
              </h4>
              <p>
                <strong>Bob Hartley (CEO)</strong> nie mógł pogodzić się z decyzją Jamesa Mulligana o przekazaniu zysków firmy na cele charytatywne. Podczas pokazu fajerwerków o 20:05 wymknął się z balkonu przez sypialnię i wszedł przez <strong>sekretne drzwi</strong> do gabinetu Jamesa. Chwycił zabytkowy miecz ze ściany i ugodził Jamesa w serce, kradnąc podpisany kontrakt!
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white text-xs">Wyjaśnienie fałszywych tropów:</span>
                <p className="text-xs text-slate-400">
                  • <strong>Rozlane wino vs Krew:</strong> Plamy krwi biegły od zachodniej ściany sypialni ku balkonowi – Bob uciekał z zakrwawionym mieczem!
                  <br />
                  • <strong>Alibi Karen i Davida:</strong> Byli w centrum uwagi na balkonie (Susan płakała o 20:14). Tylko Bob stał sam w cieniu bez alibi.
                  <br />• <strong>Niebieski skrawek:</strong> Bob nosił niebieski strój tamtego wieczoru i tylko on wiedział o ukrytych drzwiach!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Zamknij
          </button>

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
