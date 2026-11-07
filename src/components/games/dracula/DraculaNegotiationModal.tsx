'use client';

import React, { useState } from 'react';
import {
  DraculaFactItem,
  DraculaTeam,
  DraculaNegotiationMessage,
} from '@/types/game';
import {
  MessageSquare,
  ShieldAlert,
  ArrowRightLeft,
  Send,
  X,
  Lock,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface DraculaNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentTeam: DraculaTeam;
  isNegotiator?: boolean;
  onAppointSelf?: () => void;
  myFacts: DraculaFactItem[];
  peerFacts: DraculaFactItem[];
  onSubmitVerdict: (day: string, time: string, isSynergy: boolean) => void;
}

export const DraculaNegotiationModal: React.FC<DraculaNegotiationModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentTeam,
  isNegotiator = true,
  onAppointSelf,
  myFacts,
  peerFacts,
  onSubmitVerdict,
}) => {
  const [messages, setMessages] = useState<DraculaNegotiationMessage[]>([
    {
      id: 'm-1',
      senderId: 'bot-peer',
      senderTeam: currentTeam === 'red_bats' ? 'black_cats' : 'red_bats',
      senderName: currentTeam === 'red_bats' ? 'Negocjator Kotów (Zosia)' : 'Negocjator Nietoperzy (Kuba)',
      content:
        'Cześć! Zamiast rywalizować i tracić 24 godziny, możemy podzielić zadania. Wiemy, że sklep na lotnisku jest zamknięty w Pn i Wt, ale wy możecie polecieć we wtorek i zdobyć klucz w kościele w piątek rano!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [submittedDay, setSubmittedDay] = useState('Sobota');
  const [submittedTime, setSubmittedTime] = useState('9:00');
  const [isSynergyChecked, setIsSynergyChecked] = useState(true);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: DraculaNegotiationMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderTeam: currentTeam,
      senderName: 'Twój Negocjator',
      content: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Simulated responsive peer emissary
    setTimeout(() => {
      const peerMsg: DraculaNegotiationMessage = {
        id: `msg-peer-${Date.now()}`,
        senderId: 'bot-peer',
        senderTeam: currentTeam === 'red_bats' ? 'black_cats' : 'red_bats',
        senderName: currentTeam === 'red_bats' ? 'Negocjator Kotów (Zosia)' : 'Negocjator Nietoperzy (Kuba)',
        content:
          'Zgadzamy się na wspólny plan synergiczny! Spotkajmy się w piątek o 18:00 na stacji Novahuny i wyruszmy w nocny marsz, by zaatakować Drakulę w sobotę o świcie o 9:00 rano!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, peerMsg]);
    }, 1200);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVerdict(submittedDay, submittedTime, isSynergyChecked);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950/60 via-slate-900 to-rose-950/40 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Lock size={13} className="text-purple-400" />
              <span>Prywatna Strefa Negocjacji 1-na-1 (Ściśle Poufne)</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Negocjacje Emisariuszy: Czerwone Nietoperze & Czarne Koty
            </h3>
            <p className="text-xs text-slate-300">
              W tym pokoju przebywają wyłącznie oficjalni negocjatorzy obu drużyn. Wymieńcie się poszlakami i zdecydujcie o strategii.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Non-negotiator access notice */}
        {!isNegotiator && (
          <div className="px-6 py-3 bg-amber-950/50 border-b border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <ShieldAlert size={16} className="text-amber-400 shrink-0" />
              <span>
                Tylko wyznaczony <strong>Negocjator podgrupy</strong> ma uprawnienia do pisania w czacie 1-na-1 i składania wiążących deklaracji.
              </span>
            </div>
            {onAppointSelf && (
              <button
                onClick={onAppointSelf}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition-colors"
              >
                Zostań Negocjatorem Podgrupy
              </button>
            )}
          </div>
        )}

        {/* Content Columns: Chat on left, Final Accord on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 flex-1">
          {/* Chat Feed */}
          <div className="p-4 flex flex-col h-96">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-emerald-400" />
              <span>Szyfrowany Czat Negocjacyjny</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-slate-950/60 rounded-2xl border border-slate-800 scrollbar-thin">
              {messages.map((m) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-0.5">
                      <span>{m.senderName}</span>
                      <span>• {m.timestamp}</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed font-sans ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Napisz propozycję do drugiego negocjatora..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500 font-sans"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Submission Panel */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span>Ostateczne Zgłoszenie Terminu</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Podajcie najwcześniejszy możliwy dzień tygodnia i godzinę zabicia Drakuli w grobowcu (podczas światła słonecznego).
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Dzień tygodnia:
                  </label>
                  <select
                    value={submittedDay}
                    onChange={(e) => setSubmittedDay(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500"
                  >
                    <option value="Sobota">Sobota (Wariant Synergii Win-Win)</option>
                    <option value="Niedziela">Niedziela (Wariant Rywalizacji)</option>
                    <option value="Piątek">Piątek (Niemożliwy logistycznie)</option>
                    <option value="Czwartek">Czwartek (Niemożliwy logistycznie)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Godzina zabicia:
                  </label>
                  <input
                    type="text"
                    value={submittedTime}
                    onChange={(e) => setSubmittedTime(e.target.value)}
                    placeholder="np. 9:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-purple-200">
                    <input
                      type="checkbox"
                      checked={isSynergyChecked}
                      onChange={(e) => setIsSynergyChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span>Składamy wniosek kooperacyjny wspólnie z drugim zespołem</span>
                  </label>
                  <p className="text-[11px] text-purple-300/80 leading-tight pl-6">
                    Wspólne działanie oszczędza 24 godziny i odblokowuje <strong>200 punktów</strong> oraz odznakę <em>Mistrzowie Synergii</em>!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl transition-all"
            >
              Potwierdź i Rozstrzygnij Misję Dracula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
