// Brand color palette — single source of truth from Brand Current.md Section 2B

export const BRAND_PALETTE = {
  primary: {
    goldenYellow:  { hex: '#FBC02D', rgb: [251, 192, 45] },
    warmAmber:     { hex: '#F9A825', rgb: [249, 168, 37] },
    burntOrange:   { hex: '#F47C2C', rgb: [244, 124, 44] },
    deepOrange:    { hex: '#F05A28', rgb: [240, 90, 40] },
  },
  surface: {
    pageBg:        { hex: '#F4F1EA', rgb: [244, 241, 234] },
    cardBg:        { hex: '#F6F2E8', rgb: [246, 242, 232] },
    deepCream:     { hex: '#EAE4D8', rgb: [234, 228, 216] },
    neutralFill:   { hex: '#E7E2D8', rgb: [231, 226, 216] },
    divider:       { hex: '#E3DDD2', rgb: [227, 221, 210] },
    faqBg:         { hex: '#EBE6DA', rgb: [235, 230, 218] },
  },
  text: {
    charcoal:      { hex: '#2F2F2F', rgb: [47, 47, 47] },
    midGrey:       { hex: '#6E6E6E', rgb: [110, 110, 110] },
    lightGrey:     { hex: '#BDBDBD', rgb: [189, 189, 189] },
  },
  dark: {
    darkBg:        { hex: '#1A1713', rgb: [26, 23, 19] },
    darkBg2:       { hex: '#1A1714', rgb: [26, 23, 20] },
    darkText:      { hex: '#EDE8DF', rgb: [237, 232, 223] },
    darkTextSec:   { hex: '#8C8479', rgb: [140, 132, 121] },
  },
  functional: {
    heritageSteel: { hex: '#4A7FA5', rgb: [74, 127, 165] },
    error:         { hex: '#C0392B', rgb: [192, 57, 43] },
    success:       { hex: '#7D9B4E', rgb: [125, 155, 78] },
    successLight:  { hex: '#E8F5E9', rgb: [232, 245, 233] },
    successDark:   { hex: '#2E7D32', rgb: [46, 125, 50] },
    errorLight:    { hex: '#FFEBEE', rgb: [255, 235, 238] },
    errorDark:     { hex: '#C62828', rgb: [198, 40, 40] },
  },
};

// Flatten all approved RGB values
export const ALL_APPROVED_RGBS = Object.values(BRAND_PALETTE)
  .flatMap(group => Object.values(group).map(c => c.rgb));

// Check if RGB is within tolerance of any approved color
export function isApprovedColor(r, g, b, tolerance = 15) {
  return ALL_APPROVED_RGBS.some(([ar, ag, ab]) =>
    Math.abs(r - ar) <= tolerance &&
    Math.abs(g - ag) <= tolerance &&
    Math.abs(b - ab) <= tolerance
  );
}

// Parse "rgb(r, g, b)" or "rgba(r, g, b, a)" string to [r, g, b]
export function parseRgb(str) {
  if (!str || str === 'transparent' || str === 'none') return null;
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

// Check if a color is in the cool/forbidden range (hue 180-300)
export function isCoolTone(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  if (delta < 0.05) return false; // achromatic / near-grey
  let hue;
  if (max === r / 255) hue = ((g / 255 - b / 255) / delta) % 6;
  else if (max === g / 255) hue = (b / 255 - r / 255) / delta + 2;
  else hue = (r / 255 - g / 255) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  // Cool range: blue through purple (180-300)
  // Exempt Heritage Steel and functional colors
  if (isApprovedColor(r, g, b)) return false;
  return hue >= 180 && hue <= 300;
}

// Check for banned pure white/black
export function isPureWhite(r, g, b) {
  return r >= 253 && g >= 253 && b >= 253;
}

export function isPureBlack(r, g, b) {
  return r <= 2 && g <= 2 && b <= 2;
}
