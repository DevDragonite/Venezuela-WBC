import { create } from 'zustand'

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']

const initialField = Object.fromEntries(POSITIONS.map((p) => [p, null]))

export const useGameStore = create((set) => ({
  // Campo: { P: playerId | null, C: ..., 1B: ..., etc. }
  field: { ...initialField },

  // Banca: array de playerIds que no están en el campo
  bench: [],

  // Jugador seleccionado para colocar en el campo
  selectedPlayer: null,

  selectPlayer: (playerId) =>
    set((state) => ({
      selectedPlayer: state.selectedPlayer === playerId ? null : playerId,
    })),

  clearSelection: () => set({ selectedPlayer: null }),

  // Inicializar con jugadores disponibles
  initBench: (playerIds) =>
    set(() => ({
      bench: playerIds,
      field: { ...initialField },
    })),

  // Mover jugador: si la posición destino está ocupada, intercambiar
  movePlayer: (playerId, toPosition) =>
    set((state) => {
      const currentField = { ...state.field }
      const currentBench = [...state.bench]

      // Buscar de dónde viene el jugador (campo o banca)
      const fromPosition = Object.entries(currentField).find(
        ([_, id]) => id === playerId
      )?.[0]
      const fromBench = currentBench.includes(playerId)

      if (!fromPosition && !fromBench) return state

      const occupantId = currentField[toPosition]

      // Caso 1: Destino vacío
      if (!occupantId) {
        if (fromPosition) {
          currentField[fromPosition] = null
        } else {
          currentBench.splice(currentBench.indexOf(playerId), 1)
        }
        currentField[toPosition] = playerId
        return { field: currentField, bench: currentBench }
      }

      // Caso 2: Destino ocupado → INTERCAMBIO
      if (fromPosition) {
        // A y B están en el campo: intercambiar posiciones
        currentField[fromPosition] = occupantId
        currentField[toPosition] = playerId
      } else {
        // A viene de la banca, B está en el campo: B va a la banca, A al campo
        currentBench[currentBench.indexOf(playerId)] = occupantId
        currentField[toPosition] = playerId
      }

      return { field: currentField, bench: currentBench }
    }),

  // Sacar jugador al banco (posición → null, playerId → bench)
  removeFromField: (position) =>
    set((state) => {
      const playerId = state.field[position]
      if (!playerId) return state

      const newField = { ...state.field, [position]: null }
      const newBench = [...state.bench, playerId]
      return { field: newField, bench: newBench }
    }),

  // Lineup: Array de 9 slots para el orden al bate
  lineup: Array(9).fill(null),

  // Acción para asignar un jugador a un slot del lineup (0-8)
  setLineupSlot: (index, playerId) =>
    set((state) => {
      const newLineup = [...state.lineup]

      // Si el jugador ya está en otro slot, lo quitamos de allí (evitar duplicados en el lineup)
      const existingIndex = newLineup.indexOf(playerId)
      if (existingIndex !== -1 && existingIndex !== index) {
        newLineup[existingIndex] = null
      }

      newLineup[index] = playerId
      return { lineup: newLineup }
    }),

  // Reordenar todo el lineup
  reorderLineup: (newLineup) => set({ lineup: newLineup }),

  // Quitar jugador del lineup
  removeFromLineup: (index) =>
    set((state) => {
      const newLineup = [...state.lineup]
      newLineup[index] = null
      return { lineup: newLineup }
    }),

  // Rotation: Array de 4 slots para abridores (vs Israel, PR, Nic, RD)
  rotation: Array(4).fill(null),

  // Acción para asignar un pitcher a la rotación
  setRotationSlot: (index, playerId) =>
    set((state) => {
      const newRotation = [...state.rotation]

      // Si el pitcher ya está en otro slot de rotación, quitarlo de allí
      const existingIndex = newRotation.indexOf(playerId)
      if (existingIndex !== -1 && existingIndex !== index) {
        newRotation[existingIndex] = null
      }

      newRotation[index] = playerId
      return { rotation: newRotation }
    }),

  // Quitar pitcher de la rotación
  removeFromRotation: (index) =>
    set((state) => {
      const newRotation = [...state.rotation]
      newRotation[index] = null
      return { rotation: newRotation }
    }),

  // Resetear todo
  reset: () =>
    set({
      field: { ...initialField },
      bench: [],
      lineup: Array(9).fill(null),
      rotation: Array(4).fill(null),
      selectedPlayer: null,
      managerFullName: ''
    }),

  setManagerFullName: (name) => set({ managerFullName: name }),
}))
