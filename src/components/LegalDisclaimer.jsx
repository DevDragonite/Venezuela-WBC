import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function LegalDisclaimer({ onAccept }) {
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-500">
            <div className="max-w-2xl w-full bg-[#1a0509] border-2 border-[#D4AF37] rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(212,175,55,0.2)] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 border border-[#D4AF37]/30">
                    <ShieldAlert className="text-[#D4AF37] w-8 h-8" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-6">
                    Aviso Legal y Descargo de Responsabilidad
                </h2>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8">
                    <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
                        Este sitio web es una plataforma de entretenimiento creada por fanáticos y para fanáticos.
                        No tiene fines de lucro ni está afiliada, asociada, autorizada o respaldada por la
                        <span className="text-white font-bold text-[#D4AF37]/90 px-1">World Baseball Classic (WBC)</span>,
                        la <span className="text-white font-bold text-[#D4AF37]/90 px-1">MLB</span>,
                        la <span className="text-white font-bold text-[#D4AF37]/90 px-1">Federación Venezolana de Béisbol</span>
                        ni ninguna otra entidad oficial. Todas las marcas registradas pertenecen a sus respectivos dueños.
                    </p>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full md:w-auto px-12 py-4 bg-[#D4AF37] hover:bg-[#F2D06B] text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                >
                    ENTIENDO Y DESEO CONTINUAR
                </button>
            </div>
        </div>
    );
}
