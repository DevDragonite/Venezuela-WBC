import React, { useState, useRef } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useGameStore } from '../store/useGameStore'
import { PLAYER_MAP, headshot, handleImageError } from './PlayerPool'
import PlayerSelectorModal from './PlayerSelectorModal'

// Custom modifier to lock horizontal axis
const restrictToVerticalAxis = ({ transform }) => {
    return {
        ...transform,
        x: 0,
    }
}

// Componente para cada item de la lista (Slot del lineup)
const SortableLineupItem = ({ id, playerId, index, onRemove, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const player = playerId ? PLAYER_MAP[playerId] : null

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? 'opacity-0' : 'opacity-100'}`}
        >
            <LineupCard
                player={player}
                index={index}
                onRemove={onRemove}
                onClick={onClick}
                listeners={listeners}
                attributes={attributes}
            />
        </div>
    )
}

// Tarjeta visual del jugador (reutilizada por items y overlay)
const LineupCard = ({ player, index, onRemove, onClick, isOverlay = false, listeners, attributes }) => {
    const field = useGameStore((s) => s.field)

    // Encontrar qué posición ocupa en el campo este jugador específico
    const getCurrentPosition = () => {
        if (!player) return null
        const fieldPos = Object.entries(field).find(([_, id]) => id === player.personId)
        if (fieldPos) return fieldPos[0] // Retorna '1B', 'CF', etc.
        return player.position // Fallback a la posición natural si no está en el campo (ej: es el DH asignado por defecto)
    }

    const currentPos = getCurrentPosition()

    return (
        <div
            onClick={onClick}
            {...listeners}
            {...attributes}
            className={`group relative flex items-center gap-3 p-2 rounded-xl border border-white/5 transition-all select-none
            ${isOverlay ? 'bg-[#1a0509] shadow-2xl border-[#D4AF37]' : 'bg-gradient-to-r from-white/5 to-transparent hover:from-white/10'}
            ${player ? 'border-[#D4AF37]/30' : 'border-white/5'} cursor-grab active:cursor-grabbing`}
        >
            {/* Fondo decorativo con el número */}
            <span className="absolute left-2 text-6xl font-black italic text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">
                {index + 1}
            </span>

            {/* Contenedor de contenido */}
            <div className="relative z-10 flex items-center w-full gap-4">
                {/* Número de orden visible */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-black/40 border border-white/10 text-[#D4AF37] font-black text-[10px] shadow-inner">
                    {index + 1}
                </div>

                {player ? (
                    <>
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-lg bg-black/50">
                            <img
                                src={headshot(player.personId)}
                                onError={(e) => handleImageError(e, player.personId)}
                                alt={player.name}
                                className="w-full h-full object-cover transform scale-125 translate-y-1"
                                draggable="false"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold bg-[#D4AF37] text-[#1a0509] px-1.5 rounded-sm uppercase">
                                    {currentPos}
                                </span>
                            </div>
                            <div className="text-white font-bold text-sm truncate uppercase tracking-tight">
                                {player.name}
                            </div>
                        </div>

                        {!isOverlay && onRemove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onRemove()
                                }}
                                className="p-2 text-white/40 hover:text-red-400 transition-opacity"
                                title="Quitar"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                ✕
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center h-9">
                        <div className="h-1 w-12 bg-white/10 rounded-full mb-1"></div>
                        <div className="h-2 w-24 bg-white/5 rounded-full"></div>
                        <span className="text-[8px] text-white/20 mt-0.5 uppercase tracking-wider font-bold">Seleccionar</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function LineupPanel() {
    const lineup = useGameStore((s) => s.lineup)
    const setLineupSlot = useGameStore((s) => s.setLineupSlot)
    const removeFromLineup = useGameStore((s) => s.removeFromLineup)
    const reorderLineup = useGameStore((s) => s.reorderLineup)

    const [modalSlot, setModalSlot] = useState(null)
    const [activeId, setActiveId] = useState(null)

    // Referencia al contenedor para el portal del DragOverlay
    const panelRef = useRef(null)

    // Configuración de sensores
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const items = lineup.map((_, index) => `slot-${index}`)

    const handleDragStart = (event) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id)
            const newIndex = items.indexOf(over.id)

            const newLineup = arrayMove(lineup, oldIndex, newIndex)
            reorderLineup(newLineup)
        }

        setActiveId(null)
    }

    const handleSlotClick = (index) => {
        setModalSlot(index)
    }

    const dropAnimationConfig = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <div
                ref={panelRef}
                className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white shadow-2xl h-full flex flex-col"
            >
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div>
                        <h2 className="text-2xl font-black italic text-white leading-none">LINEUP</h2>
                        <p className="text-[8px] text-[#D4AF37] font-bold mt-1 tracking-widest uppercase opacity-80">Orden al bate</p>
                    </div>
                </div>

                <div className="space-y-1.5 p-1">
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        {lineup.map((playerId, index) => (
                            <SortableLineupItem
                                key={`slot-${index}`}
                                id={`slot-${index}`}
                                playerId={playerId}
                                index={index}
                                onRemove={() => removeFromLineup(index)}
                                onClick={() => handleSlotClick(index)}
                            />
                        ))}
                    </SortableContext>
                </div>

                {/* NOTA: portalContainer={panelRef.current} asegura que el overlay se rinda dentro del sidebar
                    eliminando los problemas de offset por márgenes globales o sticky positioning */}
                <DragOverlay
                    dropAnimation={dropAnimationConfig}
                    portalContainer={panelRef.current}
                >
                    {activeId ? (
                        <div className="w-full">
                            <LineupCard
                                player={lineup[items.indexOf(activeId)] ? PLAYER_MAP[lineup[items.indexOf(activeId)]] : null}
                                index={items.indexOf(activeId)}
                                isOverlay
                            />
                        </div>
                    ) : null}
                </DragOverlay>

                <PlayerSelectorModal
                    position={modalSlot !== null ? `Bateador ${modalSlot + 1}` : null}
                    onClose={() => setModalSlot(null)}
                    onSelect={(pid) => {
                        setLineupSlot(modalSlot, pid)
                        setModalSlot(null)
                    }}
                />

            </div>
        </DndContext>
    )
}
