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

      {/* Grid Principal: 2 Columnas Limpias y Compactas */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-2 md:py-4 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 lg:items-stretch items-start">

        {/* Columna Izquierda: Estrategia de Campo (Oculta en Móvil) */}
        <div className="hidden lg:flex w-full lg:col-span-8 flex-col bg-gradient-to-br from-black/60 to-transparent rounded-[3rem] border border-white/20 shadow-2xl p-4 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B1021]/10 blur-[120px] -z-10"></div>

          {/* Campo */}
          <div className="w-full mb-4">
            <BaseballField />
          </div>

          {/* Divisor Elegante Amarillo */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent my-8 shadow-[0_0_15px_rgba(212,175,55,0.1)]"></div>

          {/* Rotación */}
          <div className="w-full">
            <div className="flex items-center gap-4 mb-8 px-4">
              <h3 className="text-[#D4AF37] font-black italic text-2xl lg:text-3xl uppercase tracking-tighter whitespace-nowrap">
                Rotación de Abridores
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent"></div>
            </div>
            <StartingRotation onlyCards={true} />
          </div>
        </div>

        {/* Columna Derecha: Lineup y Acción */}
        <div className="w-full lg:col-span-4 flex flex-col gap-0 h-full self-stretch bg-gradient-to-br from-black/60 to-transparent rounded-[3rem] border border-white/20 shadow-2xl p-4 md:p-8 relative overflow-hidden">
          {/* 2. Lineup */}
          <div className="w-full flex-grow">
            <LineupPanel />
          </div>

          {/* Divisor Elegante Amarillo */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent my-8 shadow-[0_0_15px_rgba(212,175,55,0.1)]"></div>

          {/* Rotación (Versión Móvil) */}
          <div className="w-full lg:hidden mb-8">
            <div className="flex items-center gap-4 mb-4 px-2">
              <h3 className="text-[#D4AF37] font-black italic text-xl uppercase tracking-tighter whitespace-nowrap">
                Rotación
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent"></div>
            </div>
            <StartingRotation onlyCards={true} />
            {/* Divisor Extra para separar del botón */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-6"></div>
          </div>

          {/* 4. Botón Publicar */}
          <div className="w-full pb-4">
            <button
              onClick={handlePublishClick}
              disabled={isCapturing}
              className={`
                w-full min-h-[140px] group relative flex flex-col items-center justify-center gap-3 rounded-3xl p-6 font-black uppercase tracking-[0.3em] transition-all overflow-hidden border border-white shadow-3xl
                ${isCapturing
                  ? 'opacity-50 cursor-wait bg-white/10'
                  : 'bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#8B6B10] text-[#1a0509] hover:scale-[1.01] active:scale-[0.99] shadow-[0_30px_90px_rgba(212,175,55,0.25)] hover:shadow-[0_40px_100px_rgba(212,175,55,0.4)]'}
              `}
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

              <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="text-4xl lg:text-5xl">{isCapturing ? '⌛' : '🏆'}</span>
                <div className="text-center font-black">
                  <span className="text-xs lg:text-sm block mb-1">{isCapturing ? 'GENERANDO...' : 'PUBLICAR'}</span>
                  <span className="text-xl lg:text-2xl tracking-widest">{isCapturing ? 'IMAGEN' : 'MI LINEUP'}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Eliminado el contenedor del botón antiguo */}

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