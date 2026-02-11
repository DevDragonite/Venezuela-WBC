import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot } from './PlayerPool'
import rosterData from '../data/players.json'

const SCHEDULE = [
    { opponent: 'Nicaragua', date: '2026-03-05', venue: 'Miami' },
    { opponent: 'República Dominicana', date: '2026-03-07', venue: 'Miami' },
    { opponent: 'Israel', date: '2026-03-09', venue: 'Miami' },
    { opponent: 'Países Bajos', date: '2026-03-10', venue: 'Miami' },
]

export default function SchedulePanel() {
    const [selectedGame, setSelectedGame] = useState(null)
    const field = useGameStore((s) => s.field)
    const movePlayer = useGameStore((s) => s.movePlayer)

    // Obtener el pitcher asignado (el que está en posición P)
    const assignedPitcher = field.P ? PLAYER_MAP[field.P] : null

    const pitchers = rosterData.lanzadores

    const handlePitcherSelect = (pitcherId) => {
        movePlayer(pitcherId, 'P')
        setSelectedGame(null)
    }

    return (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm">
                    Fase de Grupos • Pool D
                </h3>
                <span className="text-[10px] text-white/30 font-mono">Miami, FL</span>
            </div>

            <div className="space-y-3">
                {SCHEDULE.map((game, idx) => (
                    <div
                        key={idx}
                        className="bg-gradient-to-r from-[#6B1021]/20 to-transparent p-4 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all"
                    >
                        {/* Equipos y Fecha */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇻🇪</span>
                                <div>
                                    <p className="text-white font-bold text-sm">VEN vs {game.opponent}</p>
                                    <p className="text-white/40 text-[10px] font-mono">{game.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lanzador Abridor */}
                        <div className="relative">
                            <button
                                onClick={() => setSelectedGame(selectedGame === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10 hover:border-[#D4AF37]/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    {assignedPitcher ? (
                                        <>
                                            <img
                                                src={headshot(assignedPitcher.personId)}
                                                alt={assignedPitcher.name}
                                                className="w-8 h-8 rounded-lg object-cover bg-black/60"
                                            />
                                            <div className="text-left">
                                                <p className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider">
                                                    Lanzador Abridor
                                                </p>
                                                <p className="text-white text-xs font-bold">
                                                    {assignedPitcher.name}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-left">
                                            <p className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider">
                                                Lanzador Abridor
                                            </p>
                                            <p className="text-white/40 text-xs italic">Seleccionar pitcher...</p>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                                    {selectedGame === idx ? '▲' : '▼'}
                                </span>
                            </button>

                            {/* Dropdown de Pitchers */}
                            {selectedGame === idx && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-[#D4AF37]/30 rounded-xl shadow-2xl z-10 max-h-64 overflow-y-auto">
                                    {pitchers.map((pitcher) => (
                                        <button
                                            key={pitcher.personId}
                                            onClick={() => handlePitcherSelect(pitcher.personId)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-[#D4AF37]/10 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <img
                                                src={headshot(pitcher.personId)}
                                                alt={pitcher.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-black/60"
                                            />
                                            <div className="text-left flex-1">
                                                <p className="text-white text-sm font-bold">{pitcher.name}</p>
                                                <p className="text-[#D4AF37]/70 text-[10px] font-mono">
                                                    {pitcher.throws}HP
                                                </p>
                                            </div>
                                            {field.P === pitcher.personId && (
                                                <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded-full font-bold">
                                                    ACTUAL
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
