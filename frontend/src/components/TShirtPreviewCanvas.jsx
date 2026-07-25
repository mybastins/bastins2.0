import { SHIRT_BASE, PA, BLUE, BLUE_BDR, BLUE_ICON, maskStyle } from '../utils/tshirtCanvas'

/* Shared shirt mockup canvas: base shirt + colour-multiply overlay + print
   area with the uploaded design (drag/zoom driven by useDesignAdjust).
   Used by both the customer "Design Your Own" tool and the admin Mockup
   Generator so they always render identically. */
export default function TShirtPreviewCanvas({ selectedColor, adjust, onUploadClick, canvasRef, shirtSrc = SHIRT_BASE, printArea = PA }) {
  const {
    uploadedImage, designPos, designScale, autoPosition,
    setImgNatural, handleDragStart, handleDragMove, handleDragEnd,
    printAreaRef,
  } = adjust

  return (
    <div
      ref={canvasRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '1 / 1', background: '#B2AFA6' }}
    >
      {/* Layer 1 — normalised grey shirt base */}
      <img
        src={shirtSrc}
        alt="T-shirt"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        onError={e => { e.target.src = '/tshirt-mockup.jpg' }}
      />

      {/* Layer 2 — colour overlay (multiply × grey base = realistic shirt colour)
          mask-image clips the solid colour div to the exact shirt silhouette
          so the canvas background is never tinted */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:    selectedColor,
          mixBlendMode:  'multiply',
          transition:    'background 0.25s ease',
          ...maskStyle(shirtSrc),
        }}
      />

      {/* ── Print area ── */}
      <div
        ref={printAreaRef}
        className="absolute"
        style={{ top: printArea.top, left: printArea.left, width: printArea.width, height: printArea.height }}
      >
        {uploadedImage ? (
          /* ── Design uploaded — drag to move, transform applied on the image itself
               so this wrapper's box stays stable for alignment measurement ── */
          <>
            <img
              src={uploadedImage}
              alt="custom design"
              draggable={false}
              onLoad={e => setImgNatural({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 })}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className={`w-full h-full object-contain select-none ${autoPosition ? 'cursor-default' : 'cursor-move'}`}
              style={{
                transform:      `translate(${designPos.x}px, ${designPos.y}px) scale(${designScale})`,
                transformOrigin: 'center center',
                touchAction:    'none',
              }}
            />
            {/* print-area guide — stays fixed as a reference while the design moves */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ border: `1.5px dashed ${BLUE_BDR}`, borderRadius: 3 }}
            />
            {autoPosition && (
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-2 py-1 pointer-events-none" style={{ borderRadius: 3 }}>
                <svg className="w-2.5 h-2.5 text-[#C8F135]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[8px] font-black tracking-widest uppercase text-[#C8F135]">Auto</span>
              </div>
            )}
          </>
        ) : (
          /* ── Empty — upload prompt ── */
          <button
            onClick={onUploadClick}
            className="w-full h-full flex flex-col items-center justify-center gap-2 group"
            style={{ background: BLUE, border: `2px dashed ${BLUE_BDR}`, borderRadius: 3 }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: BLUE_ICON }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: BLUE_ICON }}>
              Upload Design
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(38,99,235,0.6)' }}>
              14 × 16 in print area
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
