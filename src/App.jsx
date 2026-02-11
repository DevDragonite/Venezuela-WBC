import React, { useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { PLAYER_MAP } from './components/PlayerPool';
import BaseballField from './components/BaseballField';
import LegalModal from './components/LegalModal';
import SchedulePanel from './components/SchedulePanel';
import PlayerSelectorModal from './components/PlayerSelectorModal';

function App() {
  const [showModal, setShowModal] = useState(true);
  const [lineupModalPosition, setLineupModalPosition] = useState(null);
  const field = useGameStore((s) => s.field);

  return (
    <div className="min-h-screen bg-[#1a0509] text-white font-sans selection:bg-gold-base selection:text-vinotinto-dark">
      {/* Modal de protección legal */}
      {showModal && <LegalModal onClose={() => setShowModal(false)} />}

      {/* Header Premium */}
      <header className="p-8 text-center border-b border-[#D4AF37]/20 bg-black/30 backdrop-blur-md">
        <h1 className="text-5xl md:text-7xl font-black text-[#D4AF37] tracking-tighter uppercase italic drop-shadow-2xl">
          VENEZUELA <span className="text-white">WBC 2026</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mt-4">
          <span className="h-[1px] w-12 bg-[#D4AF37]/50"></span>
          <p className="text-[#D4AF37]/80 text-xs md:text-sm tracking-[0.4em] uppercase font-bold">
            Simulador de Estrategia • Roster Oficial
          </p>
          <span className="h-[1px] w-12 bg-[#D4AF37]/50"></span>
        </div>
      </header>

      {/* Grid Principal */}
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Lado Izquierdo: Campo y Selección de Jugadores */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-gradient-to-br from-black/60 to-transparent rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B1021]/10 blur-[120px] -z-10"></div>
            <BaseballField />
          </section>

          <section>
            <SchedulePanel />
          </section>
        </div>

        {/* Lado Derecho: Lineup (Estilo Tarjeta de Scoreboard) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl sticky top-8">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-black italic text-white leading-none">LINEUP</h2>
                <p className="text-[10px] text-[#D4AF37] font-bold mt-1 tracking-widest">ORDEN AL BATE</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#6B1021] text-white px-2 py-1 rounded font-bold uppercase">Edición 2026</span>
              </div>
            </div>

            <div className="space-y-3">
              {['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'].map((pos, i) => {
                const playerId = field[pos];
                const player = playerId ? PLAYER_MAP[playerId] : null;

                return (
                  <div
                    key={pos}
                    onClick={() => setLineupModalPosition(pos)}
                    className="group flex items-center gap-5 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <span className="text-[#D4AF37] font-black text-3xl italic opacity-30 group-hover:opacity-100 transition-opacity w-10">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      {player ? (
                        <>
                          <div className="text-[10px] text-[#D4AF37]/70 font-mono mb-1">{player.position}</div>
                          <div className="text-white font-bold text-sm">{player.name}</div>
                        </>
                      ) : (
                        <>
                          <div className="h-1.5 w-16 bg-[#D4AF37]/20 rounded-full mb-2"></div>
                          <div className="h-4 w-44 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
                        </>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50">
                      <span className="text-[10px] text-white/60 font-bold group-hover:text-[#D4AF37]">{pos}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <PlayerSelectorModal position={lineupModalPosition} onClose={() => setLineupModalPosition(null)} />

            <button className="w-full mt-10 py-5 bg-[#D4AF37] hover:bg-white text-[#1a0509] font-black rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest shadow-xl shadow-[#D4AF37]/10">
              Confirmar Roster
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;