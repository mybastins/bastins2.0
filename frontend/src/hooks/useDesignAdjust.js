import { useState, useRef } from 'react'
import { SCALE_MIN, SCALE_MAX } from '../utils/tshirtCanvas'

/* Shared design-on-tshirt interaction logic: upload, drag-to-reposition,
   zoom, 6-way alignment, auto-position toggle, and edge clamping so the
   design can never be moved/zoomed past the print-area border. Used by
   both the customer "Design Your Own" tool and the admin Mockup Generator. */
export function useDesignAdjust() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [designPos,     setDesignPos]     = useState({ x: 0, y: 0 })
  const [designScale,   setDesignScale]   = useState(1)
  const [imgNatural,    setImgNatural]    = useState({ w: 1, h: 1 })
  const [autoPosition,  setAutoPosition]  = useState(true)

  const printAreaRef = useRef()
  const dragState    = useRef(null)

  function resetDesignTransform() {
    setDesignPos({ x: 0, y: 0 })
    setDesignScale(1)
  }

  function toggleAutoPosition() {
    setAutoPosition(prev => {
      const next = !prev
      if (next) resetDesignTransform() // re-snap to the optimized fit when turning auto back on
      return next
    })
  }

  function loadImage(dataUrl) {
    setUploadedImage(dataUrl)
    resetDesignTransform()
  }

  function clearImage() {
    setUploadedImage(null)
    resetDesignTransform()
  }

  /* How the design renders (object-contain) inside the print area */
  function getFitSize(box) {
    const imgAR = imgNatural.w / imgNatural.h
    const boxAR = box.width / box.height
    return imgAR > boxAR
      ? { fitW: box.width, fitH: box.width / imgAR }
      : { fitW: box.height * imgAR, fitH: box.height }
  }

  /* Clamp so the design's edges can never cross the print-area border:
     when smaller than the box it's confined inside; when zoomed in past
     the box it can pan but must always fully cover it (no gaps) — same
     behaviour as a standard photo-crop tool. */
  function clampPos(x, y, scale) {
    const box = printAreaRef.current?.getBoundingClientRect()
    if (!box || !box.width || !box.height) return { x, y }
    const { fitW, fitH } = getFitSize(box)
    const effW = fitW * scale
    const effH = fitH * scale
    const maxX = Math.abs(box.width - effW) / 2
    const maxY = Math.abs(box.height - effH) / 2
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    }
  }

  function updateDesignScale(newScale) {
    const scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, newScale))
    setDesignScale(scale)
    setDesignPos(prev => clampPos(prev.x, prev.y, scale))
  }

  /* ── Drag to reposition (mouse + touch, unified via Pointer Events) ── */
  function handleDragStart(e) {
    if (autoPosition) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: designPos.x, origY: designPos.y }
  }
  function handleDragMove(e) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    setDesignPos(clampPos(dragState.current.origX + dx, dragState.current.origY + dy, designScale))
  }
  function handleDragEnd(e) {
    dragState.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
  }

  /* ── Alignment — snaps the design to an edge/centre of the print area ── */
  function alignDesign(edge) {
    const box = printAreaRef.current?.getBoundingClientRect()
    if (!box || !box.width || !box.height) return
    const { fitW, fitH } = getFitSize(box)
    const effW = fitW * designScale
    const effH = fitH * designScale

    setDesignPos(prev => {
      const next = { ...prev }
      if (edge === 'left')   next.x = -(box.width - effW) / 2
      if (edge === 'right')  next.x =  (box.width - effW) / 2
      if (edge === 'center') next.x = 0
      if (edge === 'top')    next.y = -(box.height - effH) / 2
      if (edge === 'bottom') next.y =  (box.height - effH) / 2
      if (edge === 'middle') next.y = 0
      return next
    })
  }

  return {
    uploadedImage, loadImage, clearImage,
    designPos, designScale, imgNatural, setImgNatural,
    autoPosition, toggleAutoPosition, resetDesignTransform,
    updateDesignScale, alignDesign,
    handleDragStart, handleDragMove, handleDragEnd,
    printAreaRef,
  }
}
