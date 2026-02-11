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

  // Resetear todo
  reset: () =>
    set({
      field: { ...initialField },
      bench: [],
    }),
}))
