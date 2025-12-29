import {
  BreadcrumbJsonLd,
  FAQJsonLd,
  JsonLdScript,
  OrganizationJsonLd,
  ProfilePageJsonLd,
} from 'next-seo';

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface FAQPageSchemaProps {
  faqItems: Array<{
    answer: string;
    question: string;
  }>;
}

interface OrganizationSchemaProps {
  appUrl: string;
  description?: string;
  logo?: string;
  name?: string;
  url?: string;
}

interface PersonSchemaProps {
  appUrl: string;
  jobTitleTranslation?: string;
  locale: string;
  professional: {
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
  };
}

interface WebSiteSchemaProps {
  appUrl: string;
  description?: string;
  name?: string;
  searchActionUrl?: string;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <BreadcrumbJsonLd
      items={items.map((item, index) => ({
        item: item.url,
        name: item.name,
        position: index + 1,
      }))}
    />
  );
}

export function FAQPageSchema({ faqItems }: FAQPageSchemaProps) {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <FAQJsonLd
      questions={faqItems.map(item => ({
        answer: item.answer,
        question: item.question,
      }))}
    />
  );
}

export function OrganizationSchema({
  appUrl,
  description = 'La plateforme des pros de la petite enfance',
  logo = `${appUrl}/opengraph-image.png`,
  name = 'ProKid',
  url = appUrl,
}: OrganizationSchemaProps) {
  return (
    <OrganizationJsonLd
      description={description}
      logo={logo}
      name={name}
      sameAs={[]}
      url={url}
    />
  );
}

export function PersonSchema({
  appUrl,
  jobTitleTranslation,
  locale,
  professional,
}: PersonSchemaProps) {
  const fullName = `${professional.first_name || ''} ${
    professional.last_name || ''
  }`.trim();

  if (!fullName) {
    return null;
  }

  const profileUrl = `${appUrl}/${locale}/professionals/${professional.user_id}`;
  const imageUrl = professional.avatar_url || `${appUrl}/opengraph-image.png`;

  const personData = {
    name: fullName,
    ...(jobTitleTranslation && { jobTitle: jobTitleTranslation }),
    ...(professional.description && { description: professional.description }),
    image: imageUrl,
    url: profileUrl,
    ...(professional.city &&
      professional.postal_code && {
        address: {
          '@type': 'PostalAddress',
          addressCountry: locale === 'fr' ? 'FR' : 'GB',
          addressLocality: professional.city,
          postalCode: professional.postal_code,
        },
      }),
    ...(professional.rating !== null &&
      professional.reviews_count !== null &&
      professional.reviews_count > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          bestRating: 5,
          ratingValue: professional.rating,
          reviewCount: professional.reviews_count,
          worstRating: 0,
        },
      }),
  };

  return <ProfilePageJsonLd mainEntity={personData} />;
}

export function WebSiteSchema({
  appUrl,
  description = 'La plateforme des pros de la petite enfance',
  name = 'ProKid',
  searchActionUrl,
}: WebSiteSchemaProps) {
  const websiteSchema: {
    '@context': string;
    '@type': string;
    description: string;
    name: string;
    potentialAction?: {
      '@type': string;
      'query-input': string;
      target: {
        '@type': string;
        urlTemplate: string;
      };
    };
    url: string;
  } = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    description,
    name,
    url: appUrl,
  };

  if (searchActionUrl) {
    websiteSchema.potentialAction = {
      '@type': 'SearchAction',
      'query-input': 'required name=search_term_string',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchActionUrl,
      },
    };
  }

  return <JsonLdScript data={websiteSchema} scriptKey='website' />;
}
