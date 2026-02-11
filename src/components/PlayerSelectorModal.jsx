import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot, handleImageError } from './PlayerPool'
import rosterData from '../data/players.json'

const ALL_PLAYERS = [
    ...(rosterData?.lanzadores || []),
    ...(rosterData?.receptores || []),
    ...(rosterData?.infielders || []),
    ...(rosterData?.outfielders || []),
]

export default function PlayerSelectorModal({ position, onClose, onSelect }) {
    const bench = useGameStore((s) => s.bench)
    const field = useGameStore((s) => s.field)
    const lineup = useGameStore((s) => s.lineup)
    const rotation = useGameStore((s) => s.rotation)
    const movePlayer = useGameStore((s) => s.movePlayer)

    if (!position) return null

    // Determinar qué IDs excluir según el contexto (Campo o Lineup)
    let takenIds = []
    if (position?.startsWith('Bateador')) {
        // En Lineup: excluir jugadores ya en el lineup
        takenIds = (lineup || []).filter(id => id !== null)
    } else {
        // En Campo (incluyendo DH visual): excluir jugadores ya en el campo o rotación
        takenIds = [
            ...Object.values(field || {}),
            ...(rotation || [])
        ].filter(id => id !== null)
    }

    // Filtrar jugadores disponibles para esta posición
    const availablePlayers = ALL_PLAYERS.filter((player) => {
        // Excluir si ya está tomado en el contexto actual
        if (takenIds.includes(player.personId)) return false

        // REGLAS PRECISAS POR POSICIÓN

        // Pitcher (solo para rotación manual si llegara a usarse aquí, aunque StartingRotation filtra aparte con "P")
        if (position === 'P') return player.position === 'P'

        // Lineup (Bateador X): Cualquier jugador de posición (no pitchers)
        if (position.startsWith('Bateador')) {
            return player.position !== 'P'
        }

        // Catcher: Solo C y C/1B (UT excluido según reglas de Sanoja/UT general para catcher)
        if (position === 'C') return ['C', 'C/1B'].includes(player.position)

        // 1B: IF y C/1B (UT excluido para 1B según regla de Sanoja)
        if (position === '1B') return ['IF', 'C/1B'].includes(player.position)

        // 2B, 3B, SS: IF y UT
        if (['2B', '3B', 'SS'].includes(position)) return ['IF', 'UT'].includes(player.position)

        // Outfield: OF y UT
        if (['LF', 'CF', 'RF'].includes(position)) return ['OF', 'UT'].includes(player.position)

        // DH (en campo): Cualquier NO Pitcher
        if (position === 'DH') return player.position !== 'P'

        return false
    })

    const handleSelect = (playerId) => {
        if (onSelect) {
            onSelect(playerId)
        } else {
            movePlayer(playerId, position)
        }
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
                                        onError={(e) => handleImageError(e, player.personId)}
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
