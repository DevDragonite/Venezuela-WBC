import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ManagerNameModal({ isOpen, onConfirm, onClose }) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');

    if (!isOpen) return null;

    const handleConfirm = (e) => {
        e.preventDefault();
        if (nombre.trim() && apellido.trim()) {
            onConfirm(`${nombre.trim()} ${apellido.trim()}`);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-[#1a0509] border border-[#D4AF37]/30 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -z-10"></div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black italic text-[#D4AF37] tracking-tighter uppercase mb-2">
                        FIRMA TU ESTRATEGIA
                    </h2>
                    <div className="h-[1px] w-12 bg-[#D4AF37]/50 mx-auto mb-4"></div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        Ingresa tu nombre para el roster oficial
                    </p>
                </div>

                <form onSubmit={handleConfirm} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-widest ml-1">Nombre</label>
                        <input
                            autoFocus
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Juan"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-widest ml-1">Apellido</label>
                        <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            placeholder="Ej. Pérez"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-xl border border-white/10 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 px-6 rounded-xl bg-[#D4AF37] text-[#1a0509] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/20"
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
