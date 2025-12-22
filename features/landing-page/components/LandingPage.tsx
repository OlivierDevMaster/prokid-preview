'use client';

import { CTASection } from './CTASection';
import { FAQSection } from './FAQSection';
import { FeaturesSection } from './FeaturesSection';
import { HeroSection } from './HeroSection';
import { SubscriptionSection } from './SubscriptionSection';

export function LandingPage() {
  return (
    <div className='flex min-h-screen w-full flex-col'>
      <HeroSection />
      <FeaturesSection />
      <SubscriptionSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
