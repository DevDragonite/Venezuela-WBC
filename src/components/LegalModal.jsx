import { createPortal } from 'react-dom'

export default function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal con glassmorphism */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <h2 id="legal-modal-title" className="mb-4 text-xl font-bold text-dorado">
          Aviso Legal
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-white/90">
          Este proyecto es <strong>fan-made</strong> y se realiza <strong>sin fines de lucro</strong>.
          No está afiliado ni respaldado por la MLB, la WBSC, ni ninguna organización oficial.
          Todos los nombres e imágenes son propiedad de sus respectivos titulares.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-dorado px-4 py-3 font-semibold text-fondo transition-colors hover:bg-dorado/90 active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body
  )
}
