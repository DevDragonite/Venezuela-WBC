import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot } from './PlayerPool'
import rosterData from '../data/players.json'

const ALL_PLAYERS = [
    ...rosterData.lanzadores,
    ...rosterData.receptores,
    ...rosterData.infielders,
    ...rosterData.outfielders,
]

export default function PlayerSelectorModal({ position, onClose }) {
    const bench = useGameStore((s) => s.bench)
    const field = useGameStore((s) => s.field)
    const movePlayer = useGameStore((s) => s.movePlayer)

    if (!position) return null

    // Filtrar jugadores disponibles para esta posición
    const availablePlayers = ALL_PLAYERS.filter((player) => {
        // Debe estar en la banca O en el campo
        const isAvailable = bench.includes(player.personId) || Object.values(field).includes(player.personId)

        // Filtrar por posición
        if (position === 'P') return player.position === 'P' && isAvailable
        if (position === 'C') return player.position === 'C' && isAvailable
        if (position === '1B') return player.position === '1B' && isAvailable
        if (position === '2B') return player.position === '2B' && isAvailable
        if (position === '3B') return player.position === '3B' && isAvailable
        if (position === 'SS') return player.position === 'SS' && isAvailable
        if (position === 'LF' || position === 'CF' || position === 'RF') {
            return ['LF', 'CF', 'RF'].includes(player.position) && isAvailable
        }
        if (position === 'DH') {
            // DH puede ser cualquier jugador
            return isAvailable
        }
        return false
    })

    const handleSelect = (playerId) => {
        movePlayer(playerId, position)
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end p-6"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-[#1a0509] to-black w-full max-w-md h-full rounded-3xl border border-[#D4AF37]/20 shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-black/40">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-[#D4AF37] uppercase italic">
                            Seleccionar Jugador
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <span className="text-white text-xl">×</span>
                        </button>
                    </div>
                    <p className="text-white/50 text-sm">
                        Posición: <span className="text-[#D4AF37] font-bold">{position}</span>
                    </p>
                </div>

                {/* Lista de jugadores */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {availablePlayers.length === 0 ? (
                        <p className="text-white/30 text-center py-12 italic">
                            No hay jugadores disponibles para esta posición
                        </p>
                    ) : (
                        availablePlayers.map((player) => {
                            const currentPosition = Object.entries(field).find(
                                ([_, id]) => id === player.personId
                            )?.[0]
                            const isInField = !!currentPosition

                            return (
                                <button
                                    key={player.personId}
                                    onClick={() => handleSelect(player.personId)}
                                    className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all duration-200"
                                >
                                    {/* Headshot */}
                                    <img
                                        src={headshot(player.personId)}
                                        alt={player.name}
                                        className="w-16 h-16 rounded-xl object-cover bg-black/40 flex-shrink-0"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-bold text-base leading-tight">
                                            {player.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[#D4AF37] text-xs font-mono">
                                                {player.position}
                                            </span>
                                            {player.throws && (
                                                <span className="text-white/40 text-xs">
                                                    • {player.throws}HP
                                                </span>
                                            )}
                                            {isInField && (
                                                <span className="text-[10px] bg-[#6B1021] text-white px-2 py-0.5 rounded-full">
                                                    En {currentPosition}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                                        →
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
