import type { MetadataRoute } from 'next';

import { createServerClient } from '@supabase/ssr';

import { generateUsernameSlug, getAppUrl } from '@/lib/utils';
import { Database } from '@/types/database/schema';

const MAX_URLS_PER_SITEMAP = 50_000;
const DEFAULT_LOCALE = 'fr';
const OTHER_LOCALE = 'en';

// With alternates.languages, each professional generates 1 URL entry (not 2)
// Reserve some space for static pages in sitemap 0
const STATIC_PAGES_COUNT = 6; // home (1) + professionals list (1) + auth (3) + faq (1)
// Professionals that fit in sitemap 0 (accounting for static pages)
const PROFESSIONALS_PER_SITEMAP_0 = Math.max(
  0,
  MAX_URLS_PER_SITEMAP - STATIC_PAGES_COUNT
);
// Professionals that fit in subsequent sitemaps (full capacity)
const PROFESSIONALS_PER_SITEMAP = MAX_URLS_PER_SITEMAP;

export async function generateSitemaps() {
  try {
    const supabase = createServiceRoleClient();

    // Get total count of professionals
    const { count, error } = await supabase
      .from('professionals_with_profiles_search')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching professionals count for sitemap:', error);
      // Return at least one sitemap for static pages
      return [{ id: '0' }];
    }

    const totalProfessionals = count ?? 0;

    // Calculate number of sitemaps needed
    // Sitemap 0: static pages + first batch of professionals
    // Sitemap 1+: remaining professionals
    if (totalProfessionals === 0) {
      return [{ id: '0' }];
    }

    // Calculate how many professionals fit in sitemap 0
    const professionalsInSitemap0 = Math.min(
      totalProfessionals,
      PROFESSIONALS_PER_SITEMAP_0
    );

    // Calculate remaining professionals
    const remainingProfessionals = Math.max(
      0,
      totalProfessionals - professionalsInSitemap0
    );

    // Calculate additional sitemaps needed for remaining professionals
    const additionalSitemaps =
      remainingProfessionals > 0
        ? Math.ceil(remainingProfessionals / PROFESSIONALS_PER_SITEMAP)
        : 0;

    const sitemapsNeeded = 1 + additionalSitemaps;

    return Array.from({ length: sitemapsNeeded }, (_, i) => ({
      id: i.toString(),
    }));
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    // Return at least one sitemap for static pages
    return [{ id: '0' }];
  }
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await id;
  const appUrl = getAppUrl();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  const sitemapIndex = parseInt(sitemapId, 10);

  // Add static pages only to the first sitemap (id: 0)
  if (sitemapIndex === 0) {
    // Add home page with language alternates
    sitemapEntries.push({
      alternates: {
        languages: {
          [DEFAULT_LOCALE]: `${appUrl}/${DEFAULT_LOCALE}/`,
          [OTHER_LOCALE]: `${appUrl}/${OTHER_LOCALE}/`,
        },
      },
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 1.0,
      url: `${appUrl}/${DEFAULT_LOCALE}/`,
    });

    // Add professionals list page with language alternates
    sitemapEntries.push({
      alternates: {
        languages: {
          [DEFAULT_LOCALE]: `${appUrl}/${DEFAULT_LOCALE}/professionals`,
          [OTHER_LOCALE]: `${appUrl}/${OTHER_LOCALE}/professionals`,
        },
      },
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 0.9,
      url: `${appUrl}/${DEFAULT_LOCALE}/professionals`,
    });

    // Add auth pages with language alternates
    const authPages = ['login', 'sign-up', 'forgot-password'];
    authPages.forEach(authPage => {
      sitemapEntries.push({
        alternates: {
          languages: {
            [DEFAULT_LOCALE]: `${appUrl}/${DEFAULT_LOCALE}/auth/${authPage}`,
            [OTHER_LOCALE]: `${appUrl}/${OTHER_LOCALE}/auth/${authPage}`,
          },
        },
        changeFrequency: 'monthly',
        lastModified: new Date(),
        priority: 0.5,
        url: `${appUrl}/${DEFAULT_LOCALE}/auth/${authPage}`,
      });
    });

    // Add FAQ page with language alternates
    sitemapEntries.push({
      alternates: {
        languages: {
          [DEFAULT_LOCALE]: `${appUrl}/${DEFAULT_LOCALE}/faq`,
          [OTHER_LOCALE]: `${appUrl}/${OTHER_LOCALE}/faq`,
        },
      },
      changeFrequency: 'monthly',
      lastModified: new Date(),
      priority: 0.6,
      url: `${appUrl}/${DEFAULT_LOCALE}/faq`,
    });
  }

  // Fetch professionals for this sitemap
  try {
    const supabase = createServiceRoleClient();

    // Calculate the range of professionals for this sitemap
    let startIndex = 0;
    let endIndex = 0;

    if (sitemapIndex === 0) {
      // First sitemap: static pages + first batch of professionals
      if (PROFESSIONALS_PER_SITEMAP_0 > 0) {
        startIndex = 0;
        endIndex = PROFESSIONALS_PER_SITEMAP_0 - 1; // -1 because range is inclusive
      } else {
        // No space for professionals in sitemap 0, skip fetching
        return sitemapEntries;
      }
    } else {
      // Subsequent sitemaps: only professionals
      // Account for professionals already in sitemap 0
      startIndex =
        PROFESSIONALS_PER_SITEMAP_0 +
        (sitemapIndex - 1) * PROFESSIONALS_PER_SITEMAP;
      endIndex = startIndex + PROFESSIONALS_PER_SITEMAP - 1; // -1 because range is inclusive
    }

    // Only fetch if we have a valid range
    if (startIndex < 0 || endIndex < startIndex) {
      return sitemapEntries;
    }

    // Fetch professionals with pagination
    const { data: professionals, error } = await supabase
      .from('professionals_with_profiles_search')
      .select('user_id, first_name, last_name')
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching professionals for sitemap:', error);
    } else if (professionals && professionals.length > 0) {
      // Generate URLs for each professional profile with language alternates
      professionals.forEach(professional => {
        const username = generateUsernameSlug(
          professional.first_name,
          professional.last_name
        );

        // Only add if we have a valid username and user_id
        if (username && professional.user_id) {
          sitemapEntries.push({
            alternates: {
              languages: {
                [DEFAULT_LOCALE]: `${appUrl}/${DEFAULT_LOCALE}/professionals/${username}/${professional.user_id}`,
                [OTHER_LOCALE]: `${appUrl}/${OTHER_LOCALE}/professionals/${username}/${professional.user_id}`,
              },
            },
            changeFrequency: 'weekly',
            lastModified: new Date(),
            priority: 0.8,
            url: `${appUrl}/${DEFAULT_LOCALE}/professionals/${username}/${professional.user_id}`,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Continue with static pages even if professionals fetch fails
  }

  return sitemapEntries;
}

/**
 * Creates a Supabase service role client for sitemap generation
 * This bypasses RLS and doesn't require cookies
 */
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        // No-op: service role client doesn't need cookies
        return [];
      },
      setAll() {
        // No-op: service role client doesn't need to set cookies
      },
    },
  });
}
