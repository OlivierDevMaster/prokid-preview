export const AVATAR_COLOR_VARIANTS = [
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
] as const;

export type AvatarColorVariant = (typeof AVATAR_COLOR_VARIANTS)[number];

// Deterministic index to cycle avatar colors based on a seed (name/title)
export function getAvatarColorVariantIndex(seed: string): number {
  if (!seed) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % 997;
  }
  return Math.abs(hash) % AVATAR_COLOR_VARIANTS.length;
}
