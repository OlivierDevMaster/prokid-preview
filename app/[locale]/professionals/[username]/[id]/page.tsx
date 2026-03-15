import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import ProfessionalProfile from '@/features/professionals/components/ProfessionalProfile';
import { PersonSchema } from '@/lib/seo/structured-data';
import { createClient } from '@/lib/supabase/server';
import { generateUsernameSlug, getAppUrl } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string; username: string }>;
}): Promise<Metadata> {
  const { id, locale, username } = await params;
  const t = await getTranslations({ locale, namespace: 'professional' });
  const tProfile = await getTranslations({
    locale,
    namespace: 'professional.profile',
  });
  const appUrl = getAppUrl();

  const professional = await getProfessionalForMetadata(id);

  if (!professional) {
    return {
      description: t('subtitle'),
      title: tProfile('notFound'),
    };
  }

  const fullName = `${professional.first_name || ''} ${
    professional.last_name || ''
  }`.trim();
  const jobTitle = professional.current_job
    ? t(`jobs.${professional.current_job}`)
    : '';
  const title = fullName
    ? `${fullName}${jobTitle ? ` - ${jobTitle}` : ''} `
    : t('title');
  const description =
    professional.description ||
    `${fullName ? `${fullName}. ` : ''}${t('subtitle')}`;

  const imageUrl = professional.avatar_url
    ? professional.avatar_url
    : `${appUrl}/opengraph-image.png`;

  const expectedUsername = generateUsernameSlug(
    professional.first_name,
    professional.last_name
  );

  const canonicalUrl = `${appUrl}/${locale}/professionals/${expectedUsername || username}/${id}`;
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const otherLocaleUrl = `${appUrl}/${otherLocale}/professionals/${expectedUsername || username}/${id}`;

  // Build keywords from skills and job title
  const keywords: string[] = [];
  if (jobTitle) {
    keywords.push(jobTitle);
  }
  if (professional.skills && professional.skills.length > 0) {
    keywords.push(...professional.skills);
  }
  if (fullName) {
    keywords.push(fullName);
  }

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        [locale]: canonicalUrl,
        [otherLocale]: otherLocaleUrl,
      },
    },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      description,
      images: [
        {
          alt: fullName || title,
          height: professional.avatar_url ? undefined : 630,
          url: imageUrl,
          width: professional.avatar_url ? undefined : 1200,
        },
      ],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: 'ProKid',
      title,
      type: 'profile',
      url: canonicalUrl,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [imageUrl],
      title,
    },
  };
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string; username: string }>;
}) {
  const { id, locale } = await params;
  const appUrl = getAppUrl();
  const t = await getTranslations({ locale, namespace: 'professional' });

  const professional = await getProfessionalForSchema(id);

  return (
    <>
      {professional && (
        <PersonSchema
          appUrl={appUrl}
          jobTitleTranslation={
            professional.current_job
              ? t(`jobs.${professional.current_job}`)
              : undefined
          }
          locale={locale}
          professional={professional}
        />
      )}
      <ProfessionalProfile />
    </>
  );
}

async function getProfessionalForMetadata(userId: string): Promise<{
  avatar_url: null | string;
  current_job: null | string;
  description: null | string;
  first_name: null | string;
  last_name: null | string;
  skills: null | string[];
} | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('professionals_with_profiles_search')
      .select(
        'current_job, description, first_name, last_name, avatar_url, skills'
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

async function getProfessionalForSchema(userId: string): Promise<{
  avatar_url: null | string;
  city: null | string;
  current_job: null | string;
  description: null | string;
  first_name: null | string;
  last_name: null | string;
  postal_code: null | string;
  rating: null | number;
  reviews_count: null | number;
  user_id: string;
} | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('professionals_with_profiles_search')
      .select(
        'user_id, current_job, description, first_name, last_name, avatar_url, city, postal_code, rating, reviews_count'
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const { user_id } = data;
    if (!user_id) {
      return null;
    }

    // TypeScript now knows user_id is string (not null)
    return {
      avatar_url: data.avatar_url,
      city: data.city,
      current_job: data.current_job,
      description: data.description,
      first_name: data.first_name,
      last_name: data.last_name,
      postal_code: data.postal_code,
      rating: data.rating,
      reviews_count: data.reviews_count,
      user_id,
    };
  } catch {
    return null;
  }
}
