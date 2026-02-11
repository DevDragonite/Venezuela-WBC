import React, { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot, handleImageError } from './PlayerPool'
import PlayerSelectorModal from './PlayerSelectorModal'

const GAMES = [
    { id: 0, opponent: 'Países Bajos', flag: 'nl', date: '6 de Marzo' },
    { id: 1, opponent: 'Israel', flag: 'il', date: '7 de Marzo' },
    { id: 2, opponent: 'Nicaragua', flag: 'ni', date: '9 de Marzo' },
    { id: 3, opponent: 'RD', flag: 'do', date: '11 de Marzo' },
]

export default function StartingRotation({ onlyCards = false }) {
    const rotation = useGameStore((s) => s.rotation)
    const setRotationSlot = useGameStore((s) => s.setRotationSlot)
    const removeFromRotation = useGameStore((s) => s.removeFromRotation)
    const [modalSlot, setModalSlot] = useState(null)

    const handleSlotClick = (index) => {
        setModalSlot(index)
    }

    const handleSelectPitcher = (playerId) => {
        if (modalSlot !== null) {
            setRotationSlot(modalSlot, playerId)
            setModalSlot(null)
        }
    }

    return (
        <div className="w-full">
            {!onlyCards && (
                <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[#D4AF37] font-black italic text-2xl uppercase tracking-tighter">
                        Rotación de Abridores
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent"></div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {GAMES.map((game, index) => {
                    const playerId = rotation[index]
                    const player = playerId ? PLAYER_MAP[playerId] : null

                    return (
                        <div
                            key={game.id}
                            onClick={() => handleSlotClick(index)}
                            className={`
                group relative h-40 rounded-2xl border transition-all cursor-pointer overflow-hidden
                ${player
                                    ? 'bg-black/80 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                                    : 'bg-white/5 border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10'
                                }
              `}
                        >
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6B1021]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative z-10 h-full flex flex-col p-4">
                                {/* Header: Game Info */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] text-[#D4AF37]/60 font-black uppercase leading-none mb-1">Vs</div>
                                        <div className="flex items-center gap-1.5 max-w-full">
                                            <span className="text-[10px] text-[#D4AF37] font-black uppercase truncate leading-none">
                                                {game.opponent}
                                            </span>
                                            <img
                                                src={`https://flagcdn.com/16x12/${game.flag}.png`}
                                                srcSet={`https://flagcdn.com/32x24/${game.flag}.png 2x`}
                                                width="16"
                                                height="12"
                                                alt=""
                                                className="border border-[#D4AF37]/50 rounded-sm shadow-sm shrink-0"
                                            />
                                        </div>
                                        <div className="text-[9px] text-white/40 font-mono italic mt-1">
                                            {game.date}
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#D4AF37] transition-colors">
                                        <span className="text-[10px] text-white font-black">{index + 1}</span>
                                    </div>
                                </div>

                                {/* Content: Player or Empty State */}
                                <div className="flex-1 flex items-center justify-center">
                                    {player ? (
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="relative">
                                                <img
                                                    src={headshot(playerId)}
                                                    onError={(e) => handleImageError(e, playerId)}
                                                    className="w-14 h-14 rounded-full object-cover bg-black/50 border border-[#D4AF37]"
                                                    alt={player.name}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white font-bold text-[11px] leading-tight uppercase tracking-tight">
                                                    {player.name}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeFromRotation(index)
                                                }}
                                                className="ml-auto p-1.5 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-white/20 group-hover:text-[#D4AF37]/60 transition-colors">
                                            <span className="text-2xl font-light">+</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Seleccionar</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <PlayerSelectorModal
                position={modalSlot !== null ? 'P' : null}
                onClose={() => setModalSlot(null)}
                onSelect={handleSelectPitcher}
            />
        </div>
    )
}
