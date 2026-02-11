import { useEffect, useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'
import rosterData from '../data/players.json'

/* Mapa rápido: personId → datos del jugador */
const ALL_PLAYERS = [
    ...rosterData.lanzadores,
    ...rosterData.receptores,
    ...rosterData.infielders,
    ...rosterData.outfielders,
]
const PLAYER_MAP = Object.fromEntries(ALL_PLAYERS.map((p) => [p.personId, p]))

/**
 * Retorna la URL del headshot. Intenta cargar una imagen local primero,
 * y si no existe (o si el ID es de MLB), usa la URL oficial de MLB.
 */
const headshot = (personId) => {
    const player = PLAYER_MAP[personId]
    if (player && player.photo) return player.photo
    return `/assets/players/${personId}.png`
}

// The original MLB URL for fallback:
const MLB_HEADSHOT_URL = (personId) =>
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${personId}/headshot/67/current`

/* Categorías de visualización */
const CATEGORIES = [
    { key: 'lanzadores', label: 'Lanzadores', icon: '⚾' },
    { key: 'receptores', label: 'Receptores', icon: '🧤' },
    { key: 'infielders', label: 'Infielders', icon: '💎' },
    { key: 'outfielders', label: 'Outfielders', icon: '🌿' },
]

export { PLAYER_MAP, headshot }

// Helper parafallback de imagen
export const handleImageError = (e, personId) => {
    e.target.src = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${personId}/headshot/67/current`
    e.target.onerror = null // Evitar loop infinito
}

export default function PlayerPool() {
    const bench = useGameStore((s) => s.bench)
    const selectedPlayer = useGameStore((s) => s.selectedPlayer)
    const selectPlayer = useGameStore((s) => s.selectPlayer)
    const initBench = useGameStore((s) => s.initBench)

    /* Al montar: inyectar todos los personIds en la banca */
    useEffect(() => {
        const allIds = ALL_PLAYERS.map((p) => p.personId)
        initBench(allIds)
    }, [initBench, ALL_PLAYERS])

    /* Bench como Set para lookup rápido */
    const benchSet = useMemo(() => new Set(bench), [bench])

    return (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm">
                    Reserva de Jugadores
                </h3>
                <span className="text-[10px] text-white/30 font-mono">
                    {bench.length} disponibles
                </span>
            </div>

            {CATEGORIES.map(({ key, label, icon }) => {
                const players = rosterData[key].filter((p) => benchSet.has(p.personId))
                if (players.length === 0) return null

                return (
                    <div key={key} className="mb-5 last:mb-0">
                        <h4 className="text-[11px] text-white/40 font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <span>{icon}</span> {label}
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {players.map((player) => {
                                const isSelected = selectedPlayer === player.personId
                                return (
                                    <button
                                        key={player.personId}
                                        onClick={() => selectPlayer(player.personId)}
                                        className={`
                      group relative flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 text-left
                      ${isSelected
                                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10 scale-[1.02]'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                            }
                    `}
                                    >
                                        {/* Headshot */}
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                                            <img
                                                src={headshot(player.personId)}
                                                onError={(e) => handleImageError(e, player.personId)}
                                                alt={player.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white text-xs font-bold truncate leading-tight">
                                                {player.name}
                                            </p>
                                            <p className="text-[10px] text-[#D4AF37]/70 font-mono mt-0.5">
                                                {player.position}
                                                {player.throws ? ` • ${player.throws}HP` : ''}
                                            </p>
                                        </div>

                                        {/* Indicador de selección */}
                                        {isSelected && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
                                                <span className="text-[8px] text-[#1a0509] font-black">✓</span>
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {bench.length === 0 && (
                <p className="text-white/20 text-xs italic text-center py-8">
                    Todos los jugadores están en el campo
                </p>
            )}
        </div>
    )
}