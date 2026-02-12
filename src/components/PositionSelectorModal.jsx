import React from 'react';
import { useGameStore } from '../store/useGameStore';

const POSITIONS = {
    'OF': ['LF', 'CF', 'RF'],
    'IF': ['3B', 'SS', '2B', '1B'],
    'C_DH': ['C', 'DH']
};

export default function PositionSelectorModal({ player, onClose, onSelect }) {
    const field = useGameStore((s) => s.field);
    const rotation = useGameStore((s) => s.rotation);

    if (!player) return null;

    // Determine allowed positions based on player type
    const getAllowedPositions = (playerPos) => {
        if (playerPos === 'OF') return ['LF', 'CF', 'RF', 'DH'];
        if (playerPos === 'IF') return ['1B', '2B', '3B', 'SS', 'DH'];
        if (playerPos === 'C') return ['C', '1B', 'DH'];
        if (playerPos === 'C/1B') return ['C', '1B', 'DH'];
        if (playerPos === 'UT') return ['LF', 'CF', 'RF', '3B', 'SS', '2B', '1B', 'DH']; // All except C
        return ['DH']; // Default fallback
    };

    const allowedPositions = getAllowedPositions(player.position);

    const isPositionOccupied = (pos) => {
        return field[pos] !== null && field[pos] !== player.personId;
    };

    const handleSelect = (pos) => {
        if (isPositionOccupied(pos)) {
            // Optional: Shake animation or error message
            // For now, we rely on the disabled state styling, but this check is a safeguard
            return;
        }
        onSelect(pos);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1a0509] border border-[#D4AF37] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="text-center mb-6">
                    <h3 className="text-[#D4AF37] font-black uppercase text-xl italic tracking-wider mb-1">
                        Asignar Defensa
                    </h3>
                    <p className="text-white/80 text-sm">
                        ¿Dónde juega <span className="text-[#D4AF37] font-bold">{player.name}</span>?
                    </p>
                </div>

                {/* Grid of Positions (solo las disponibles) */}
                <div className="grid grid-cols-3 gap-3">
                    {allowedPositions
                        .filter((pos) => !isPositionOccupied(pos))
                        .map((pos) => (
                            <button
                                key={pos}
                                onClick={() => handleSelect(pos)}
                                className="h-14 rounded-xl flex items-center justify-center font-black text-lg transition-all border cursor-pointer bg-[#D4AF37] text-black border-[#D4AF37] hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95"
                            >
                                {pos}
                            </button>
                        ))}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 font-bold uppercase tracking-widest text-xs transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
