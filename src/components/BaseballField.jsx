import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot, handleImageError } from './PlayerPool'
import PlayerSelectorModal from './PlayerSelectorModal'

const isValidMove = (player, targetPos) => {
  if (!player) return false

  // Excepción para DH: puede ser cualquier jugador que NO sea Pitcher
  if (targetPos === 'DH') return player.position !== 'P'

  // Pitcher solo puede ir a P (pero P ya no está en el campo interactivo, solo rotación)
  if (player.position === 'P') return false // Pitchers no van al campo defensivo en este simulador

  // Catcher: C o C/1B
  if (player.position === 'C') return targetPos === 'C' || targetPos === '1B'
  if (player.position === 'C/1B') return targetPos === 'C' || targetPos === '1B'

  // Outfield: LF, CF, RF + DH
  if (player.position === 'OF') return ['LF', 'CF', 'RF', 'DH'].includes(targetPos)

  // Infield: 1B, 2B, 3B, SS + DH
  if (player.position === 'IF') return ['1B', '2B', '3B', 'SS', 'DH'].includes(targetPos)

  // Utility (Sanoja): Cualquiera MENOS C y 1B (según reglas usuario)
  if (player.position === 'UT') {
    return !['C', '1B'].includes(targetPos)
  }

  // Fallback
  return true
}

const POSITION_COORDS = {
  C: { x: 250, y: 420 },
  '1B': { x: 380, y: 280 },
  '2B': { x: 310, y: 170 },
  '3B': { x: 120, y: 280 },
  SS: { x: 190, y: 170 },
  LF: { x: 80, y: 60 },
  CF: { x: 250, y: 50 },
  RF: { x: 420, y: 60 },
  DH: { x: 90, y: 380 },
}

const DIAMOND_PATH = 'M 250 480 L 380 280 L 250 100 L 120 280 Z'

const DraggablePlayer = ({ id, children, disabled }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full h-full ${isDragging ? 'opacity-30' : 'opacity-100'} touch-none`}
    >
      {children}
    </div>
  )
}

const DroppablePosition = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-lg transition-colors ${isOver ? 'ring-2 ring-[#D4AF37] bg-white/10' : ''
        }`}
    >
      {children}
    </div>
  )
}

const getSurname = (fullName) => {
  if (!fullName) return ''
  const parts = fullName.split(' ')
  if (parts.length <= 1) return fullName

  const suffixes = ['JR.', 'SR.', 'II', 'III', 'IV', 'JR', 'SR']
  const lastPart = parts[parts.length - 1].toUpperCase()

  if (suffixes.includes(lastPart) && parts.length > 2) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`
  }

  return parts[parts.length - 1]
}

const PlayerCard = ({ playerId, pos, onClick, onDelete, isOverlay = false }) => {
  const player = PLAYER_MAP[playerId]
  if (!player) return null

  return (
    <div
      className={`w-full h-full relative flex flex-col items-center justify-center cursor-pointer transition-transform ${!isOverlay ? 'hover:scale-105 active:scale-95 hover:z-50' : 'scale-110 shadow-2xl z-[100]'
        } group bg-black/80 border-[#D4AF37] rounded-lg border shadow-lg backdrop-blur-sm relative`}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        {/* Headshot */}
        <div className="w-full h-full absolute inset-0 opacity-80">
          <img
            src={headshot(playerId)}
            onError={(e) => handleImageError(e, playerId)}
            className="w-full h-full object-cover"
            alt=""
            draggable="false"
          />
        </div>

        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

        {/* Info */}
        <div className="relative z-10 mt-auto w-full text-center pb-1.5 h-full flex flex-col justify-end">
          <div className={`font-bold text-white px-1 shadow-black drop-shadow-md uppercase tracking-tighter leading-[0.85]
            ${(getSurname(player.name) || '').length > 9 ? 'text-[7px]' : 'text-[9px]'}
          `}>
            {getSurname(player.name)}
          </div>
        </div>
      </div>

      {/* Delete Button (Outside overflow-hidden) */}
      {!isOverlay && onDelete && (
        <button
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-700 shadow-md ring-2 ring-black"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}

export default function BaseballField() {
  const [modalPosition, setModalPosition] = useState(null)
  const [activeId, setActiveId] = useState(null) // For DragOverlay
  const field = useGameStore((s) => s.field)
  const removeFromField = useGameStore((s) => s.removeFromField)
  const movePlayer = useGameStore((s) => s.movePlayer)

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      // active.id is playerId
      // over.id is position string (e.g., '1B')

      const playerId = active.id
      const targetPos = over.id
      const player = PLAYER_MAP[playerId]

      // Validate Move
      if (isValidMove(player, targetPos)) {
        movePlayer(playerId, targetPos)
      } else {
        // Optional: Show error feedback
        // console.warn('Invalid move for position', player.position, 'to', targetPos)
      }
    }
  }

  const handlePositionClick = (pos) => {
    setModalPosition(pos)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full relative py-2 md:py-4">
        <svg
          viewBox="0 0 500 520"
          className="mx-auto block h-auto min-h-[300px] md:min-h-[380px] w-full min-w-[300px] md:min-w-[380px] max-w-[560px] touch-pan-y"
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
          </defs>

          {/* Campo exterior (césped) */}
          <rect x="0" y="0" width="500" height="520" fill="url(#grass)" />

          {/* Líneas de foul hacia el outfield */}
          <path d="M 250 480 L 0 100" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M 250 480 L 500 100" fill="none" stroke="#FFFFFF" strokeWidth="3" />

          {/* Infield (tierra) */}
          <path d={DIAMOND_PATH} fill="url(#infield)" stroke="#FFFFFF" strokeWidth="4" />

          {/* Líneas de las bases */}
          <path d="M 250 480 L 380 280" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 380 280 L 250 100" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 250 100 L 120 280" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 120 280 L 250 480" fill="none" stroke="#FFFFFF" strokeWidth="2" />

          {/* Home plate */}
          {/* Home plate */}
          <polygon
            points="250,480 265,460 250,455 235,460"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Montículo del Pitcher (Mound) */}
          <circle cx="250" cy="290" r="18" fill="#5D2E0C" />
          <rect x="245" y="288" width="10" height="4" fill="white" transform="rotate(0 250 290)" />

          {/* Posiciones interactivas (Cards) */}
          {Object.entries(POSITION_COORDS).map(([pos, { x, y }]) => {
            const playerId = field[pos]
            const player = playerId ? PLAYER_MAP[playerId] : null

            // Dimensiones de la "Tarjeta" en coordenadas del SVG
            const cardWidth = 60
            const cardHeight = 70
            // Centrar la tarjeta en x, y
            const cardX = x - cardWidth / 2
            const cardY = y - cardHeight / 2

            return (
              <foreignObject x={cardX} y={cardY} width={cardWidth} height={cardHeight} key={pos} className="overflow-visible">
                <DroppablePosition id={pos}>
                  {player ? (
                    <DraggablePlayer id={playerId}>
                      <PlayerCard
                        playerId={playerId}
                        pos={pos}
                        onClick={() => handlePositionClick(pos)}
                        onDelete={() => removeFromField(pos)}
                      />
                    </DraggablePlayer>
                  ) : (
                    /* Estado Vacío */
                    <div
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 group bg-black/40 border-white/20 hover:bg-black/60 rounded-lg border shadow-lg backdrop-blur-sm overflow-hidden"
                      onClick={() => handlePositionClick(pos)}
                    >
                      <div className="text-[#D4AF37]/50 text-xl font-black opacity-30 group-hover:opacity-100 transition-opacity">
                        +
                      </div>
                      <div className="text-[10px] font-bold text-[#D4AF37] mt-1">{pos}</div>
                    </div>
                  )}
                </DroppablePosition>
              </foreignObject>
            )
          })}
        </svg>

        <DragOverlay>
          {activeId ? (
            <div className="w-[60px] h-[70px]">
              <PlayerCard playerId={activeId} pos="" isOverlay />
            </div>
          ) : null}
        </DragOverlay>

        {/* Modal de Selección */}
        <PlayerSelectorModal position={modalPosition} onClose={() => setModalPosition(null)} />
      </div>
    </DndContext>
  )
}
