export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/** Perceptual luma in the 0-1 range. */
export function luma(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Average luma across a color's gradient stops, used to decide how much to
 * lighten/darken real hair before applying its hue (see LiveTryOnCanvas). */
export function averageSwatchLuma(swatch: string[]): number {
  const values = swatch.map((hex) => luma(...hexToRgb(hex)));
  return values.reduce((a, b) => a + b, 0) / values.length;
}
