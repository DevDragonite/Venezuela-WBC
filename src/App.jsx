import { useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { PLAYER_MAP } from './components/PlayerPool';
import BaseballField from './components/BaseballField';
import StartingRotation from './components/StartingRotation';
import LegalDisclaimer from './components/LegalDisclaimer';
import SchedulePanel from './components/SchedulePanel';
import LineupPanel from './components/LineupPanel';
import { toPng } from 'html-to-image';
import ManagerNameModal from './components/ManagerNameModal';
import ShareCard from './components/ShareCard';
import rosterData from './data/players.json';

function App() {
  const [showModal, setShowModal] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const initBench = useGameStore((s) => s.initBench);
  const setManagerFullName = useGameStore((s) => s.setManagerFullName);
  const managerFullName = useGameStore((s) => s.managerFullName);

  // Inicializar banca con todos los jugadores al cargar
  useEffect(() => {
    const allIds = [
      ...(rosterData?.lanzadores || []),
      ...(rosterData?.receptores || []),
      ...(rosterData?.infielders || []),
      ...(rosterData?.outfielders || []),
    ].map(p => p.personId);

    initBench(allIds);
  }, [initBench]);

  const triggerCapture = async (fullName) => {
    setManagerFullName(fullName);
    const area = document.getElementById('share-card-container');
    if (!area) return;

    setIsCapturing(true);
    // Timeout para asegurar que el DOM se actualice con el nombre y se renderice el ShareCard (que estará oculto en la UI principal)
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(area, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#1a0509',
          cacheBust: true,
          style: {
            visibility: 'visible',
            position: 'static'
          }
        });

        const link = document.createElement('a');
        link.download = `WBC_Venezuela_Mi_Lineup_${fullName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generando la imagen:', err);
      } finally {
        setIsCapturing(false);
        setShowManagerModal(false);
      }
    }, 500);
  };

  const handlePublishClick = () => {
    setShowManagerModal(true);
  };

  return (
    <div className="min-h-screen bg-[#1a0509] text-white font-sans selection:bg-gold-base selection:text-vinotinto-dark">
      {/* Modal de protección legal */}
      {showModal && <LegalDisclaimer onAccept={() => setShowModal(false)} />}

      {/* Header Premium */}
      <header className="p-4 md:p-8 text-center border-b border-[#D4AF37]/20 bg-black/30 backdrop-blur-md">
        <h1 className="text-4xl md:text-7xl font-black text-[#D4AF37] tracking-tighter uppercase italic drop-shadow-2xl">
          VENEZUELA <span className="text-white">WBC 2026</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mt-2 md:mt-4">
          <span className="hidden md:block h-[1px] w-12 bg-[#D4AF37]/50"></span>
          <p className="text-[#D4AF37]/80 text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold">
            CENTRO DE MANDO VINOTINTO • EL EQUIPO DE TODOS!
          </p>
          <span className="hidden md:block h-[1px] w-12 bg-[#D4AF37]/50"></span>
        </div>
      </header>

      {/* Grid Principal Granular: Mobile First Flex / Desktop Grid */}
      <main className="max-w-[1700px] mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col lg:grid lg:grid-cols-12 gap-x-10 gap-y-8 lg:gap-y-0 items-start">

        {/* 1. Campo (Diamante - Arriba en móvil) */}
        <div className="w-full lg:col-span-8 order-1 bg-gradient-to-br from-black/60 to-transparent rounded-[2rem] lg:rounded-b-none lg:rounded-t-[3rem] p-4 md:p-8 border border-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B1021]/10 blur-[120px] -z-10"></div>
          <BaseballField />
        </div>

        {/* 2. Lineup (Abajo del campo en móvil) */}
        <div className="w-full lg:col-span-4 order-2 flex flex-col h-full lg:row-span-1">
          <LineupPanel />
        </div>

        {/* 3. Header Rotación (Parte del bloque de rotación) */}
        <div className="w-full lg:col-span-8 order-3 bg-gradient-to-br from-black/60 to-transparent border-l border-r border-t lg:border-t-0 border-white px-6 md:px-8 rounded-t-[2rem] lg:rounded-none">
          <div className="flex items-center gap-4 py-6 border-t border-white/10 lg:border-t-0">
            <h3 className="text-[#D4AF37] font-black italic text-2xl uppercase tracking-tighter whitespace-nowrap">
              Rotación de Abridores
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent"></div>
          </div>
        </div>

        {/* 4. Cartas Rotación (Al final en móvil, antes del botón) */}
        <div className="w-full lg:col-span-8 order-4 bg-gradient-to-br from-black/60 to-transparent rounded-b-[2rem] lg:rounded-b-[3rem] p-4 md:p-8 pt-0 border-b border-l border-r border-white shadow-2xl relative overflow-hidden">
          <StartingRotation onlyCards={true} />
        </div>

        {/* 5. Botón Publicar (Sticky en móvil, Grid item en PC) */}
        <div className="w-full lg:col-span-4 lg:row-span-2 order-5 flex flex-col sticky bottom-2 z-[100] lg:static lg:bottom-auto pt-4 lg:pt-6">
          <button
            onClick={handlePublishClick}
            disabled={isCapturing}
            className={`
              w-full min-h-[80px] lg:min-h-0 flex-1 group relative flex flex-col items-center justify-center gap-2 lg:gap-4 rounded-2xl lg:rounded-[2.5rem] p-4 lg:p-0 font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] transition-all overflow-hidden border border-white shadow-2xl backdrop-blur-md bg-black/40 lg:bg-transparent
              ${isCapturing
                ? 'opacity-50 cursor-wait'
                : 'bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#8B6B10] text-[#1a0509] hover:scale-[1.01] active:scale-[0.99] shadow-[0_20px_60px_rgba(212,175,55,0.2)]'}
            `}
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

            <div className="relative z-10 flex flex-row lg:flex-col items-center gap-3">
              <span className="text-2xl lg:text-5xl">{isCapturing ? '⌛' : '🏆'}</span>
              <div className="text-center font-black">
                <span className="text-sm lg:text-xl block mb-0.5 lg:mb-1">{isCapturing ? 'GENERANDO...' : 'PUBLICAR'}</span>
                <span className="text-base lg:text-2xl tracking-[0.1em] lg:tracking-[0.2em]">{isCapturing ? 'ESPERE' : 'MI LINEUP'}</span>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Modal del Mánager */}
      <ManagerNameModal
        isOpen={showManagerModal}
        onConfirm={triggerCapture}
        onClose={() => setShowManagerModal(false)}
      />

      {/* ShareCard Oculto (Renderizado solo para captura) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ShareCard />
      </div>

      {/* Footer de Créditos */}
      <footer className="p-10 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase">
          Desarrollado por <span className="text-[#D4AF37]">Hely Camargo</span>
        </p>
      </footer>
    </div>
  );
}

export default App;