interface SilhouetteParams {
  lengthRatio: number;
  volume: number;
  fringe: boolean;
  curlPattern: 'none' | 'wave' | 'curl' | 'coil';
}

interface Pt {
  x: number;
  y: number;
}

function smoothPath(points: Pt[], close = false): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} `;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    d += `Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} `;
  }
  const last = points[points.length - 1];
  d += `L ${last.x.toFixed(1)} ${last.y.toFixed(1)} `;
  if (close) d += 'Z';
  return d;
}

/** Generates a decorative SVG path (a "d" attribute) approximating a hairstyle
 * silhouette from its length/volume/fringe/texture parameters. Used both for
 * catalog card art and as a translucent live try-on shape guide. */
export function hairSilhouettePath(
  s: SilhouetteParams,
  width = 200,
  height = 240,
): string {
  const cx = width / 2;
  const topY = height * 0.05;
  const bottomY = topY + (height - topY) * (0.3 + s.lengthRatio * 0.65);
  const headHalf = width * 0.24;
  const bulge = width * (0.26 + s.volume * 0.16);
  const waveAmp =
    s.curlPattern === 'none'
      ? 0
      : s.curlPattern === 'wave'
        ? width * 0.025
        : s.curlPattern === 'curl'
          ? width * 0.05
          : width * 0.065;
  const waveFreq = s.curlPattern === 'coil' ? 9 : s.curlPattern === 'curl' ? 6 : 4;

  const steps = 22;
  const left: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = topY + t * (bottomY - topY);
    let widthAtT: number;
    if (t < 0.35) {
      const tt = t / 0.35;
      widthAtT = headHalf + (bulge - headHalf) * Math.sin(tt * Math.PI * 0.5);
    } else {
      const tt = (t - 0.35) / 0.65;
      widthAtT = bulge * (1 - tt * 0.35);
    }
    const wave = waveAmp * Math.sin(t * Math.PI * waveFreq) * Math.min(1, t * 2);
    left.push({ x: cx - widthAtT + wave, y });
  }
  const right = left.map((p) => ({ x: cx + (cx - p.x), y: p.y })).reverse();
  const points = [...left, ...right];

  let fringeD = '';
  if (s.fringe) {
    const fy = topY + (bottomY - topY) * 0.1;
    fringeD = ` M ${(cx - headHalf * 0.7).toFixed(1)} ${fy.toFixed(1)} Q ${cx.toFixed(1)} ${(fy + height * 0.05).toFixed(1)} ${(cx + headHalf * 0.7).toFixed(1)} ${fy.toFixed(1)}`;
  }

  return smoothPath(points, true) + fringeD;
}
