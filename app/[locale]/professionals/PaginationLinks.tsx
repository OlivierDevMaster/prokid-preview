'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { getAppUrl } from '@/lib/utils';

export function PaginationLinks() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const appUrl = getAppUrl();
  const baseUrl = `${appUrl}/${locale}/professionals`;

  // Calculate pagination URLs
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const prevUrl = prevPage
    ? prevPage === 1
      ? baseUrl
      : `${baseUrl}?page=${prevPage}`
    : null;
  const nextUrl = `${baseUrl}?page=${currentPage + 1}`;

  useEffect(() => {
    // Add or update pagination links in the head
    const head = document.head;

    // Remove existing pagination links
    const existingPrev = head.querySelector('link[rel="prev"]');
    const existingNext = head.querySelector('link[rel="next"]');
    if (existingPrev) existingPrev.remove();
    if (existingNext) existingNext.remove();

    // Add new pagination links
    if (prevUrl) {
      const prevLink = document.createElement('link');
      prevLink.rel = 'prev';
      prevLink.href = prevUrl;
      head.appendChild(prevLink);
    }

    const nextLink = document.createElement('link');
    nextLink.rel = 'next';
    nextLink.href = nextUrl;
    head.appendChild(nextLink);

    // Cleanup function
    return () => {
      const prev = head.querySelector('link[rel="prev"]');
      const next = head.querySelector('link[rel="next"]');
      if (prev) prev.remove();
      if (next) next.remove();
    };
  }, [currentPage, baseUrl, prevUrl, nextUrl]);

  return null;
}
