import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { PLAYER_MAP, headshot, handleImageError } from './PlayerPool';

const GAMES = [
    { id: 0, opponent: 'Países Bajos', flag: 'nl', date: '6 de Marzo' },
    { id: 1, opponent: 'Israel', flag: 'il', date: '7 de Marzo' },
    { id: 2, opponent: 'Nicaragua', flag: 'ni', date: '9 de Marzo' },
    { id: 3, opponent: 'RD', flag: 'do', date: '11 de Marzo' },
]

export default function ShareCard() {
    const field = useGameStore((s) => s.field);
    const lineup = useGameStore((s) => s.lineup);
    const rotation = useGameStore((s) => s.rotation);
    const managerFullName = useGameStore((s) => s.managerFullName);

    // Encontrar qué posición ocupa en el campo este jugador específico
    const getPlayerPositionInField = (playerId) => {
        if (!playerId) return 'DH';
        const fieldPos = Object.entries(field || {}).find(([_, id]) => id === playerId);
        if (fieldPos) return fieldPos[0];
        return PLAYER_MAP[playerId]?.position || 'DH';
    };

    // Mapeo de posiciones para el diamante compacto
    const fieldOrder = ['CF', 'LF', 'RF', 'SS', '2B', '3B', '1B', 'P', 'C'];

    const getLastName = (playerId) => {
        if (!playerId || !PLAYER_MAP[playerId]) return '';
        const name = PLAYER_MAP[playerId].name;
        const parts = name.split(' ');
        if (parts.length <= 1) return name.toUpperCase();

        const suffixes = ['JR.', 'SR.', 'II', 'III', 'IV', 'JR', 'SR'];
        const lastPart = parts[parts.length - 1].toUpperCase();

        if (suffixes.includes(lastPart) && parts.length > 2) {
            return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`.toUpperCase();
        }

        return parts[parts.length - 1].toUpperCase();
    };

    return (
        <div
            id="share-card-container"
            className="w-[1080px] h-[1080px] bg-[#1a0509] p-12 flex flex-col items-center relative overflow-hidden text-white font-sans"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B1021]/20 blur-[150px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] -z-10 rounded-full"></div>

            {/* Header */}
            <div className="text-center mb-10 w-full">
                <h1 className="text-5xl font-black text-[#D4AF37] tracking-[-0.05em] uppercase italic mb-2">
                    ¡MI ESTRATEGIA WBC VENEZUELA 2026!
                </h1>
                <div className="flex justify-center items-center gap-6">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
                    <p className="text-white/60 text-lg tracking-[0.6em] font-bold uppercase">EL EQUIPO DE TODOS</p>
                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
                </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-12 gap-10">
                {/* Left: Diamond (Compact View) */}
                <div className="col-span-7 flex flex-col justify-center">
                    <div className="relative aspect-square w-full rounded-full border border-white/5 flex items-center justify-center bg-[#1a0509]">
                        {/* SVG Background Field */}
                        <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full opacity-60 rounded-full overflow-hidden">
                            <defs>
                                <linearGradient id="share-grass" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0d2d1a" />
                                    <stop offset="100%" stopColor="#1a0509" />
                                </linearGradient>
                                <linearGradient id="share-infield" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B4513" />
                                    <stop offset="100%" stopColor="#5D2E0C" />
                                </linearGradient>
                            </defs>
                            {/* Grass Circle */}
                            <circle cx="250" cy="250" r="250" fill="url(#share-grass)" />
                            {/* Foul Lines */}
                            <path d="M 250 460 L 0 100" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                            <path d="M 250 460 L 500 100" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                            {/* Infield Dirt */}
                            <path d="M 250 460 L 380 280 L 250 100 L 120 280 Z" fill="url(#share-infield)" stroke="white" strokeWidth="3" opacity="0.5" />
                            {/* Mound */}
                            <circle cx="250" cy="285" r="15" fill="#5D2E0C" />
                            <rect x="246" y="283" width="8" height="3" fill="white" opacity="0.8" />
                        </svg>

                        {/* Players on Field */}
                        {Object.entries(field).map(([pos, playerId]) => {
                            const positions = {
                                'C': { top: '88%', left: '50%' },
                                '1B': { top: '54%', left: '78%' },
                                '2B': { top: '38%', left: '62%' },
                                'SS': { top: '38%', left: '38%' },
                                '3B': { top: '54%', left: '22%' },
                                'LF': { top: '24%', left: '16%' },
                                'CF': { top: '12%', left: '50%' },
                                'RF': { top: '24%', left: '84%' },
                                'DH': { top: '86%', left: '10%' }, // Más lejos para evitar confusión con defensa
                            };

                            if (pos === 'P' || !positions[pos]) return null;
                            const style = positions[pos];

                            return (
                                <div key={pos} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={style}>
                                    <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-black/40 shadow-xl">
                                        {playerId ? (
                                            <img
                                                src={headshot(playerId)}
                                                className="w-full h-full object-cover scale-110"
                                                alt=""
                                                crossOrigin="anonymous"
                                                onError={(e) => handleImageError(e, playerId)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/20 text-xs font-black">{pos}</div>
                                        )}
                                    </div>
                                    {playerId && (
                                        <div className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-[#D4AF37]/30 text-[10px] font-black uppercase whitespace-nowrap">
                                            {getLastName(playerId)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rotation display on ShareCard */}
                    <div className="mt-8 grid grid-cols-4 gap-6">
                        {rotation.map((pid, i) => {
                            const game = GAMES[i];
                            return (
                                <div key={i} className="bg-black/80 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col items-center shadow-lg shadow-[#D4AF37]/5 transition-all">
                                    <div className="mb-3 text-center w-full flex flex-col items-center">
                                        {/* Stacked Label: Vs then Country + Flag */}
                                        <div className="text-[9px] text-[#D4AF37]/60 font-black uppercase mb-0.5">Vs</div>
                                        <div className="flex items-center justify-center gap-1.5 mb-2 w-full">
                                            <span className="text-[11px] text-[#D4AF37] font-black uppercase tracking-tight truncate max-w-[120px]">
                                                {game.opponent}
                                            </span>
                                            <img
                                                src={`https://flagcdn.com/16x12/${game.flag}.png`}
                                                srcSet={`https://flagcdn.com/32x24/${game.flag}.png 2x`}
                                                width="16"
                                                height="12"
                                                alt=""
                                                className="border border-[#D4AF37]/40 rounded-sm shadow-sm shrink-0"
                                            />
                                        </div>
                                        <div className="text-[11px] text-white font-mono italic font-bold">
                                            {game.date}
                                        </div>
                                    </div>
                                    <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/50 overflow-hidden bg-black/40 mb-3 relative shadow-inner">
                                        {pid ? (
                                            <img
                                                src={headshot(pid)}
                                                className="w-full h-full object-cover scale-110"
                                                alt=""
                                                crossOrigin="anonymous"
                                                onError={(e) => handleImageError(e, pid)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/10 text-xl font-black">+</div>
                                        )}
                                        <div className="absolute top-0 right-0 w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black text-black shadow-md translate-x-1 -translate-y-1">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="min-h-[1.5rem] flex items-center">
                                        {pid ? (
                                            <div className="bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20 text-[10px] font-black uppercase whitespace-nowrap text-[#D4AF37]">
                                                {getLastName(pid)}
                                            </div>
                                        ) : (
                                            <div className="h-[2px] w-8 bg-white/10 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Lineup (Scoreboard Style) */}
                <div className="col-span-5 flex flex-col gap-3 py-4">
                    <div className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-4 mb-4">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Orden al Bate</span>
                    </div>
                    {lineup.map((pid, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="w-6 text-[#D4AF37] font-black text-xl italic">{i + 1}</span>
                            <div className="flex-1">
                                {pid ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold bg-[#D4AF37] text-black px-1 rounded-sm uppercase">
                                            {getPlayerPositionInField(pid)}
                                        </span>
                                        <span className="font-black uppercase tracking-tight text-lg truncate max-w-[280px]">
                                            {PLAYER_MAP[pid]?.name || 'N/A'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-4 w-32 bg-white/5 rounded"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Attribution */}
            <div className="mt-auto w-full pt-6 pb-4 border-t border-white/10 flex justify-between items-end">
                <div className="flex flex-col max-w-[70%]">
                    <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-[0.4em] mb-1">MANAGER OFICIAL</span>
                    <span className={`font-black italic uppercase tracking-tighter text-white drop-shadow-lg truncate leading-none
                        ${(managerFullName || '').length > 20 ? 'text-4xl' : 'text-5xl'}`}>
                        {managerFullName || ''}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Crea el tuyo en</span>
                    <span className="text-xl font-black text-[#D4AF37] italic">VENEZUELA WBC 2026</span>
                </div>
            </div>
        </div>
    );
}
