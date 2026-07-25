import { motion } from 'framer-motion'
import { SCALE_MIN, SCALE_MAX } from '../utils/tshirtCanvas'

const ALIGN_OPTIONS = [
  ['left', 'Left'], ['center', 'Center'], ['right', 'Right'],
  ['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom'],
]

/* Shared "Adjust Design" panel: big Auto Position toggle (locks manual
   controls while on) plus manual zoom + 6-way alignment + reset. */
export default function DesignAdjustPanel({ adjust }) {
  const {
    autoPosition, toggleAutoPosition, resetDesignTransform,
    designScale, updateDesignScale, alignDesign,
  } = adjust

  return (
    <div className="border border-white/10 p-6">

      {/* Auto Position — big toggle, on by default */}
      <button
        onClick={toggleAutoPosition}
        className="w-full flex items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10 text-left"
      >
        <div>
          <p className="text-sm font-black tracking-wide text-white">Auto Position</p>
          <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">
            Fits your design at its original proportions for the best print size &amp; placement — no adjustment needed.
          </p>
        </div>
        <span
          className="relative flex-shrink-0 w-14 h-8 rounded-full transition-colors duration-300"
          style={{ background: autoPosition ? '#C8F135' : 'rgba(255,255,255,0.1)' }}
        >
          <motion.span
            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black"
            animate={{ x: autoPosition ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </span>
      </button>

      {autoPosition ? (
        <p className="text-[10px] text-white/25 leading-relaxed">
          🔒 Positioning, resizing &amp; alignment are locked while Auto Position is on. Turn it off to adjust manually.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Manual Adjust</p>
            <button
              onClick={resetDesignTransform}
              className="text-[10px] font-bold text-white/30 hover:text-[#C8F135] uppercase tracking-widest transition-colors"
            >
              ↺ Reset
            </button>
          </div>

          {/* Zoom / resize */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Size</span>
              <span className="text-xs font-black text-[#C8F135]">{Math.round(designScale * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateDesignScale(designScale - 0.1)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors"
              >
                −
              </button>
              <input
                type="range"
                min={SCALE_MIN * 100}
                max={SCALE_MAX * 100}
                value={Math.round(designScale * 100)}
                onChange={e => updateDesignScale(Number(e.target.value) / 100)}
                className="flex-1 accent-[#C8F135]"
              />
              <button
                onClick={() => updateDesignScale(designScale + 0.1)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-2">Align</span>
            <div className="grid grid-cols-3 gap-1.5">
              {ALIGN_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => alignDesign(key)}
                  className="text-[10px] font-bold border border-white/15 py-2 text-white/50 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors uppercase tracking-wider"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-white/20 mt-4 leading-relaxed">
            Drag the design directly on the preview to reposition it.
          </p>
        </>
      )}
    </div>
  )
}
