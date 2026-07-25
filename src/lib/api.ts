import type { HairColor } from '../data/haircolors';
import type { Haircut } from '../data/haircuts';

export function buildTransformPrompt(haircut: Haircut | null, color: HairColor | null): string {
  const parts = [
    'Edit only the hair region of this portrait photo. Preserve the exact same face, facial features, identity, skin tone, expression, pose, clothing, and background. Photorealistic salon photography, natural lighting, high detail, no filters.',
  ];
  parts.push(
    haircut
      ? `Change the haircut to: ${haircut.name} — ${haircut.description}`
      : 'Keep the same haircut length, shape and volume.',
  );
  parts.push(
    color ? `Change the hair color to: ${color.name} — ${color.description}` : 'Keep the same natural hair color.',
  );
  return parts.join(' ');
}

export interface TransformResult {
  imageBase64: string;
}

export async function transformPhoto(
  imageBase64: string,
  maskBase64: string | null,
  prompt: string,
): Promise<TransformResult> {
  const res = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, maskBase64, prompt }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || 'Não foi possível gerar a transformação agora.');
  }
  return data as TransformResult;
}
