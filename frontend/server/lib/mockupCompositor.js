const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CANVAS_SIZE = 1600; // export resolution for generated product mockups

const SHIRT_FILES = {
  front: path.join(__dirname, '..', '..', 'public', 'tshirt-front.png'),
  back: path.join(__dirname, '..', '..', 'public', 'tshirt-back.png'),
};

// Same print-area rectangle used by the interactive Mockup Generator (frontend/src/utils/tshirtCanvas.js PA)
const PA = { top: 0.22, left: 0.32, width: 0.36, height: 0.41 };

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/* Fit `srcW x srcH` inside `boxW x boxH` preserving aspect ratio (object-contain) */
function containFit(srcW, srcH, boxW, boxH) {
  const srcAR = srcW / srcH;
  const boxAR = boxW / boxH;
  return srcAR > boxAR
    ? { w: boxW, h: Math.round(boxW / srcAR) }
    : { w: Math.round(boxH * srcAR), h: boxH };
}

/*
  Generates one mockup PNG buffer: shirt (front/back) tinted to `colorHex`,
  with `designBuffer` composited centred inside the print area at its
  natural aspect ratio (equivalent to the interactive tool's "auto position":
  scale 1, no offset — so the design always fits inside the print-area box
  and no clipping is required).
*/
async function generateMockup({ view, colorHex, designBuffer }) {
  const shirtPath = SHIRT_FILES[view];
  if (!fs.existsSync(shirtPath)) throw new Error(`Missing shirt asset for view "${view}"`);

  const N = CANVAS_SIZE;
  const shirtMeta = await sharp(shirtPath).metadata();
  const fit = containFit(shirtMeta.width, shirtMeta.height, N, N);
  const shirtResized = await sharp(shirtPath).resize(fit.w, fit.h).toBuffer();
  const sx = Math.round((N - fit.w) / 2);
  const sy = Math.round((N - fit.h) / 2);

  // Base transparent canvas with the shirt centred on it
  const base = sharp({
    create: { width: N, height: N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: shirtResized, left: sx, top: sy }]);
  const baseBuffer = await base.png().toBuffer();

  // Solid colour, masked down to the shirt's own silhouette (alpha), i.e. Canvas's destination-in
  const { r, g, b } = hexToRgb(colorHex);
  const solidFill = await sharp({
    create: { width: N, height: N, channels: 4, background: { r, g, b, alpha: 1 } },
  }).png().toBuffer();
  const tintLayer = await sharp(solidFill)
    .composite([{ input: baseBuffer, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // sharp's .composite() replaces (not appends to) any prior composite call on
  // the same pipeline, so every layer must go into one array in one call.
  const layers = [{ input: tintLayer, blend: 'multiply' }];

  if (designBuffer) {
    const designMeta = await sharp(designBuffer).metadata();
    const paW = Math.round(N * PA.width);
    const paH = Math.round(N * PA.height);
    const paX = Math.round(N * PA.left);
    const paY = Math.round(N * PA.top);

    const designFit = containFit(designMeta.width, designMeta.height, paW, paH);
    const designResized = await sharp(designBuffer).resize(designFit.w, designFit.h).toBuffer();
    const dx = paX + Math.round((paW - designFit.w) / 2);
    const dy = paY + Math.round((paH - designFit.h) / 2);

    layers.push({ input: designResized, left: dx, top: dy });
  }

  return sharp(baseBuffer).composite(layers).png().toBuffer();
}

module.exports = { generateMockup, CANVAS_SIZE };
