import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import ProfessionalProfile from '@/features/professionals/components/ProfessionalProfile';
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

  return {
    description,
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
      url: `${appUrl}/${locale}/professionals/${expectedUsername || username}/${id}`,
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

export default function ProfessionalProfilePage() {
  return (
    <main className='min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8'>
      <ProfessionalProfile />
    </main>
  );
}

async function getProfessionalForMetadata(userId: string): Promise<{
  avatar_url: null | string;
  current_job: null | string;
  description: null | string;
  first_name: null | string;
  last_name: null | string;
} | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('professionals_with_profiles_search')
      .select('current_job, description, first_name, last_name, avatar_url')
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
