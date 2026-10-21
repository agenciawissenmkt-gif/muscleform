// Prompts da IA — ficam SÓ no servidor. O navegador envia apenas o id do
// corte/cor escolhido; o texto em inglês é montado aqui.
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const ROOT = new URL('./prompts/', import.meta.url);

function loadDir(sub) {
  const map = new Map();
  const dir = new URL(`${sub}/`, ROOT);
  if (!existsSync(dir)) return map;
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()) {
    const data = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    for (const [id, prompt] of Object.entries(data)) {
      if (typeof prompt === 'string' && prompt.trim()) map.set(id, prompt.trim());
    }
  }
  return map;
}

export const cutPrompts = loadDir('cuts');
export const colorPrompts = loadDir('colors');

const PRESERVE = `STRICTLY PRESERVE everything that is not hair, exactly as in the original photo:
- The same person and identity: face shape, facial features, eyes and eye color, eyebrows, eyelashes, nose, lips, teeth, ears, skin tone, skin texture, freckles, moles, wrinkles and makeup. Do not beautify, retouch, smooth, slim, reshape, or make the person look younger or older.
- The same facial expression, head position and angle, pose, neck, body, hands, clothing, jewelry and accessories.
- The same background and scenery, every object in it, the lighting, shadows, white balance, colors of all non-hair areas, camera angle, framing, crop, zoom, perspective and sharpness.
FRAMING IS LOCKED: do not zoom in, zoom out, crop, reframe or re-center the photo. The head, face and shoulders must stay exactly the same size and in exactly the same position in the frame as in the original. If the new hair is longer than what fits in the picture, simply let it continue past the image border.
Where the new hair is shorter or no longer covers an area, reconstruct the neck, shoulders, clothing and background behind it faithfully and consistently with the rest of the original photo. Do not add hats, hair accessories, text, logos, watermarks or extra people.`;

const REALISM = `REALISM: a photorealistic professional salon result with strand-by-strand detail — individually visible hair strands, a natural hairline and parting that fit this person's head, realistic density, volume and gravity, a few natural flyaways, and shine, highlights and shadows that match the original lighting direction. The hair must sit naturally around the forehead, ears, neck and shoulders. It must not look like a wig, a helmet, a painting, plastic, CGI or a blurred edit; no artifacts, no halos around the head.`;

/**
 * Monta o prompt final. Pelo menos um de cutId / colorId deve existir.
 * Retorna null se algum id não estiver no catálogo.
 */
export function buildPrompt({ cutId, colorId }) {
  const cut = cutId ? cutPrompts.get(cutId) : null;
  const color = colorId ? colorPrompts.get(colorId) : null;
  if ((cutId && !cut) || (colorId && !color) || (!cut && !color)) return null;

  const change = [];
  if (cut) {
    change.push(`NEW HAIRCUT / HAIRSTYLE: ${cut}`);
    if (!color) {
      change.push(
        'HAIR COLOR: keep the current hair color exactly as it is now — the same tone, depth, highlights, lowlights and roots — just applied to the new haircut.',
      );
    }
  }
  if (color) {
    change.push(cut ? `NEW HAIR COLOR, applied to the new haircut: ${color}` : `NEW HAIR COLOR: ${color}`);
    if (!cut) {
      change.push(
        'HAIRCUT: keep the exact current haircut and hairstyle — the same length, shape, layers, fringe, parting, volume, curl pattern and texture. Change only the color of the existing hair.',
      );
    }
  }

  return [
    "Edit this photo for a hair salon virtual try-on. It is a real client's photograph: the result must look like the very same photograph, of the very same person, with only the hair changed.",
    `HAIR CHANGE:\n${change.join('\n')}`,
    PRESERVE,
    REALISM,
  ].join('\n\n');
}
