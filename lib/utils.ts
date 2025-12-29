import { type ClassValue, clsx } from 'clsx';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Generates a URL-friendly username slug from first name and last name
 * Format: lastname-firstname (lowercase, hyphenated)
 * @param firstName - First name (optional)
 * @param lastName - Last name (optional)
 * @returns Username slug or empty string if both names are missing
 */
export function generateUsernameSlug(
  firstName: null | string | undefined,
  lastName: null | string | undefined
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();

  if (!first && !last) {
    return '';
  }

  const slugifyOptions = {
    lower: true,
    strict: true,
    trim: true,
  };

  const cleanedFirst = first ? slugify(first, slugifyOptions) : '';
  const cleanedLast = last ? slugify(last, slugifyOptions) : '';

  if (cleanedLast && cleanedFirst) {
    return `${cleanedLast}-${cleanedFirst}`;
  }

  return cleanedLast || cleanedFirst || '';
}

/**
 * Gets the application URL from environment variables.
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL (explicitly set)
 * 2. VERCEL_URL (for Vercel deployments)
 * 3. localhost:3000 (default for local development)
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}
