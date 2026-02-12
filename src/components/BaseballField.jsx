import { useState, useEffect } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  DragOverlay
} from '@dnd-kit/core'
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

const POSITION_COORDS = (isMobile) => isMobile ? ({
  // Mobile Grid - Locked to 360px context (LF Ref: 90, 65)
  LF: { x: 90, y: 65 },
  RF: { x: 360, y: 65 }, // Mirror mirrored (410 -> 360)
  CF: { x: 225, y: 65 }, // New Center (90+360)/2

  SS: { x: 180, y: 220 },
  '2B': { x: 270, y: 220 },

  '3B': { x: 110, y: 350 },
  '1B': { x: 340, y: 350 },

  C: { x: 225, y: 480 },
  DH: { x: 100, y: 480 },
}) : ({
  // Desktop Grid - Original Professional Layout (Centered at 250)
  LF: { x: 80, y: 60 },
  RF: { x: 420, y: 60 },
  CF: { x: 250, y: 60 },

  SS: { x: 190, y: 180 },
  '2B': { x: 310, y: 180 },

  '3B': { x: 120, y: 310 },
  '1B': { x: 380, y: 310 },

  C: { x: 250, y: 440 },
  DH: { x: 90, y: 440 },
})

const DIAMOND_PATH = (isMobile) => isMobile
  ? 'M 225 480 L 340 350 L 225 220 L 110 350 Z'
  : 'M 250 440 L 375 310 L 250 180 L 125 310 Z'

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

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export default function BaseballField() {
  const isMobile = useIsMobile()
  const [modalPosition, setModalPosition] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const field = useGameStore((s) => s.field)
  const removeFromField = useGameStore((s) => s.removeFromField)
  const movePlayer = useGameStore((s) => s.movePlayer)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`mx-auto flex items-center justify-center relative py-1 md:py-4 ${isMobile ? 'w-[360px] h-auto' : 'w-full aspect-square'}`}>
        <svg
          viewBox={isMobile ? "0 0 500 620" : "0 0 500 520"}
          width={isMobile ? "360" : "100%"}
          height={isMobile ? "auto" : "100%"}
          className="block touch-pan-y"
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
          <rect x="0" y="0" width="500" height={isMobile ? 620 : 520} fill="url(#grass)" />

          {/* Líneas de foul hacia el outfield */}
          <path d={isMobile ? "M 225 480 L -155 50" : "M 250 440 L -125 50"} fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d={isMobile ? "M 225 480 L 605 50" : "M 250 440 L 625 50"} fill="none" stroke="#FFFFFF" strokeWidth="3" />

          {/* Infield (tierra) */}
          <path d={DIAMOND_PATH(isMobile)} fill="url(#infield)" stroke="#FFFFFF" strokeWidth="4" />

          {/* Líneas de las bases */}
          {isMobile ? (
            <>
              <path d="M 225 480 L 340 350" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 340 350 L 225 220" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 225 220 L 110 350" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 110 350 L 225 480" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            </>
          ) : (
            <>
              <path d="M 250 440 L 375 310" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 375 310 L 250 180" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 250 180 L 125 310" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 125 310 L 250 440" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            </>
          )}

          {/* Home plate */}
          <polygon
            points={isMobile ? "225,480 240,460 225,455 210,460" : "250,440 265,420 250,415 235,420"}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Montículo del Pitcher (Mound) */}
          <circle cx={isMobile ? 225 : 250} cy={isMobile ? 350 : 310} r="18" fill="#5D2E0C" />
          <rect x={isMobile ? 220 : 245} y={isMobile ? 348 : 308} width="10" height="4" fill="white" transform={`rotate(0 ${isMobile ? 225 : 250} ${isMobile ? 350 : 310})`} />

          {/* Posiciones interactivas (Cards) */}
          {Object.entries(POSITION_COORDS(isMobile)).map(([pos, { x, y }]) => {
            const playerId = field[pos]
            const player = playerId ? PLAYER_MAP[playerId] : null

            // Dimensiones de la "Tarjeta" en coordenadas del SVG (Dinámicas para móvil)
            const cardWidth = 60
            const cardHeight = 78
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
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 group bg-black/40 border-white/20 hover:bg-black/60 rounded-lg border shadow-lg backdrop-blur-sm overflow-visible"
                      onClick={() => handlePositionClick(pos)}
                    >
                      <div className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center">
                        <span className="text-lg lg:text-xl font-black text-[#D4AF37]/50 opacity-30 group-hover:opacity-100 transition-opacity">
                          +
                        </span>
                      </div>
                      <div className="text-[9px] lg:text-xs font-bold text-[#D4AF37] mt-0.5">{pos}</div>
                    </div>
                  )}
                </DroppablePosition>
              </foreignObject>
            )
          })}
        </svg>

        <DragOverlay>
          {activeId ? (
            <div style={{ width: isMobile ? '38px' : '60px', height: isMobile ? '52px' : '70px' }}>
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
