import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot } from './PlayerPool'
import PlayerSelectorModal from './PlayerSelectorModal'

const POSITION_COORDS = {
  P: { x: 250, y: 300 },
  C: { x: 250, y: 420 },
  '1B': { x: 380, y: 280 },
  '2B': { x: 310, y: 170 },
  '3B': { x: 120, y: 280 },
  SS: { x: 190, y: 170 },
  LF: { x: 80, y: 60 },
  CF: { x: 250, y: 20 },
  RF: { x: 420, y: 60 },
  DH: { x: 420, y: 420 },
}

const DIAMOND_PATH = 'M 250 480 L 380 280 L 250 100 L 120 280 Z'

export default function BaseballField() {
  const [modalPosition, setModalPosition] = useState(null)
  const field = useGameStore((s) => s.field)
  const removeFromField = useGameStore((s) => s.removeFromField)

  const handlePositionClick = (pos) => {
    setModalPosition(pos)
  }

  return (
    <div className="w-full overflow-auto overscroll-contain py-4">
      <svg
        viewBox="0 0 500 520"
        className="mx-auto block h-auto min-h-[380px] w-full min-w-[380px] max-w-[560px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definiciones */}
        <defs>
          <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d2d1a" />
            <stop offset="100%" stopColor="#1a0509" />
          </linearGradient>
          <linearGradient id="infield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#5D2E0C" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Clip circular para headshots */}
          <clipPath id="avatar-clip">
            <circle cx="0" cy="0" r="18" />
          </clipPath>
        </defs>

        {/* Campo exterior (césped) */}
        <rect x="0" y="0" width="500" height="520" fill="url(#grass)" />

        {/* Líneas de foul hacia el outfield */}
        <path d="M 250 480 L 0 520" fill="none" stroke="#D4AF37" strokeWidth="3" opacity="0.6" />
        <path d="M 250 480 L 500 520" fill="none" stroke="#D4AF37" strokeWidth="3" opacity="0.6" />

        {/* Infield (tierra) */}
        <path d={DIAMOND_PATH} fill="url(#infield)" stroke="#D4AF37" strokeWidth="4" />

        {/* Líneas de las bases */}
        <path d="M 250 480 L 380 280" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.8" />
        <path d="M 380 280 L 250 100" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.8" />
        <path d="M 250 100 L 120 280" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.8" />
        <path d="M 120 280 L 250 480" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.8" />

        {/* Home plate */}
        <polygon
          points="250,480 265,460 250,455 235,460"
          fill="#6B1021"
          stroke="#D4AF37"
          strokeWidth="2"
        />

        {/* DH label (junto al home) */}
        <text x="420" y="450" textAnchor="middle" className="fill-white/20 text-[8px] font-bold">
          DH
        </text>

        {/* Posiciones interactivas */}
        {Object.entries(POSITION_COORDS).map(([pos, { x, y }]) => {
          const playerId = field[pos]
          const player = playerId ? PLAYER_MAP[playerId] : null
          const hasPlayer = !!player

          return (
            <g
              key={pos}
              className="cursor-pointer"
              onClick={() => handlePositionClick(pos)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePositionClick(pos)
                }
              }}
              aria-label={`Posición ${pos}${hasPlayer ? ` — ${player.name}` : ', vacía'}`}
            >
              {/* Círculo de fondo */}
              <circle
                cx={x}
                cy={y}
                r={22}
                fill={hasPlayer ? '#6B1021' : 'rgba(107, 16, 33, 0.4)'}
                stroke="#D4AF37"
                strokeWidth={2}
                style={{ filter: hasPlayer ? 'url(#glow)' : undefined }}
                className="transition-all duration-200 hover:fill-[#6B1021] hover:stroke-[#D4AF37]"
              />

              {hasPlayer ? (
                <>
                  {/* Headshot del jugador */}
                  <image
                    href={headshot(playerId)}
                    x={x - 18}
                    y={y - 18}
                    width="36"
                    height="36"
                    clipPath="url(#avatar-clip)"
                    style={{ transform: `translate(0,0)` }}
                    className="pointer-events-none"
                    preserveAspectRatio="xMidYMid slice"
                  />

                  {/* Posición badge */}
                  <circle cx={x + 16} cy={y - 16} r="8" fill="#D4AF37" />
                  <text
                    x={x + 16}
                    y={y - 13}
                    textAnchor="middle"
                    className="pointer-events-none select-none fill-[#1a0509] text-[7px] font-black"
                  >
                    {pos}
                  </text>

                  {/* Nombre debajo */}
                  <text
                    x={x}
                    y={y + 34}
                    textAnchor="middle"
                    className="pointer-events-none select-none fill-white text-[9px] font-bold"
                  >
                    {player.name.split(' ').slice(-1)[0]}
                  </text>
                </>
              ) : (
                /* Etiqueta de posición */
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="pointer-events-none select-none fill-[#D4AF37] text-sm font-bold"
                >
                  {pos}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Modal de Selección */}
      <PlayerSelectorModal position={modalPosition} onClose={() => setModalPosition(null)} />

      {/* Instrucciones contextuales */}
      <p className="text-center text-white/30 text-[10px] mt-2 tracking-wider">
        Haz clic en cualquier posición del campo para seleccionar un jugador
      </p>
    </div>
  )
}
