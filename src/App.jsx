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
      <header className="p-8 text-center border-b border-[#D4AF37]/20 bg-black/30 backdrop-blur-md">
        <h1 className="text-5xl md:text-7xl font-black text-[#D4AF37] tracking-tighter uppercase italic drop-shadow-2xl">
          VENEZUELA <span className="text-white">WBC 2026</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mt-4">
          <span className="h-[1px] w-12 bg-[#D4AF37]/50"></span>
          <p className="text-[#D4AF37]/80 text-xs md:text-sm tracking-[0.4em] uppercase font-bold">
            CENTRO DE MANDO VINOTINTO • EL EQUIPO DE TODOS!
          </p>
          <span className="h-[1px] w-12 bg-[#D4AF37]/50"></span>
        </div>
      </header>

      {/* Grid Principal Granular: 3 Rangos de alineación */}
      <main className="max-w-[1700px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-0 items-stretch">

        {/* ROW 1: Campo Izquierda vs Lineup Derecha */}
        <div className="lg:col-span-8 bg-gradient-to-br from-black/60 to-transparent rounded-t-[3rem] p-8 border-t border-l border-r border-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B1021]/10 blur-[120px] -z-10"></div>
          <BaseballField />
        </div>

        {/* Lineup (Ocupa toda la altura de la fila 1) */}
        <div className="lg:col-span-4 flex flex-col">
          <LineupPanel />
        </div>

        {/* ROW 2: Header Rotación vs Inicio de Botón Publicar */}
        {/* Lote Izquierdo: Divisor Amarillo */}
        <div className="lg:col-span-8 bg-gradient-to-br from-black/60 to-transparent border-l border-r border-white px-8">
          <div className="flex items-center gap-4 py-6 border-t border-white/10">
            <h3 className="text-[#D4AF37] font-black italic text-2xl uppercase tracking-tighter whitespace-nowrap">
              Rotación de Abridores
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent"></div>
          </div>
        </div>

        {/* Lote Derecho: Inicio del Botón (Alineado con el texto "Rotación") */}
        <div className="lg:col-span-4 lg:row-span-2 pt-6 flex flex-col">
          <button
            onClick={handlePublishClick}
            disabled={isCapturing}
            className={`
              flex-1 group relative flex flex-col items-center justify-center gap-4 rounded-[2.5rem] font-black uppercase tracking-[0.4em] transition-all overflow-hidden border border-white shadow-2xl
              ${isCapturing
                ? 'bg-white/10 text-white/40 cursor-wait'
                : 'bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#8B6B10] text-[#1a0509] hover:scale-[1.01] active:scale-[0.99] shadow-[0_20px_60px_rgba(212,175,55,0.2)] hover:shadow-[0_30px_80px_rgba(212,175,55,0.4)]'}
            `}
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="text-5xl mb-2">{isCapturing ? '⌛' : '🏆'}</span>
              <div className="text-center font-black">
                <span className="text-xl block mb-1">{isCapturing ? 'GENERANDO...' : 'PUBLICAR'}</span>
                <span className="text-2xl tracking-[0.2em]">{isCapturing ? 'ESPERE' : 'MI LINEUP'}</span>
              </div>
            </div>
          </button>
        </div>

        {/* ROW 3: Cartas de Rotación Izquierda vs Resto de Botón Derecha */}
        <div className="lg:col-span-8 bg-gradient-to-br from-black/60 to-transparent rounded-b-[3rem] p-8 pt-0 border-b border-l border-r border-white shadow-2xl relative overflow-hidden">
          <StartingRotation onlyCards={true} />
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